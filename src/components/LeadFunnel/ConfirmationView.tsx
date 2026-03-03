import React from 'react';

interface ConfirmationViewProps {
    onClose: () => void;
    meetLink?: string;
    coachName?: string;
    dateTimeStr?: string;
}

export default function ConfirmationView({
    onClose,
    meetLink = "https://meet.google.com/xxx-xxxx-xxx",
    coachName = "Tu Asesor(a)",
    dateTimeStr
}: ConfirmationViewProps) {

    return (
        <div className="flex flex-col h-full !font-sans animate-in zoom-in-95 duration-500 items-center justify-center text-center p-8">

            {/* Icono animado */}
            <div className="w-24 h-24 bg-claudia-accent-green/20 rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-claudia-accent-green/10 rounded-full animate-ping"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-claudia-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">¡Cita Confirmada!</h3>
            <p className="text-white/70 text-lg mb-8 max-w-md">
                Has agendado exitosamente tu sesión con <strong className="text-white">{coachName}</strong>. Te hemos enviado un correo con todos los detalles y el enlace oficial de la videollamada.
            </p>

            <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
                <div className="flex flex-col gap-4">
                    <div>
                        <span className="block text-xs text-white/40 uppercase tracking-widest font-bold">Cuándo</span>
                        <span className="block text-white font-medium text-lg mt-1">{dateTimeStr || 'Revisa tu correo'}</span>
                    </div>
                    <div className="h-px w-full bg-white/10"></div>
                    <div>
                        <span className="block text-xs text-white/40 uppercase tracking-widest font-bold">Con quién</span>
                        <span className="block text-white font-medium text-lg mt-1">{coachName}</span>
                    </div>
                    {meetLink && (
                        <>
                            <div className="h-px w-full bg-white/10"></div>
                            <div>
                                <span className="block text-xs text-white/40 uppercase tracking-widest font-bold mb-2">Enlace de Videollamada</span>
                                <a
                                    href={meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-claudia-accent-orange hover:text-orange-400 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                    </svg>
                                    <span>Abrir Google Meet</span>
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <button
                onClick={onClose}
                className="px-10 py-3 bg-white/10 text-white rounded-full font-bold uppercase tracking-wider hover:bg-white/20 transition-all border border-white/20"
            >
                Volver a la página
            </button>

        </div>
    );
}
