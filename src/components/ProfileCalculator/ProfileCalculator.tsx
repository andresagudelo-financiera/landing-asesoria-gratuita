import React, { useState, useEffect } from 'react';
import { calculateScore, type AnswerMap, type ScoreOutput } from '../../utils/scoringEngine';
import { openLeadFunnel } from '../LeadFunnel/LeadFunnelContainer';


const QUESTIONS = [
    {
        id: 1,
        title: '¿Cuál es tu horizonte de inversión?',
        options: [
            { value: 1, label: 'Menos de 1 año.' },
            { value: 2, label: 'Entre 1 y 5 años.' },
            { value: 3, label: 'Más de 5 años.' },
        ],
    },
    {
        id: 2,
        title: 'Si el mercado bajara un 20% en el corto plazo, ¿cómo te sentirías?',
        options: [
            { value: 1, label: 'Muy preocupado, me gustaría vender inmediatamente' },
            { value: 2, label: 'Algo preocupado, pero consideraría mantener la inversión' },
            { value: 3, label: 'No me preocuparía, podría mantener mi inversión sin problema' },
        ],
    },
    {
        id: 3,
        title: '¿Qué tan cómodo te sientes invirtiendo en productos que puedan fluctuar mucho, como acciones o criptomonedas?',
        options: [
            { value: 1, label: 'Muy incómodo, prefiero productos más estables' },
            { value: 2, label: 'Me siento cómodo si tengo información sobre lo que estoy haciendo' },
            { value: 3, label: 'Me gusta el riesgo, estoy dispuesto a asumir fluctuaciones' },
        ],
    },
    {
        id: 4,
        title: '¿Cuánto tiempo dedicarías a investigar sobre inversiones?',
        options: [
            { value: 1, label: 'Pocos minutos, prefiero que alguien más lo haga por mí' },
            { value: 2, label: 'Algunas horas a la semana, busco estar informado' },
            { value: 3, label: 'Dedicaría mucho tiempo, quiero entender todos los detalles' },
        ],
    },
    {
        id: 5,
        title: 'Imagina que tienes una cantidad considerable de dinero invertido. ¿Qué harías si de repente el valor de tu inversión cae un 30%?',
        options: [
            { value: 1, label: 'Vendería inmediatamente para evitar pérdidas mayores' },
            { value: 2, label: 'Mantendría la calma y esperaría a que se recupere' },
            { value: 3, label: 'Aprovecharía para comprar más, si el precio baja' },
        ],
    },
];

