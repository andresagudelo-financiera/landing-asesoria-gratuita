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

/**
 * Event Listener global para abrir el embudo desde botones en Astro
 */
export const openLeadFunnel = () => {
    const event = new CustomEvent('open-lead-funnel');
    window.dispatchEvent(event);
};

export default function LeadFunnelContainer() {
    const [isOpen, setIsOpen] = useState(false);
    const [stage, setStage] = useState<FunnelStage>(1);
    const [leadData, setLeadData] = useState<Record<string, string>>({});
    const [scheduleData, setScheduleData] = useState<{ date: string, time: string } | null>(null);
    const [assignedCoach, setAssignedCoach] = useState<string | null>(null);
    const [assignedMeetLink, setAssignedMeetLink] = useState<string | null>(null);

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

    const handleFormNext = (data: Record<string, string>) => {
        setLeadData(data);
        setStage(2);

        // Evento GA4: Perfilamiento Completo (Lead)
        if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag('event', 'generate_lead', {
                lead_type: data.perfil || 'standard',
                income_range: data.ingresos || 'unknown'
            });
        }

        // Evento Meta Pixel: Lead
        if (typeof window !== 'undefined' && 'fbq' in window) {
            (window as any).fbq('track', 'Lead', {
                content_category: data.perfil || 'standard',
                value: 0,
                currency: 'USD'
            });
        }
    };

    const handleFormDisqualified = (data: Record<string, string>) => {
        setLeadData(data);
        setStage(4);

        // Evento GA4: Perfilamiento Completo (Disqualified)
        if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag('event', 'generate_lead', {
                lead_type: 'disqualified',
                income_range: data.ingresos || 'unknown'
            });
        }

        // Evento Meta Pixel: Lead (Registramos el lead igual, pero sabemos que no calificó para llamada)
        if (typeof window !== 'undefined' && 'fbq' in window) {
            (window as any).fbq('track', 'Lead', {
                content_category: 'disqualified',
                value: 0,
                currency: 'USD'
            });
        }
    };

    const handleSchedule = async (date: string, time: string) => {
        try {
            const res = await fetch('/api/calendar/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, time, leadDetails: leadData })
            });
            const data = await res.json();

            if (data.success && data.coach) {
                setAssignedCoach(data.coach.name);
                setAssignedMeetLink(data.meetLink);
            } else {
                setAssignedCoach("Tu Asesor(a)");
            }
        } catch (error) {
            console.error("Error scheduling", error);
            setAssignedCoach("Tu Asesor(a)");
        }

        setScheduleData({ date, time });
        setStage(3);

        // Evento GA4: Agendamiento Completo (Schedule)
        if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag('event', 'schedule', {
                appointment_date: date,
                appointment_time: time,
                coach: assignedCoach
            });
        }

        // Evento Meta Pixel: Schedule
        if (typeof window !== 'undefined' && 'fbq' in window) {
            (window as any).fbq('track', 'Schedule', {
                content_name: 'Sesión Diagnóstico',
                status: 'scheduled'
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
                            coachName={assignedCoach || "Tu Asesor(a)"}
                            dateTimeStr={scheduleData ? `${scheduleData.date} a las ${scheduleData.time}` : ''}
                            meetLink={assignedMeetLink || undefined}
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
