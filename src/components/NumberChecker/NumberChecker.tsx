import React, { useState } from 'react';
import { coachPhones, type CoachPhone } from '../../utils/coachNumbers';

export default function NumberChecker() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [result, setResult] = useState<CoachPhone | null>(null);
    const [hasChecked, setHasChecked] = useState(false);
    const [error, setError] = useState('');

    const handleCheck = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setHasChecked(true);

        // Validar que el input contenga SOLAMENTE números (opcionalmente empezando con +)
        const trimmedValue = phoneNumber.trim();
        if (!/^\+?\d+$/.test(trimmedValue)) {
            setError('El campo solo debe contener números (opcionalmente con el signo + al inicio).');
            return;
        }

        // Limpiar el '+' si existe para la comparación
        const cleanNumber = trimmedValue.replace('+', '');

        if (cleanNumber.length < 8) {
            setError('Por favor ingresa un número de teléfono válido (mínimo 8 dígitos).');
            return;
        }

        const foundCoach = coachPhones.find(c => {
            // Comparación estricta y exacta del número
            if (c.phone === cleanNumber) return true;

            // Soportar que el usuario ingrese el número sin el indicativo '57' 
            // si en la base de datos está guardado con el '57'
            if (c.phone.startsWith('57') && c.phone === '57' + cleanNumber) return true;

            // Soportar que el usuario ingrese el '57' pero en la base de datos no esté
            if (cleanNumber.startsWith('57') && cleanNumber === '57' + c.phone) return true;

            return false;
        });

        if (foundCoach) {
            // Evento GA4: número válido
            if (typeof window !== 'undefined' && (window as any).trackEvent) {
                (window as any).trackEvent('number_check', {
                    result: 'valid',
                    coach_name: foundCoach.name,
                    phone_checked: cleanNumber
                });
            }
            setResult(foundCoach);
            // Redirigir a éxito
            window.location.href = `/numero-valido?name=${encodeURIComponent(foundCoach.name)}&phone=${encodeURIComponent(foundCoach.phone)}&link=${encodeURIComponent(foundCoach.whatsappLink)}`;
        } else {
            // Evento GA4: número inválido
            if (typeof window !== 'undefined' && (window as any).trackEvent) {
                (window as any).trackEvent('number_check', {
                    result: 'invalid',
                    phone_checked: cleanNumber
                });
            }
            // Redirigir a error
            window.location.href = '/numero-invalido';
        }
    };

    return (
        <div className="w-full bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
            <div className="flex items-center space-x-4 mb-2">
                <div className="flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#0095f6]" fill="currentColor">
                        <path d="M22.5 12.5c0-1.58-.88-2.95-2.18-3.66.15-.44.23-.91.23-1.4 0-2.31-1.87-4.18-4.18-4.18-.49 0-.96.08-1.4.23C14.26 2.19 12.89 1.31 11.31 1.31c-1.58 0-2.95.88-3.66 2.18-.44-.15-.91-.23-1.4-.23-2.31 0-4.18 1.87-4.18 4.18 0 .49.08.96.23 1.4C1.01 9.55.13 10.92.13 12.5c0 1.58.88 2.95 2.18 3.66-.15.44-.23.91-.23 1.4 0 2.31 1.87 4.18 4.18 4.18.49 0 .96-.08 1.4-.23 1.19 1.95 2.68 3.14 4.14 3.14 1.58 0 2.95-.88 3.66-2.18.44.15.91.23 1.4.23 2.31 0 4.18-1.87 4.18-4.18 0-.49-.08-.96-.23-1.4 1.3-0.71 2.18-2.08 2.18-3.66zm-12.21 4.79l-4.24-4.24 1.41-1.41 2.83 2.83 6.36-6.36 1.41 1.41-7.77 7.77z" />
                    </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-black tracking-tight uppercase">
                    COMPROBAR UN NÚMERO
                </h2>
            </div>

            <p className="text-gray-800 text-lg mb-8 leading-tight">
                Ingrese el número de WhatsApp con indicativo de país, sin espacios o guiones, solo los números:
            </p>

            <form onSubmit={handleCheck} className="space-y-4">
                <div>
                    <input
                        type="tel"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Ej. 573165778662"
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#0095f6] focus:border-[#0095f6] transition-all outline-none text-xl font-medium text-gray-900 placeholder-gray-300"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-[#25D366] hover:bg-[#1EBE55] text-white font-black uppercase tracking-widest py-4 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 text-lg"
                >
                    <span>Verificar</span>
                </button>
            </form>

            {/* Omitimos los resultados locales ya que redirigiremos */}

            <div className="mt-8 transition-all duration-300">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {hasChecked && !error && !result && (
                    <div className="p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-lg flex items-start space-x-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 text-orange-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Coach NO encontrado</h3>
                            <p className="text-sm">El número ingresado no coincide con ningún coach autorizado de Financieramente con Claudia Uribe.</p>
                            <p className="text-sm font-semibold mt-2">¡Precaución! Podría tratarse de un intento de fraude.</p>
                        </div>
                    </div>
                )}

                {result && (
                    <div className="p-5 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="h-10 w-10 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-green-800">Coach Verificado</h3>
                                <p className="text-green-700 text-sm">Este número pertenece a nuestro equipo.</p>
                            </div>
                        </div>

                        <div className="bg-white rounded p-4 mb-4 border border-green-100 shadow-sm">
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Nombre del Coach</p>
                            <p className="font-semibold text-gray-800 text-lg">{result.name}</p>

                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 mt-3">Número Registrado</p>
                            <p className="font-mono text-gray-700">{result.phone}</p>
                        </div>

                        <a
                            href={result.whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#25D366] hover:bg-[#1EBE55] text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 w-full shadow-md"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                            </svg>
                            <span>Contactar en WhatsApp</span>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
