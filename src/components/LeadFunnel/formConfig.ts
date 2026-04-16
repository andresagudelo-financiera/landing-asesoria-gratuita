export type QuestionType = 'text' | 'email' | 'tel' | 'single-choice';

export interface Option {
    label: string;
    value: string;
    scoreValue?: number; // Puntos del 0 al 100
}

export interface Question {
    id: string;
    type: QuestionType;
    question: string;
    description?: string;
    options?: Option[];
    placeholder?: string;
    required?: boolean;
    weight?: number; // Peso porcentual (0.15, 0.20, etc.)
}

export interface FormConfig {
    questions: Question[];
}

export const funnelConfig: FormConfig = {
    questions: [
        {
            id: "nombre",
            type: "text",
            question: "¿Cómo te llamas?",
            placeholder: "Tu nombre",
            required: true,
        },
        {
            id: "email",
            type: "email",
            question: "¿Cuál es tu correo electrónico?",
            placeholder: "tu@email.com",
            required: true,
        },
        {
            id: "telefono",
            type: "tel",
            question: "¿A qué número de WhatsApp nos podemos comunicar?",
            placeholder: "+57 300 000 0000",
            required: true,
        },
        {
            id: "objetivo",
            type: "single-choice",
            question: "¿Qué quieres lograr en los próximos 12–24 meses?",
            weight: 0.15,
            options: [
                { label: "Organizar mis finanzas", value: "organizar", scoreValue: 50 },
                { label: "Salir de deudas", value: "deudas", scoreValue: 10 },
                { label: "Empezar a invertir capital", value: "invertir", scoreValue: 100 },
                { label: "Escalar inversiones que ya tengo", value: "escalar", scoreValue: 100 },
                { label: "Estructurar mi plan de retiro", value: "retiro", scoreValue: 100 },
            ],
            required: true,
        },
        {
            id: "ingresos",
            type: "single-choice",
            question: "Tu nivel de ingresos hoy está en el rango de:",
            weight: 0.20,
            options: [
                { label: "Menos de $3.000.000", value: "menos_3m", scoreValue: 10 },
                { label: "Entre $3.000.000 y $5.000.000", value: "3m_5m", scoreValue: 40 },
                { label: "Entre $5.000.000 y $10.000.000", value: "5m_10m", scoreValue: 80 },
                { label: "Más de $10.000.000", value: "mas_10m", scoreValue: 100 },
            ],
            required: true,
        },
        {
            id: "flujo_caja",
            type: "single-choice",
            question: "Al final del mes, ¿cuánto suele quedarte en flujo de caja libre?",
            weight: 0.30,
            options: [
                { label: "Menos de $300.000", value: "menos_300k", scoreValue: 10 },
                { label: "Entre $300.000 y $800.000", value: "300k_800k", scoreValue: 40 },
                { label: "Entre $800.000 y $1.500.000", value: "800k_1.5m", scoreValue: 60 },
                { label: "Entre $1.500.000 y $3.000.000", value: "1.5m_3m", scoreValue: 80 },
                { label: "Más de $3.000.000", value: "mas_3m", scoreValue: 100 },
            ],
            required: true,
        },
        {
            id: "capital_disponible",
            type: "single-choice",
            question: "¿Cuánto capital tienes disponible hoy para ahorrar o invertir?",
            weight: 0.20,
            options: [
                { label: "Menos de $5 millones", value: "menos_5m", scoreValue: 10 },
                { label: "Entre $5 y $20 millones", value: "5m_20m", scoreValue: 60 },
                { label: "Entre $20 y $50 millones", value: "20m_50m", scoreValue: 90 },
                { label: "Más de $50 millones", value: "mas_50m", scoreValue: 100 },
            ],
            required: true,
        },
        {
            id: "declara_renta",
            type: "single-choice",
            question: "Actualmente, ¿tienes obligación de declarar renta en tu país?",
            weight: 0.15,
            options: [
                { label: "Sí", value: "si", scoreValue: 100 },
                { label: "No", value: "no", scoreValue: 10 },
            ],
            required: true,
        }
    ]
};
