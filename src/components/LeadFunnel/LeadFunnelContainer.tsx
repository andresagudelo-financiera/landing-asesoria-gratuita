import React, { useState, useEffect, useRef } from 'react';
import DynamicForm from './DynamicForm';
import CalendarPicker from './CalendarPicker';
import ConfirmationView from './ConfirmationView';
import { funnelConfig } from './formConfig';

// 1 = DynamicForm (Perfilamiento)
// 2 = CalendarPicker (Agendamiento)
// 3 = ConfirmationView (Finalizado)
// 4 = DisqualifiedView (Fin de perfilamiento sin agenda)
import { generateLeadId } from '../../utils/generateLeadId';
type FunnelStage = 1 | 2 | 3 | 4;

// ==========================================
// FASE 1: TIPOS Y HELPERS DE ENRIQUECIMIENTO
// ==========================================
type NivelCalificacion = 'Alta' | 'Media' | 'Baja';

// [FASE 4] Declaración global del widget de Calendly
declare global {
    interface Window {
        Calendly?: {
            initPopupWidget: (options: { url: string }) => void;
        };
    }
}

interface LeadEnrichment {
    agencia: string;
    fuente: string;
    nivel_calificacion: NivelCalificacion;
}




// ==========================================
// FEATURE TOGGLE PARA AGENDAMIENTO
// ==========================================
// Cambia a 'true' para permitir agendar en Google Calendar.
// Cambia a 'false' para capturar el lead pero NO pedir fecha de reunión.
const ENABLE_CALENDAR_SCHEDULING = false;
const getSavedUTMs = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};

    // 1. Priorizar parámetros de la URL actual
    const params = new URLSearchParams(window.location.search);
    const utms: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
        if (key.startsWith("utm_") || key === "type" || key === "coach") {
            utms[key] = value;
        }
    }

    if (Object.keys(utms).length > 0) {
        return utms; // Si vienen en la URL, usamos esos (los más recientes)
    }

    // 2. Fallback a sessionStorage si la URL está limpia
    try {
        const stored = sessionStorage.getItem("saved_utms");
        if (stored) return JSON.parse(stored);
    } catch (e) { }

    return {};
};

