import React from 'react';

interface ConfirmationViewProps {
    onClose: () => void;
    coachName?: string;
    calendlyUrl?: string;
    alreadyRegistered?: boolean;
    nivelCalificacion?: 'Alta' | 'Media' | 'Baja';
}

export default function ConfirmationView({
    onClose,
    coachName = "Tu Money Strategist(a)",
    calendlyUrl,
    alreadyRegistered = false,
    nivelCalificacion = 'Media',
}: ConfirmationViewProps) {

    const handleReopenCalendly = () => {
        if (typeof window !== 'undefined' && window.Calendly && calendlyUrl) {
            window.Calendly.initPopupWidget({ url: calendlyUrl });
        } else if (calendlyUrl) {
            window.open(calendlyUrl, '_blank');
        }
    };

    return (
        <div className="flex flex-col h-full !font-sans animate-in zoom-in-95 duration-500 items-center justify-center text-center p-8">

            {/* Icono animado */}
            <div className="w-24 h-24 bg-claudia-accent-green/20 rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-claudia-accent-green/10 rounded-full animate-ping"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-claudia-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                ¡Gracias por registrarte!
            </h3>
            <p className="text-white/70 text-lg mb-8 max-w-md">
                {alreadyRegistered
                    ? <>Te esperamos en tu <strong>sesión estratégica</strong> con tu Money Strategist.</>
                    : (nivelCalificacion === 'Baja'
                        ? <>Sigue a Claudia en redes. Un <strong>Money Strategist</strong> se comunicará contigo próximamente para brindarte más información.</>
                        : <>Hemos enviado tus datos a nuestro equipo de estrategas. Te llegará un correo con las instrucciones para realizar tu agendamiento con tu <strong>Money Strategist</strong>.</>
                    )
                }
            </p>

            {/* Tarjeta de información */}
            {/*       <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 text-left">
                <div className="flex flex-col gap-4">
                    <div>
                        <span className="block text-xs text-white/40 uppercase tracking-widest font-bold">Money Strategist Asignado</span>
                        <span className="block text-white font-medium text-lg mt-1 break-words break-all">{coachName}</span>
                    </div>
                </div>
            </div> */}

            <div className="flex flex-col gap-3 w-full max-w-sm">
                {nivelCalificacion === 'Baja' && (
                    <button
                        onClick={() => window.open('https://www.instagram.com/soyclaudiauribe/', '_blank')}
                        className="px-10 py-4 bg-claudia-accent-orange text-white rounded-full font-bold uppercase tracking-wider hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,152,0,0.3)]"
                    >
                        Seguir a Claudia en Instagram
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="px-10 py-3 bg-white/10 text-white rounded-full font-bold uppercase tracking-wider hover:bg-white/20 transition-all border border-white/20"
                >
                    Volver a la página
                </button>
            </div>

        </div>
    );
}
