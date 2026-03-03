import React, { useState, useEffect } from 'react';
import { funnelConfig } from './formConfig';
import type { Question } from './formConfig';

interface DynamicFormProps {
    onNext: (data: Record<string, string>) => void;
    onDisqualified: (data: Record<string, string>) => void;
}

export default function DynamicForm({ onNext, onDisqualified }: DynamicFormProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [error, setError] = useState('');

    const question: Question | undefined = funnelConfig.questions[currentStepIndex];

    // Para animaciones sencillas en cambio de pregunta
    const [isTransitioning, setIsTransitioning] = useState(false);

    if (!question) return null;

    const handleNext = (overrideAnswer?: string) => {
        // Validar requeridos
        const answer = overrideAnswer !== undefined ? overrideAnswer : (answers[question.id] || '');
        if (question.required && (!answer || answer.trim() === '')) {
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
        }

        if (question.type === 'tel') {
            // Permite +, números, espacios, guiones y paréntesis entre 7 y 20 caracteres
            const phoneRegex = /^\+?[0-9\s()\-]{7,20}$/;
            if (!phoneRegex.test(answer.trim())) {
                setError('Por favor, ingresa un número de teléfono válido.');
                return;
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
                // Formulario terminado, evaluar reglas
                evaluateRules();
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

    const evaluateRules = () => {
        let disqualified = false;

        for (const rule of funnelConfig.disqualificationRules) {
            const answer = answers[rule.questionId];
            if (rule.operator === 'equals' && answer === rule.value) disqualified = true;
            if (rule.operator === 'not-equals' && answer !== rule.value) disqualified = true;
        }

        if (disqualified) {
            onDisqualified(answers);
        } else {
            onNext(answers);
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

    // Porcentaje de progreso
    const progressPercent = ((currentStepIndex + 1) / funnelConfig.questions.length) * 100;

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

                        {(question.type === 'text' || question.type === 'email' || question.type === 'tel') && (
                            <div className="flex flex-col gap-2">
                                <input
                                    type={question.type}
                                    autoFocus
                                    value={answers[question.id] || ''}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder={question.placeholder}
                                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-6 py-4 text-white text-lg focus:outline-none focus:border-claudia-accent-green focus:bg-white/10 transition-all placeholder:text-white/30"
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
                    onClick={handlePrevious}
                    disabled={currentStepIndex === 0 || isTransitioning}
                    className={`px-6 py-2 rounded-full font-bold uppercase text-sm tracking-wider transition-colors ${currentStepIndex === 0 ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                    Atrás
                </button>

                {/* Solo mostrar botón Siguiente para inputs de texto, para choice se auto-avanza */}
                {question.type !== 'single-choice' && (
                    <button
                        onClick={() => handleNext()}
                        disabled={isTransitioning}
                        className="px-8 py-3 bg-claudia-accent-green text-claudia-dark rounded-full font-bold uppercase tracking-wider hover:scale-105 hover:shadow-[0_0_20px_rgba(198,255,0,0.3)] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                        {currentStepIndex === funnelConfig.questions.length - 1 ? 'Finalizar' : 'Siguiente'}
                    </button>
                )}
            </div>
        </div>
    );
}
