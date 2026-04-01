import React, { useState, useEffect } from 'react';
import DynamicForm from './DynamicForm';
import CalendarPicker from './CalendarPicker';
import ConfirmationView from './ConfirmationView';

// Fases del Funnel: 
// 1 = DynamicForm (Perfilamiento)
// 2 = CalendarPicker (Agendamiento)
// 3 = ConfirmationView (Finalizado)
// 4 = DisqualifiedView (Fin de perfilamiento sin agenda)
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

/**
 * Calcula agencia y fuente a partir del utm_source capturado.
 * Valores posibles de utm_source: 'meta' (Paid Meta Ads) | cualquier otro | vacío.
 */
function calcularAtribucion(utms: Record<string, string>): Pick<LeadEnrichment, 'agencia' | 'fuente'> {
    const source = (utms['utm_source'] || '').toLowerCase().trim();
    if (source === 'meta ads') {
        return { agencia: 'Escalads Groupe', fuente: 'ADS' };
    }
    if (source !== '') {
        return { agencia: 'Asygnuz', fuente: 'Organico' };
    }
    return { agencia: 'Sin atribuir', fuente: 'Directo' };
}

/**
 * Calcula el nivel de calificación del lead basándose en los ids y values
 * definidos estrictamente en formConfig.ts:
 *   ingresos: 'menos_3m' | '3m_5m' | '5m_10m' | 'mas_10m'
 *   flujo_caja: 'menos_300k' | '300k_800k' | '800k_1.5m' | '1.5m_3m' | 'mas_3m'
 *   capacidad_ahorro: 'menos_500k' | '500k_1.5m' | '1.5m_3m' | 'mas_3m'
 *   capital_liquido: 'menos_5m' | '5m_20m' | '20m_50m' | 'mas_50m'
 */
function calcularNivelCalificacion(formData: Record<string, string>): NivelCalificacion {
    const ingresos = formData['ingresos'] ?? '';
    const flujoCaja = formData['flujo_caja'] ?? '';
    const capacidadAhorro = formData['capacidad_ahorro'] ?? '';
    const capitalLiquido = formData['capital_liquido'] ?? '';

    const ahorroAlto = capacidadAhorro === '1.5m_3m' || capacidadAhorro === 'mas_3m';
    const capitalAlto = capitalLiquido === '20m_50m' || capitalLiquido === 'mas_50m';
    const flujoMedio = flujoCaja === '800k_1.5m' || flujoCaja === '1.5m_3m' || flujoCaja === 'mas_3m';

    // Alta: ingresos muy altos, o ingresos altos con capacidad de ahorro/capital significativos
    if (
        ingresos === 'mas_10m' ||
        (ingresos === '5m_10m' && ahorroAlto) ||
        (ingresos === '5m_10m' && capitalAlto)
    ) {
        return 'Alta';
    }

    // Media: ingresos altos sin capital/ahorro suficiente, o ingresos medios con buen flujo
    if (
        ingresos === '5m_10m' ||
        (ingresos === '3m_5m' && flujoMedio)
    ) {
        return 'Media';
    }

    return 'Baja';
}

/**
 * Event Listener global para abrir el embudo desde botones en Astro
 */
export const openLeadFunnel = () => {
    const event = new CustomEvent('open-lead-funnel');
    window.dispatchEvent(event);
};