export default function LeadFunnelContainer() {
    // Helpers internos para asegurar que funnelConfig y otros imports estén en scope
    const calcularAtribucion = (utms: Record<string, string>): Pick<LeadEnrichment, 'agencia' | 'fuente'> => {
        const source = (utms['utm_source'] || '').toLowerCase().trim();
        const medium = (utms['utm_medium'] || '').toLowerCase().trim();

        // Si la fuente contiene 'ads' o 'meta', o el medio es 'ads' -> Atribuir a Agencia de Ads
        if (source.includes('ads') || source.includes('meta') || medium.includes('ads')) {
            return { agencia: 'Escalads Groupe', fuente: 'ADS' };
        }

        // Caso contrario, si hay alguna fuente pero no es de ads -> Orgánico
        if (source !== '') {
            return { agencia: 'Asygnuz', fuente: 'Organico' };
        }

        // Fallback por defecto
        return { agencia: 'Asygnuz', fuente: 'Organico' };
    };

    const calcularNivelCalificacion = (formData: Record<string, string>): NivelCalificacion => {
        let totalScore = 0;

        if (!funnelConfig || !funnelConfig.questions) {
            console.error("[ERROR] funnelConfig no está disponible en calcularNivelCalificacion");
            return 'Baja';
        }

        funnelConfig.questions.forEach(question => {
            if (question.weight && question.options) {
                const userResponse = formData[question.id];
                const selectedOption = question.options.find(opt => opt.value === userResponse);

                if (selectedOption && typeof selectedOption.scoreValue === 'number') {
                    totalScore += (selectedOption.scoreValue * question.weight);
                }
            }
        });


        if (totalScore >= 70) return 'Alta';
        if (totalScore >= 50) return 'Media';
        return 'Baja';
    };

    const [isOpen, setIsOpen] = useState(false);
    const [stage, setStage] = useState<FunnelStage>(1);
    const [leadData, setLeadData] = useState<Record<string, string>>({});
    const [scheduleData, setScheduleData] = useState<{ date: string, time: string } | null>(null);
    const [assignedCoach, setAssignedCoach] = useState<string | null>(null);
    const [assignedMeetLink, setAssignedMeetLink] = useState<string | null>(null);
    // [FASE 4] URL de Calendly del coach asignado
    const [calendlyUrl, setCalendlyUrl] = useState<string>('');
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);
    // [FASE 1] Estado de enriquecimiento: se calcula al completar el formulario
    const [leadEnrichment, setLeadEnrichment] = useState<LeadEnrichment>({
        agencia: 'Sin atribuir',
        fuente: 'Directo',
        nivel_calificacion: 'Baja',
    });
    const [formProgress, setFormProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [leadId, setLeadId] = useState<string>('');
    const leadIdRef = useRef<string>('');

    useEffect(() => {
        const handleOpen = () => {
            const newId = generateLeadId();
            setLeadId(newId);
            leadIdRef.current = newId;
            setIsOpen(true);

            // Sincronizar ID con Clarity y GTM de inmediato
            if (typeof window !== 'undefined') {
                const utms = getSavedUTMs();
                // Inyectar en dataLayer para GTM (Variable de capa de datos)
                (window as any).dataLayer = (window as any).dataLayer || [];
                (window as any).dataLayer.push({
                    lead_id: newId,
                    ...utms
                });

                if ('gtag' in window) {
                    (window as any).gtag('set', 'user_properties', { lead_id: newId });
                    (window as any).gtag('event', 'lead_form_start', {
                        lead_id: newId,
                        source: 'cta_button',
                        cta_source: 'cta_button',
                        ...utms
                    });
                }
                if (typeof (window as any).clarity === 'function') {
                    (window as any).clarity("set", "lead_id", newId);
                    (window as any).clarity("identify", newId);
                }
            }

            // Solo resetear si ya está en la etapa 3 o 4 (re-apertura tras éxito)
            if (stage === 3 || stage === 4) {
                setStage(1);
                setLeadData({});
                setScheduleData(null);
                setAssignedCoach(null);
                setAssignedMeetLink(null);
                setCalendlyUrl('');
                setFormProgress(0);
            }
        };

        window.addEventListener('open-lead-funnel', handleOpen);

        // Simular el Pixel "Landing" al montar modal
        return () => window.removeEventListener('open-lead-funnel', handleOpen);
    }, [stage]);

    // Bloquear scroll del body al abrir
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFormNext = async (data: Record<string, string>) => {
        setIsProcessing(true);
        setLeadData(data);

        // [FASE 1] Calcular atribución y calificación con los datos recién obtenidos
        const utms = getSavedUTMs();
        const { agencia, fuente } = calcularAtribucion(utms);
        const nivel_calificacion = calcularNivelCalificacion(data);
        const enrichment: LeadEnrichment = { agencia, fuente, nivel_calificacion };
        setLeadEnrichment(enrichment);

        // Si el lead es calificado como Bajo, redirigir al flujo de descalificados
        if (nivel_calificacion === 'Baja') {
            handleFormDisqualified(data);
            return;
        }

        // Evento GA4: Perfilamiento Completo (Lead) — enriquecido con atribución y calificación
        if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag('event', 'generate_lead', {
                lead_type: data.perfil || 'standard',
                income_range: data.ingresos || 'unknown',
                // [FASE 1] Propiedades de enriquecimiento
                agencia,
                fuente,
                calificacion_lead: nivel_calificacion,
                ...utms,
                lead_id: leadIdRef.current,
            });
        }

        // [FASE 1] Evento Meta Pixel: Lead — SOLO se dispara si el nivel es Alta o Media
        if (
            typeof window !== 'undefined' &&
            'fbq' in window &&
            (nivel_calificacion === 'Alta' || nivel_calificacion === 'Media')
        ) {
            (window as any).fbq('track', 'Lead', {
                content_category: nivel_calificacion,
                content_name: agencia,
                value: 0,
                currency: 'USD',
            });
        }

        // [FASE 4] Bypass de CalendarPicker: fetch inmediato + popup de Calendly
        if (ENABLE_CALENDAR_SCHEDULING) {
            const utmsFetch = getSavedUTMs();
            const { agencia: ag, fuente: fu, nivel_calificacion: nc } = enrichment;
            try {
                const res = await fetch('/api/calendar/schedule', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        skipCalendar: true,
                        leadDetails: {
                            ...data,
                            ...utmsFetch,
                            agencia: ag,
                            fuente: fu,
                            nivel_calificacion: nc,
                            lead_id: leadIdRef.current,
                        },
                    }),
                });
                const result = await res.json();

                if (result.success) {
                    setAlreadyRegistered(!!result.alreadyRegistered);
                    setAssignedCoach(result.coachName || result.coach || 'Tu Money Strategist(a)');

                    // [FASE 4] Guardar calendlyUrl en estado para pasársela a ConfirmationView
                    const url = result.calendlyUrl || 'https://calendly.com/default-financiera';
                    setCalendlyUrl(url);

                    // Abrir popup de Calendly con la URL del coach asignado
                    if (typeof window !== 'undefined' && window.Calendly) {
                        window.Calendly.initPopupWidget({ url });
                    } else {
                        console.warn('[CALENDLY] widget.js aún no cargó. Redirigiendo a URL.');
                        window.open(url, '_blank');
                    }
                } else {
                    setAssignedCoach('Tu Money Strategist(a)');
                }
            } catch (error) {
                console.error('[CALENDLY] Error al obtener URL del coach:', error);
                setAssignedCoach('Tu Money Strategist(a)');
            }

            setIsProcessing(false);
            // Stage 3 siempre se muestra (dentro del modal, detrás del popup)
            setStage(3);
        } else {
            handleSubmitLeadOnly(data, enrichment);
        }
    };

    // [FASE 1] Recibe enrichment como parámetro para garantizar consistencia sin depender del estado asíncrono
    const handleSubmitLeadOnly = async (data: Record<string, string>, enrichment: LeadEnrichment = leadEnrichment) => {
        setIsProcessing(true);
        const utms = getSavedUTMs();
        try {
            const res = await fetch('/api/calendar/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // [FASE 1] Payload enriquecido con atribución y calificación
                body: JSON.stringify({
                    skipCalendar: true,
                    leadDetails: {
                        ...data,
                        ...utms,
                        agencia: enrichment.agencia,
                        fuente: enrichment.fuente,
                        nivel_calificacion: enrichment.nivel_calificacion,
                        lead_id: leadIdRef.current,
                    }
                })
            });
            const result = await res.json();

            if (result.success) {
                setAlreadyRegistered(!!result.alreadyRegistered);
                setAssignedCoach(result.coachName || result.coach || "Tu Money Strategist(a)");
            } else {
                setAssignedCoach("Tu Money Strategist(a)");
            }
        } catch (error) {
            console.error("Error bypassing scheduling", error);
            setAssignedCoach("Tu Money Strategist(a)");
        } finally {
            setIsProcessing(false);
        }

        setAssignedMeetLink(null);
        setScheduleData(null);
        setStage(3);
    };

    // [FASE 1] async: los leads descalificados también se envían a Clint CRM (fire-and-forget, no bloquea la UI)
    const handleFormDisqualified = async (data: Record<string, string>) => {
        setIsProcessing(true);
        setLeadData(data);
        setStage(3); // UI unificada en ConfirmationView

        // [FASE 1] Calcular atribución para descalificados (fuente es igualmente valiosa para analítica)
        const utms = getSavedUTMs();
        const { agencia, fuente } = calcularAtribucion(utms);
        // Descalificados tienen siempre nivel Baja por definición
        const nivel_calificacion: NivelCalificacion = 'Baja';

        // Evento GA4: Perfilamiento Completo (Disqualified) — enriquecido
        if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag('event', 'generate_lead', {
                lead_type: 'disqualified',
                income_range: data.ingresos || 'unknown',
                // [FASE 1] Propiedades de enriquecimiento
                agencia,
                fuente,
                calificacion_lead: nivel_calificacion,
                ...utms,
                lead_id: leadIdRef.current,
            });
        }

        // [FASE 1] Meta Pixel: NO se dispara para leads descalificados (nivel siempre Baja en este path)

        // [FASE 1] Enviar lead descalificado a Clint CRM vía schedule.ts (skipCalendar=true)
        // Fire-and-forget: no bloqueamos la UI ni lanzamos errores al usuario
        try {
            await fetch('/api/calendar/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skipCalendar: true,
                    leadDetails: {
                        ...data,
                        ...utms,
                        agencia,
                        fuente,
                        nivel_calificacion,
                        lead_id: leadIdRef.current,
                    },
                }),
            });
        } catch (err) {
            // No propagamos el error: la UX (stage 4) ya está satisfecha
            console.error('[CRM] Error enviando lead descalificado a Clint:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSchedule = async (date: string, time: string, coachEmail: string) => {
        setIsProcessing(true);
        const utms = getSavedUTMs();
        // ... rest of the code ...
        // [FASE 1] Usar el enriquecimiento calculado al completar el formulario
        const { agencia, fuente, nivel_calificacion } = leadEnrichment;

        try {
            const res = await fetch('/api/calendar/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // [FASE 1] Payload enriquecido con atribución y calificación
                body: JSON.stringify({
                    date,
                    time,
                    coachEmail,
                    leadDetails: {
                        ...leadData,
                        ...utms,
                        agencia,
                        fuente,
                        nivel_calificacion,
                        lead_id: leadIdRef.current,
                    }
                })
            });
            const data = await res.json();

            if (data.success && data.coach) {
                setAlreadyRegistered(!!data.alreadyRegistered);
                setAssignedCoach(data.coach.name);
                setAssignedMeetLink(data.meetLink);
            } else {
                setAssignedCoach("Tu Money Strategist(a)");
            }
        } catch (error) {
            console.error("Error scheduling", error);
            setAssignedCoach("Tu Money Strategist(a)");
        } finally {
            setIsProcessing(false);
        }

        setScheduleData({ date, time });
        setStage(3);

        // Evento GA4: Agendamiento Completo (Schedule) — enriquecido con atribución
        if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag('event', 'schedule', {
                appointment_date: date,
                appointment_time: time,
                coach: assignedCoach,
                // [FASE 1] Propiedades de enriquecimiento
                agencia,
                fuente,
                calificacion_lead: nivel_calificacion,
                ...utms,
                lead_id: leadIdRef.current,
            });
        }

        // [FASE 1] Evento Meta Pixel: Schedule — se dispara para todos los que llegaron a agendar
        // (el filtro de calidad ya se aplicó en el evento Lead; si llegó aquí, ya calificó)
        if (typeof window !== 'undefined' && 'fbq' in window) {
            (window as any).fbq('track', 'Schedule', {
                content_name: 'Sesión Diagnóstico',
                content_category: nivel_calificacion,
                status: 'scheduled',
            });
        }
    };

    const currentProgress = stage === 1 ? formProgress : 100;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl bg-claudia-secondary border border-claudia-accent-orange/20 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[90vh] md:h-auto md:min-h-[600px] transition-all transform animate-in zoom-in-95 duration-500">

                {/* Header / Cerrar - Oculto en la confirmación 3 y 4 */}
                {(stage !== 3 && stage !== 4) && (
                    <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
                        <h2 className="text-xl font-bold text-claudia-accent-orange tracking-wider uppercase">
                            {stage === 1 ? 'Sesión de Diagnóstico' : 'Agenda tu Sesión'}
                        </h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/50 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                            aria-label="Cerrar modal"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 relative custom-scrollbar">
                    {isProcessing && (
                        <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-300">
                            <div className="w-16 h-16 border-4 border-claudia-accent-green/20 border-t-claudia-accent-green rounded-full animate-spin mb-6"></div>
                            <h3 className="text-2xl font-bold text-white mb-2">Procesando tus respuestas</h3>
                            <p className="text-white/60 text-center">Asignando tu Money Strategist.</p>
                        </div>
                    )}

                    {!isProcessing && stage === 1 && (
                        <DynamicForm
                            onNext={handleFormNext}
                            onDisqualified={handleFormDisqualified}
                            onProgressUpdate={setFormProgress}
                        />
                    )}
                    {/* 
                    {stage === 2 && (
                        <CalendarPicker
                            onSchedule={handleSchedule}
                            onBack={() => setStage(1)}
                        />
                    )} */}

                    {!isProcessing && stage === 3 && (
                        <ConfirmationView
                            onClose={() => setIsOpen(false)}
                            coachName={assignedCoach || "Tu Money Strategist(a)"}
                            calendlyUrl={calendlyUrl || undefined}
                            alreadyRegistered={alreadyRegistered}
                            nivelCalificacion={leadEnrichment.nivel_calificacion}
                        />
                    )}

                </div>

                {/* Progress Bar Header */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                    <div
                        className="h-full bg-claudia-accent-green transition-all duration-700 ease-in-out"
                        style={{ width: `${currentProgress}%` }}
                    />
                </div>

            </div>
        </div>
    );
}
