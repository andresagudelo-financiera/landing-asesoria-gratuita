export type QuestionType = 'text' | 'email' | 'tel' | 'single-choice';

export interface Option {
    label: string;
    value: string;
}

export interface Question {
    id: string;
    type: QuestionType;
    question: string;
    description?: string;
    options?: Option[];
    placeholder?: string;
    required?: boolean;
}

export interface DisqualificationRule {
    questionId: string;
    operator: 'equals' | 'not-equals';
    value: string;
}

export interface FormConfig {
    questions: Question[];
    disqualificationRules: DisqualificationRule[];
}

export const funnelConfig: FormConfig = {
    disqualificationRules: [
        {
            questionId: "ingresos",
            operator: "equals",
            value: "menos_3m",
        },
        {
            questionId: "flujo_caja",
            operator: "equals",
            value: "menos_300k",
        },
        {
            questionId: "capacidad_ahorro",
            operator: "equals",
            value: "menos_500k",
        },
        {
            questionId: "capital_liquido",
            operator: "equals",
            value: "menos_5m",
        }
    ],
    questions: [
        {
            id: "nombre",
            type: "text",
            question: "¿Cuál es tu nombre completo?",
            placeholder: "Ej. María Pérez",
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
            options: [
                { label: "Organizar mis finanzas", value: "organizar" },
                { label: "Salir de deudas", value: "deudas" },
                { label: "Empezar a invertir capital", value: "invertir" },
                { label: "Escalar inversiones que ya tengo", value: "escalar" },
                { label: "Estructurar mi plan de retiro", value: "retiro" },
            ],
            required: true,
        },
        {
            id: "momento_vida",
            type: "single-choice",
            question: "¿Con qué momento de vida te identificas?",
            options: [
                { label: "Solter@ sin hijos", value: "soltero" },
                { label: "Solter@ con hijos", value: "soltero_hijos" },
                { label: "Pareja sin hijos", value: "pareja" },
                { label: "Casad@ sin hijos", value: "casado" },
                { label: "Casad@ con hijos", value: "casado_hijos" },
            ],
            required: true,
        },
        {
            id: "ingresos",
            type: "single-choice",
            question: "Tu nivel de ingresos hoy está en el rango de:",
            options: [
                { label: "Menos de $3.000.000", value: "menos_3m" },
                { label: "Entre $3.000.000 y $5.000.000", value: "3m_5m" },
                { label: "Entre $5.000.000 y $10.000.000", value: "5m_10m" },
                { label: "Más de $10.000.000", value: "mas_10m" },
            ],
            required: true,
        },
        {
            id: "flujo_caja",
            type: "single-choice",
            question: "Al final del mes, ¿cuánto suele quedarte en flujo de caja libre?",
            options: [
                { label: "Menos de $300.000", value: "menos_300k" },
                { label: "Entre $300.000 y $800.000", value: "300k_800k" },
                { label: "Entre $800.000 y $1.500.000", value: "800k_1.5m" },
                { label: "Entre $1.500.000 y $3.000.000", value: "1.5m_3m" },
                { label: "Más de $3.000.000", value: "mas_3m" },
            ],
            required: true,
        },
        {
            id: "capacidad_ahorro",
            type: "single-choice",
            question: "¿Cuánto puedes destinar mensualmente para invertir sin afectar tu estilo de vida?",
            options: [
                { label: "Menos de $500.000", value: "menos_500k" },
                { label: "Entre $500.000 y $1.500.000", value: "500k_1.5m" },
                { label: "Entre $1.500.000 y $3.000.000", value: "1.5m_3m" },
                { label: "Más de $3.000.000", value: "mas_3m" },
            ],
            required: true,
        },
        {
            id: "capital_liquido",
            type: "single-choice",
            question: "¿Cuánto capital líquido tienes disponible hoy para invertir?",
            options: [
                { label: "Menos de $5 millones", value: "menos_5m" },
                { label: "Entre $5 y $20 millones", value: "5m_20m" },
                { label: "Entre $20 y $50 millones", value: "20m_50m" },
                { label: "Más de $50 millones", value: "mas_50m" },
            ],
            required: true,
        },
        {
            id: "experiencia",
            type: "single-choice",
            question: "¿Cuál es tu experiencia invirtiendo?",
            options: [
                { label: "No he invertido antes", value: "ninguna" },
                { label: "CDT / fondos conservadores", value: "conservador" },
                { label: "Fondos, ETFs o acciones", value: "moderado" },
                { label: "Bienes raíces / inversiones internacionales", value: "avanzado" },
            ],
            required: true,
        }
    ]
};