// ==========================================
// FEATURE TOGGLE PARA AGENDAMIENTO
// ==========================================
// Cambia a 'true' para permitir agendar en Google Calendar.
// Cambia a 'false' para capturar el lead pero NO pedir fecha de reunión.
const ENABLE_CALENDAR_SCHEDULING = true;
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
    const [isOpen, setIsOpen] = useState(false);
    const [stage, setStage] = useState<FunnelStage>(1);
    const [leadData, setLeadData] = useState<Record<string, string>>({});
    const [scheduleData, setScheduleData] = useState<{ date: string, time: string } | null>(null);
    const [assignedCoach, setAssignedCoach] = useState<string | null>(null);
    const [assignedMeetLink, setAssignedMeetLink] = useState<string | null>(null);
    // [FASE 4] URL de Calendly del coach asignado
    const [calendlyUrl, setCalendlyUrl] = useState<string>('');
    // [FASE 1] Estado de enriquecimiento: se calcula al completar el formulario
    const [leadEnrichment, setLeadEnrichment] = useState<LeadEnrichment>({
        agencia: 'Sin atribuir',
        fuente: 'Directo',
        nivel_calificacion: 'Baja',
    });

    useEffect(() => {
        const handleOpen = () => {
            setIsOpen(true);

            // Evento GA4: Inicio de embudo
            if (typeof window !== 'undefined' && 'gtag' in window) {
                (window as any).gtag('event', 'lead_form_start', {
                    source: 'cta_button'
                });
            }

            // Solo resetear si ya está en la etapa 3 o 4
            if (stage === 4) {
                setStage(1);
                setLeadData({});
                setScheduleData(null);
                setAssignedCoach(null);
                setAssignedMeetLink(null);
                setCalendlyUrl('');
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
        setLeadData(data);

        // [FASE 1] Calcular atribución y calificación con los datos recién obtenidos
        const utms = getSavedUTMs();
        const { agencia, fuente } = calcularAtribucion(utms);
        const nivel_calificacion = calcularNivelCalificacion(data);
        const enrichment: LeadEnrichment = { agencia, fuente, nivel_calificacion };
        setLeadEnrichment(enrichment);

        // Evento GA4: Perfilamiento Completo (Lead) — enriquecido con atribución y calificación
        if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag('event', 'generate_lead', {
                lead_type: data.perfil || 'standard',
                income_range: data.ingresos || 'unknown',
                // [FASE 1] Propiedades de enriquecimiento
                agencia,
                fuente,
                calificacion_lead: nivel_calificacion,
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
                        },
                    }),
                });
                const result = await res.json();

                if (result.success) {
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

            // Stage 3 siempre se muestra (dentro del modal, detrás del popup)
            setStage(3);
        } else {
            handleSubmitLeadOnly(data, enrichment);
        }
    };

    // [FASE 1] Recibe enrichment como parámetro para garantizar consistencia sin depender del estado asíncrono
    const handleSubmitLeadOnly = async (data: Record<string, string>, enrichment: LeadEnrichment = leadEnrichment) => {
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
                    }
                })
            });
            const result = await res.json();

            if (result.success) {
                setAssignedCoach(result.coachName || result.coach || "Tu Money Strategist(a)");
            } else {
                setAssignedCoach("Tu Money Strategist(a)");
            }
        } catch (error) {
            console.error("Error bypassing scheduling", error);
            setAssignedCoach("Tu Money Strategist(a)");
        }

        setAssignedMeetLink(null);
        setScheduleData(null);
        setStage(3);
    };

    // [FASE 1] async: los leads descalificados también se envían a Clint CRM (fire-and-forget, no bloquea la UI)
    const handleFormDisqualified = async (data: Record<string, string>) => {
        setLeadData(data);
        setStage(4); // UI avanza inmediatamente, el fetch ocurre en background

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
                    },
                }),
            });
        } catch (err) {
            // No propagamos el error: la UX (stage 4) ya está satisfecha
            console.error('[CRM] Error enviando lead descalificado a Clint:', err);
        }
    };

    const handleSchedule = async (date: string, time: string, coachEmail: string) => {
        const utms = getSavedUTMs();
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
                    }
                })
            });
            const data = await res.json();

            if (data.success && data.coach) {
                setAssignedCoach(data.coach.name);
                setAssignedMeetLink(data.meetLink);
            } else {
                setAssignedCoach("Tu Money Strategist(a)");
            }
        } catch (error) {
            console.error("Error scheduling", error);
            setAssignedCoach("Tu Money Strategist(a)");
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

    const currentProgress = stage === 1 ? 33 : stage === 2 ? 66 : 100;

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
                    {stage === 1 && (
                        <DynamicForm
                            onNext={handleFormNext}
                            onDisqualified={handleFormDisqualified}
                        />
                    )}

                    {stage === 2 && (
                        <CalendarPicker
                            onSchedule={handleSchedule}
                            onBack={() => setStage(1)}
                        />
                    )}

                    {stage === 3 && (
                        <ConfirmationView
                            onClose={() => setIsOpen(false)}
                            coachName={assignedCoach || "Tu Money Strategist(a)"}
                            calendlyUrl={calendlyUrl || undefined}
                        />
                    )}

                    {stage === 4 && (
                        <div className="flex flex-col items-center justify-center text-center h-full animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-claudia-accent-orange/10 rounded-full flex items-center justify-center text-claudia-accent-orange mb-6 shadow-[0_0_30px_rgba(255,152,0,0.2)]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">¡Gracias por tu interés!</h2>
                            <p className="text-white/70 text-lg mb-8 max-w-md">
                                Hemos recibido tus respuestas. Por el momento, la mejor forma de ayudarte es a través de nuestros recursos gratuitos donde encontrarás herramientas valiosas para seguir construyendo tus bases financieras.
                            </p>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    window.open('https://www.instagram.com/soyclaudiauribe/', '_blank');
                                }}
                                className="px-8 py-4 bg-claudia-accent-orange text-white rounded-full font-bold uppercase tracking-wider hover:scale-105 hover:shadow-[0_0_20px_rgba(255,152,0,0.3)] transition-all"
                            >
                                Seguir a Claudia en Instagram
                            </button>
                        </div>
                    )}
                </div>

                {/* Progress Bar Header */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                    <div
                        className="h-full bg-claudia-accent-green transition-all duration-700 ease-in-out"
                        style={{ width: `${stage === 1 ? 33 : stage === 2 ? 66 : 100}%` }}
                    />
                </div>

            </div>
        </div>
    );
}
