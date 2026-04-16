import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { funnelConfig } from './formConfig';
import type { Question } from './formConfig';

interface DynamicFormProps {
    onNext: (data: Record<string, string>) => void;
    onDisqualified: (data: Record<string, string>) => void;
    onProgressUpdate?: (progress: number) => void;
}

export default function DynamicForm({ onNext, onDisqualified, onProgressUpdate }: DynamicFormProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [error, setError] = useState('');
    const [isCheckingLead, setIsCheckingLead] = useState(false);

    const question: Question | undefined = funnelConfig.questions[currentStepIndex];

    // Para animaciones sencillas en cambio de pregunta
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Emitir progreso al contenedor padre
    useEffect(() => {
        if (onProgressUpdate) {
            // El primer paso (index 0) debe ser 0%, el último paso (index 7) debe ser 100%
            const totalSteps = funnelConfig.questions.length;
            const progressPercent = totalSteps > 1 
                ? (currentStepIndex / (totalSteps - 1)) * 100 
                : 100;
            onProgressUpdate(progressPercent);
        }
    }, [currentStepIndex, onProgressUpdate]);

    if (!question) return null;

    const handleNext = async (overrideAnswer?: string) => {
        const answer = overrideAnswer !== undefined ? overrideAnswer : (answers[question.id] || '');
        
        // Validación especial para nombre/apellido
        if (question.id === 'nombre') {
            const nombre = answers['nombre'] || '';
            const apellido = answers['apellido'] || '';
            if (!nombre.trim() || !apellido.trim()) {
                setError('Por favor, ingresa tanto tu nombre como tu apellido.');
                return;
            }
        } else if (question.required && (!answer || answer.trim() === '')) {
            setError('Por favor, completa este campo para continuar.');
            return;
        }

        // Validaciones específicas
        if (question.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(answer.trim())) {
                setError('Por favor, ingresa un correo electrónico válido.');
                return;
            }

            // [NUEVO] Validar si ya existe el lead (Solo si no hemos validado este mismo email antes)
            setIsCheckingLead(true);
            try {
                const res = await fetch('/api/leads/check-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: answer.trim() })
                });
                const data = await res.json();
                if (data.exists) {
                    setError('Ya hay una persona registrada con este correo electrónico.');
                    return; // Bloquea el avance
                }
            } catch (e) {
                console.error('Error checking lead existence:', e);
            } finally {
                setIsCheckingLead(false);
            }
        }

        if (question.type === 'tel') {
            const cleanPhone = answer.replace(/[\s-]/g, '');
            const phoneRegex = /^\+[0-9]{7,15}$/;
            if (!phoneRegex.test(cleanPhone)) {
                setError('Por favor, ingresa un número de teléfono válido con su indicativo.');
                return;
            }

            // [NUEVO] Validar si ya existe el lead por teléfono
            setIsCheckingLead(true);
            try {
                const res = await fetch('/api/leads/check-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: cleanPhone })
                });
                const data = await res.json();
                if (data.exists) {
                    setError('Este número de teléfono ya está registrado con nosotros.');
                    return; // Bloquea el avance
                }
            } catch (e) {
                console.error('Error checking lead existence:', e);
            } finally {
                setIsCheckingLead(false);
            }
        }

        setError('');

        // Transición
        setIsTransitioning(true);
        setTimeout(() => {
            // Avanzar al siguiente paso
            if (currentStepIndex < funnelConfig.questions.length - 1) {
                setCurrentStepIndex(currentStepIndex + 1);
                setIsTransitioning(false);
            } else {
                // Formulario terminado, la calificación se calcula en el contenedor
                // [FIX] Usar el valor más reciente para evitar desfase de estado asíncrono
                const finalAnswers = { ...answers };
                if (overrideAnswer !== undefined) {
                    finalAnswers[question.id] = overrideAnswer;
                }
                onNext(finalAnswers);
            }
        }, 300);
    };

    const handlePrevious = () => {
        if (currentStepIndex > 0) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentStepIndex(currentStepIndex - 1);
                setIsTransitioning(false);
                setError('');
            }, 300);
        }
    };

    const handleOptionSelect = (val: string) => {
        setAnswers(prev => ({ ...prev, [question.id]: val }));
        setError('');
        // Auto-advance for singles choices to reduce friction
        setTimeout(() => {
            handleNext(val);
        }, 400); // Pequeño delay para mostrar la selección
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAnswers(prev => ({ ...prev, [question.id]: e.target.value }));
        if (error) setError('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleNext();
    };

    return (
        <div className="flex flex-col h-full !font-sans">
            <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full relative">

                {/* Progress Text */}
                <p className="text-white/40 text-sm font-semibold mb-6 tracking-widest uppercase text-center">
                    Paso {currentStepIndex + 1} de {funnelConfig.questions.length}
                </p>

                {/* Question Area */}
                <div className={`transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                        {question.question}
                    </h3>
                    {question.description && (
                        <p className="text-white/60 mb-6">{question.description}</p>
                    )}

                    <div className="mt-8">
                        {question.type === 'single-choice' && question.options && (
                            <div className="flex flex-col gap-3">
                                {question.options.map((opt) => {
                                    const isSelected = answers[question.id] === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleOptionSelect(opt.value)}
                                            className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-200 hover:-translate-y-1 ${isSelected
                                                ? 'border-claudia-accent-green bg-claudia-accent-green/10 text-claudia-accent-green font-bold shadow-[0_0_15px_rgba(198,255,0,0.2)]'
                                                : 'border-white/10 bg-white/5 text-white hover:border-white/30 hover:bg-white/10'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {(question.type === 'text' || question.type === 'email') && (
                            <div className="flex flex-col gap-4">
                                {question.id === 'nombre' ? (
                                    <>
                                        <input
                                            type="text"
                                            autoFocus
                                            value={answers['nombre'] || ''}
                                            onChange={(e) => {
                                                setAnswers(prev => ({ ...prev, nombre: e.target.value }));
                                                if (error) setError('');
                                            }}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Tu nombre"
                                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-6 py-4 text-white text-lg focus:outline-none focus:border-claudia-accent-green focus:bg-white/10 transition-all placeholder:text-white/30"
                                        />
                                        <input
                                            type="text"
                                            value={answers['apellido'] || ''}
                                            onChange={(e) => {
                                                setAnswers(prev => ({ ...prev, apellido: e.target.value }));
                                                if (error) setError('');
                                            }}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Tu apellido"
                                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-6 py-4 text-white text-lg focus:outline-none focus:border-claudia-accent-green focus:bg-white/10 transition-all placeholder:text-white/30"
                                        />
                                    </>
                                ) : (
                                    <input
                                        type={question.type}
                                        autoFocus
                                        value={answers[question.id] || ''}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder={question.placeholder}
                                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-6 py-4 text-white text-lg focus:outline-none focus:border-claudia-accent-green focus:bg-white/10 transition-all placeholder:text-white/30"
                                    />
                                )}
                            </div>
                        )}

                        {question.type === 'tel' && (
                            <div className="flex flex-col gap-2 phone-input-container">
                                <style>{`
                                    .react-tel-input .form-control {
                                        width: 100%;
                                        height: 64px;
                                        background-color: rgba(255, 255, 255, 0.05);
                                        border: 2px solid rgba(255, 255, 255, 0.1);
                                        border-radius: 0.75rem;
                                        padding-left: 74px;
                                        color: white;
                                        font-size: 1.125rem;
                                        transition: all 0.2s;
                                    }
                                    .react-tel-input .form-control:focus {
                                        border-color: #C6FF00;
                                        background-color: rgba(255, 255, 255, 0.1);
                                        box-shadow: none;
                                    }
                                    .react-tel-input .flag-dropdown {
                                        background-color: rgba(255, 255, 255, 0.05);
                                        border: none;
                                        border-right: 2px solid rgba(255, 255, 255, 0.1);
                                        border-radius: 0.75rem 0 0 0.75rem;
                                        width: 60px;
                                    }
                                    .react-tel-input .flag-dropdown:hover, 
                                    .react-tel-input .flag-dropdown:focus,
                                    .react-tel-input .flag-dropdown.open {
                                        background-color: rgba(255, 255, 255, 0.08);
                                        border-radius: 0.75rem 0 0 0.75rem;
                                    }
                                    .react-tel-input .flag-dropdown.open .selected-flag {
                                        background-color: transparent;
                                    }
                                    .react-tel-input .selected-flag {
                                        padding-left: 14px;
                                        width: 60px;
                                        border-radius: 0.75rem 0 0 0.75rem;
                                        background-color: transparent;
                                    }
                                    .react-tel-input .selected-flag .arrow {
                                        left: 40px;
                                    }
                                    .react-tel-input .country-list {
                                        background-color: #1a1a1a;
                                        color: white;
                                        border: 1px solid rgba(255, 255, 255, 0.1);
                                        border-radius: 0.5rem;
                                        margin-top: 8px;
                                    }
                                    .react-tel-input .country-list .country:hover,
                                    .react-tel-input .country-list .country.highlight {
                                        background-color: rgba(255, 255, 255, 0.1);
                                    }
                                    .react-tel-input .form-control::placeholder {
                                        color: rgba(255, 255, 255, 0.3);
                                    }
                                `}</style>
                                <PhoneInput
                                    country={'co'}
                                    value={answers[question.id] || ''}
                                    countryCodeEditable={false}
                                    onChange={(phone, countryData: any) => {
                                        if (!phone) {
                                            setAnswers(prev => ({ ...prev, [question.id]: '' }));
                                            return;
                                        }

                                        const dialCode = countryData?.dialCode || '';
                                        let cleanPhoneString = phone;
                                        
                                        // [FIX] Mitigar que el usuario repita el indicativo manualmente
                                        // Si el número empieza con el dialCode duplicado (ej. 5757...), quitamos uno
                                        if (dialCode && cleanPhoneString.startsWith(dialCode + dialCode)) {
                                            cleanPhoneString = cleanPhoneString.substring(dialCode.length);
                                        }

                                        // Si el teléfono empieza con el código de país, lo separamos con un espacio
                                        if (dialCode && cleanPhoneString.startsWith(dialCode)) {
                                            const numberPart = cleanPhoneString.substring(dialCode.length);
                                            cleanPhoneString = `+${dialCode} ${numberPart}`;
                                        } else {
                                            cleanPhoneString = `+${cleanPhoneString}`;
                                        }

                                        setAnswers(prev => ({ ...prev, [question.id]: cleanPhoneString }));
                                        if (error) setError('');
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder={question.placeholder || 'Ej: 300 123 4567'}
                                    enableSearch={true}
                                    masks={{ co: '... ... ....' }}
                                />
                            </div>
                        )}

                        {error && (
                            <p className="text-red-400 mt-4 text-sm font-medium animate-in slide-in-from-bottom-2 fade-in">{error}</p>
                        )}
                    </div>
                </div>

            </div>

            {/* Navigation Buttons */}
            <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6">
                <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStepIndex === 0 || isTransitioning}
                    className={`px-6 py-2 rounded-full font-bold uppercase text-sm tracking-wider transition-colors ${currentStepIndex === 0 ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                    Atrás
                </button>

                {question.type !== 'single-choice' && (
                    <button
                        type="button"
                        onClick={() => handleNext()}
                        disabled={isTransitioning || isCheckingLead}
                        className="px-8 py-3 bg-claudia-accent-green text-claudia-dark rounded-full font-bold uppercase tracking-wider hover:scale-105 hover:shadow-[0_0_20px_rgba(198,255,0,0.3)] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                        {isCheckingLead ? 'Verificando...' : (currentStepIndex === funnelConfig.questions.length - 1 ? 'Finalizar' : 'Siguiente')}
                    </button>
                )}
            </div>
        </div>
    );
}
