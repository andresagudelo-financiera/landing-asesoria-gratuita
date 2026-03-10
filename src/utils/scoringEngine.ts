// src/utils/scoringEngine.ts

export type AnswerMap = {
    [questionId: number]: number; // 1 (A), 2 (B), 3 (C)
};

export type ProfileResult = 'Conservador' | 'Moderado' | 'Agresivo' | 'Arriesgado' | 'No Aplica';

export interface ScoreOutput {
    score: number;
    profile: ProfileResult;
    rentabilidad: string;
    recomendacion: string;
    insights: {
        ahorro: { level: string; color: string; label: string };
        deuda: { level: string; color: string; label: string };
        conocimiento: { level: string; color: string; label: string };
    };
}

export function calculateScore(answers: AnswerMap): ScoreOutput {
    // Sum of points: A=1, B=2, C=3
    const sum = Object.values(answers).reduce((acc, val) => acc + (val || 1), 0);

    // Final score scaled to 0-100 for admin display (5 is 0%, 15 is 100%)
    const finalScore = Math.round(((sum - 5) / (15 - 5)) * 100);

    let profile: ProfileResult = 'Conservador';
    let rentabilidad = '';
    let recomendacion = '';

    if (sum <= 7) {
        profile = 'Conservador';
        rentabilidad = '4.0 – 6.9%';
        recomendacion = 'Lo ideal para ti son inversiones seguras con rendimiento estable.';
    } else if (sum <= 10) {
        profile = 'Moderado';
        rentabilidad = '7.0 – 8.9%';
        recomendacion = 'Puedes invertir en una mezcla de activos, equilibrando seguridad y crecimiento.';
    } else if (sum <= 13) {
        profile = 'Agresivo';
        rentabilidad = '9.0 – 13.9%';
        recomendacion = 'Estás listo para buscar altos rendimientos y asumir más riesgos en el camino.';
    } else {
        profile = 'Arriesgado';
        rentabilidad = '≥ 14.0%';
        recomendacion = 'Te gusta asumir muchos riesgos y no tienes preocupaciones de liquidez. Sin embargo, ¡Cuidado! No tener una adecuada planeación podría generarte problemas en el futuro.';
    }

    // Adapt insights to new simplified questionnaire (approximate mapping)
    const insights = extractSoftInsights(answers);

    return {
        score: finalScore,
        profile,
        rentabilidad,
        recomendacion,
        insights
    };
}

function extractSoftInsights(answers: AnswerMap) {
    // Mapping Q1 (Horizon) to "Potencial de Crecimiento"
    const horizonVal = answers[1] || 1;
    const ahorro = {
        level: horizonVal === 3 ? 'Largo Plazo' : horizonVal === 2 ? 'Mediano Plazo' : 'Enfoque Inmediato',
        color: horizonVal === 3 ? 'bg-green-100 text-green-800 border-green-200' : horizonVal === 2 ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-red-100 text-red-800 border-red-200',
        label: 'Horizonte de Inversión'
    };

    // Mapping Q2/Q5 (Tolerance) to "Perfil de Resiliencia"
    const tolVal = (answers[2] || 1) + (answers[5] || 1);
    const deuda = {
        level: tolVal >= 5 ? 'Alta Resiliencia' : tolVal >= 3 ? 'Equilibrado' : 'Prudente',
        color: tolVal >= 5 ? 'bg-green-100 text-green-800 border-green-200' : tolVal >= 3 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200',
        label: 'Tolerancia al Riesgo'
    };

    // Mapping Q4 (Research) to "Interés Formativo"
    const conVal = answers[11] || 1; // Research time
    const conocimiento = {
        level: conVal === 3 ? 'Explorador Activo' : conVal === 2 ? 'En Aprendizaje' : 'Delegador Estratégico',
        color: conVal === 3 ? 'bg-purple-100 text-purple-800 border-purple-200' : conVal === 2 ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-800 border-gray-200',
        label: 'Perfil de Conocimiento'
    };

    return { ahorro, deuda, conocimiento };
}