export default function ProfileCalculator() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [isFinished, setIsFinished] = useState(false);
    const [result, setResult] = useState<ScoreOutput | null>(null);
    const [leadName, setLeadName] = useState('');
    const [leadEmail, setLeadEmail] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Persist state
    useEffect(() => {
        const savedState = sessionStorage.getItem('investmentCalculatorState');
        if (savedState) {
            try {
                const { savedAnswers, savedStep } = JSON.parse(savedState);
                if (savedStep <= QUESTIONS.length) {
                    setAnswers(savedAnswers);
                    setCurrentStep(savedStep);
                }
            } catch (e) {
                console.error('Error parsing saved state', e);
            }
        }
    }, []);

    const saveState = (newAnswers: AnswerMap, newStep: number) => {
        sessionStorage.setItem('investmentCalculatorState', JSON.stringify({
            savedAnswers: newAnswers,
            savedStep: newStep
        }));
    };

    const clearState = () => {
        sessionStorage.removeItem('investmentCalculatorState');
    };

    const handleSelect = (questionId: number, value: number) => {
        const newAnswers = { ...answers, [questionId]: value };
        setAnswers(newAnswers);

        // Auto advance
        if (currentStep < QUESTIONS.length - 1) {
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                saveState(newAnswers, currentStep + 1);
            }, 300); // Small delay for UX feedback
        } else {
            // Go to lead capture step
            setTimeout(() => {
                setCurrentStep(QUESTIONS.length);
                saveState(newAnswers, QUESTIONS.length);
            }, 300);
        }
    };

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setIsSubmitting(true);

        const calculatedResult = calculateScore(answers);

        try {
            const response = await fetch('/api/save-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: leadName,
                    email: leadEmail,
                    score: calculatedResult.score,
                    profile: calculatedResult.profile,
                    answers: answers
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                setSubmitError(errorData.error || 'Ocurrió un error al guardar tus datos.');
                setIsSubmitting(false);
                return; // Detener ejecución para no mostrar resultados
            }
        } catch (error) {
            console.error('Error saving lead:', error);
            // Ignoramos error de red para no bloquear al usuario por problemas de conexión locales,
            // pero podríamos optar por bloquear setSubmitError('Error de red. Por favor intenta nuevamente.');
        }

        setIsSubmitting(false);
        saveState(answers, QUESTIONS.length); // Avoid state loss before showing result
        finishCalculator(answers, calculatedResult);
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            saveState(answers, currentStep - 1);
        }
    };

    const finishCalculator = (finalAnswers: AnswerMap, precalculatedResult?: ScoreOutput) => {
        const calculatedResult = precalculatedResult || calculateScore(finalAnswers);
        setResult(calculatedResult);
        setIsFinished(true);
        clearState(); // Once finished, we don't need to resume

        // Track the completion in Google Analytics
        if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag('event', 'calculator_completion', {
                event_category: 'calculator',
                event_label: 'investment_profile',
                profile_result: calculatedResult.profile,
                score_value: calculatedResult.score
            });
        }
    };

    const restart = () => {
        clearState();
        setAnswers({});
        setCurrentStep(0);
        setIsFinished(false);
        setResult(null);
    };

    if (isFinished && result) {
        return <ResultView result={result} onRestart={restart} />;
    }

    if (currentStep === QUESTIONS.length) {
        return (
            <div className="max-w-xl mx-auto p-6 md:p-10 min-h-[500px] flex flex-col justify-center animate-fade-in font-sans">
                <div className="w-full bg-gray-200 h-2 rounded-full mb-8 overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: '100%' }}></div>
                </div>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" /><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" /></svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Ya casi tienes tus resultados!</h2>
                    <p className="text-gray-600 pr-2 pl-2">Déjanos tu nombre y correo para revelarte tu perfil ideal de inversión.</p>
                </div>

                {submitError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start text-red-700 animate-fade-in">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <span className="text-sm font-medium leading-tight">{submitError}</span>
                    </div>
                )}

                <form onSubmit={handleLeadSubmit} className="flex flex-col gap-5">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tu Nombre</label>
                        <input
                            type="text"
                            id="name"
                            required
                            value={leadName}
                            onChange={(e) => setLeadName(e.target.value)}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:ring-0 transition-colors text-black"
                            placeholder="Ej. Andrés"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Tu Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            required
                            value={leadEmail}
                            onChange={(e) => setLeadEmail(e.target.value)}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:ring-0 transition-colors text-black"
                            placeholder="tu@correo.com"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`mt-4 text-white font-bold py-4 px-8 rounded-xl transition-all text-lg shadow-md w-full flex justify-center items-center ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analizando tus respuestas...
                            </>
                        ) : 'Ver mis resultados ahora'}
                    </button>
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={isSubmitting}
                        className="mt-2 text-gray-500 hover:text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors text-sm w-full disabled:opacity-50"
                    >
                        Volver a la pregunta anterior
                    </button>
                </form>
            </div>
        );
    }

    const currentQuestion = QUESTIONS[currentStep];
    const progressPercent = ((currentStep) / QUESTIONS.length) * 100;

    return (
        <div className="max-w-2xl mx-auto p-6 min-h-[500px] flex flex-col justify-center animate-fade-in font-sans">

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-2 rounded-full mb-8 overflow-hidden">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>

            <div className="flex justify-between items-center mb-6 text-sm text-gray-500 font-medium">
                <span>Pregunta {currentStep + 1} de {QUESTIONS.length}</span>
                {currentStep > 0 && (
                    <button
                        onClick={handleBack}
                        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        Anterior
                    </button>
                )}
            </div>

            <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                    {currentQuestion.title}
                </h2>

                <div className="flex flex-col gap-3">
                    {currentQuestion.options.map((option) => {
                        const isSelected = answers[currentQuestion.id] === option.value;
                        return (
                            <button
                                key={option.value}
                                onClick={() => handleSelect(currentQuestion.id, option.value)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${isSelected
                                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                                    : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${isSelected ? 'border-blue-600' : 'border-gray-300'
                                        }`}>
                                        {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                                    </div>
                                    <span className="text-lg">{option.label}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function ResultView({ result, onRestart }: { result: ScoreOutput, onRestart: () => void }) {
    return (
        <div className="max-w-2xl mx-auto p-6 md:p-10 text-center animate-fade-in-up font-sans text-black">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                Tu Perfil de Riesgo: <span className="text-blue-600">{result.profile}</span>
            </h2>

            <div className="text-gray-500 font-semibold mb-6 flex justify-center items-center gap-2">
                <span>Score de Resiliencia: {result.score}/100</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8 text-left">
                <div className="mb-8">
                    <h3 className="font-bold text-xl mb-3 text-gray-900">Recomendación Estratégica:</h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                        {result.recomendacion}
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h4 className="text-blue-800 font-bold text-sm uppercase tracking-wider mb-1">Rentabilidad sugerida</h4>
                            <p className="text-blue-600 text-xs">(Descontando Inflación)</p>
                        </div>
                        <div className="text-4xl font-extrabold text-blue-900">
                            {result.rentabilidad}
                        </div>
                    </div>
                </div>

                {/* Insights Section */}
                <h3 className="font-bold text-lg mb-4 text-gray-900">Balance de Perfil:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InsightBadge title="Meta Inversión" data={result.insights.ahorro} />
                    <InsightBadge title="Perfil Riesgo" data={result.insights.deuda} />
                    <InsightBadge title="Foco Inversor" data={result.insights.conocimiento} />
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    Próximo Paso Crítico
                </h3>
                <p className="text-gray-700">
                    Esta rentabilidad es una guía para alinear tus inversiones. Para saber <strong>cómo</strong> alcanzar estos números en el mercado real, no te pierdas nuestro próximo live.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <button
                    onClick={(e) => { e.preventDefault(); openLeadFunnel(); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full transition-all text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 text-center"
                >
                    Quiero mi asesoría gratuita
                </button>
                <button onClick={onRestart} className="px-8 py-4 rounded-full font-semibold text-gray-600 border-2 border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all">
                    Volver a evaluar
                </button>
            </div>

        </div>
    );
}

function InsightBadge({ title, data }: { title: string, data: { level: string, color: string, label: string } }) {
    return (
        <div className={`flex flex-col p-4 rounded-xl border ${data.color} bg-opacity-50`}>
            <span className="text-xs uppercase tracking-wider opacity-75 font-semibold mb-1">{title}</span>
            <span className="text-lg font-bold mb-1">{data.level}</span>
            <span className="text-sm opacity-90">{data.label}</span>
        </div>
    );
}

function PortfolioBar({ label, percentage, color }: { label: string; percentage: number; color: string }) {
    return (
        <div>
            <div className="flex justify-between text-sm font-semibold mb-1 text-gray-700">
                <span>{label}</span>
                <span>{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
                <div className={`${color} h-3 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
}
