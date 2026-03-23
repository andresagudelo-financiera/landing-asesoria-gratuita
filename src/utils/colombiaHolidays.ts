// src/utils/colombiaHolidays.ts

function getEaster(year: number): Date {
  const f = Math.floor;
  // Algoritmo de Butcher para el Domingo de Pascua
  const G = year % 19;
  const C = f(year / 100);
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
  const L = I - J;
  const month = 3 + f((L + 40) / 44);
  const day = L + 28 - 31 * f(month / 4);

  return new Date(Date.UTC(year, month - 1, day));
}

function getNextMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getUTCDay();
    // Si es lunes (1), se queda igual.
    // Si es domingo (0), se mueve a lunes (+1 día).
    // Si es de martes (2) a sábado (6), se mueve al próximo lunes (8 - day).
    const daysToAdd = day === 1 ? 0 : (day === 0 ? 1 : 8 - day);
    d.setUTCDate(d.getUTCDate() + daysToAdd);
    return d;
}

export function getColombiaHolidays(year: number): string[] {
    const holidays: Date[] = [];

    // 1. Festivos Fijos
    holidays.push(new Date(Date.UTC(year, 0, 1)));   // Año Nuevo
    holidays.push(new Date(Date.UTC(year, 4, 1)));   // Día del Trabajo
    holidays.push(new Date(Date.UTC(year, 6, 20)));  // Independencia de Colombia
    holidays.push(new Date(Date.UTC(year, 7, 7)));   // Batalla de Boyacá
    holidays.push(new Date(Date.UTC(year, 11, 8)));  // Inmaculada Concepción
    holidays.push(new Date(Date.UTC(year, 11, 25))); // Navidad

    // 2. Festivos Ley Emiliani (Se mueven al siguiente lunes)
    holidays.push(getNextMonday(new Date(Date.UTC(year, 0, 6))));   // Reyes Magos
    holidays.push(getNextMonday(new Date(Date.UTC(year, 2, 19))));  // San José
    holidays.push(getNextMonday(new Date(Date.UTC(year, 5, 29))));  // San Pedro y San Pablo
    holidays.push(getNextMonday(new Date(Date.UTC(year, 7, 15))));  // Asunción de la Virgen
    holidays.push(getNextMonday(new Date(Date.UTC(year, 9, 12))));  // Día de la Raza
    holidays.push(getNextMonday(new Date(Date.UTC(year, 10, 1))));  // Todos los Santos
    holidays.push(getNextMonday(new Date(Date.UTC(year, 10, 11)))); // Independencia de Cartagena

    // 3. Festivos Basados en la Pascua
    const easter = getEaster(year);
    
    // Jueves Santo (Pascua - 3 días)
    const juevesSanto = new Date(easter);
    juevesSanto.setUTCDate(juevesSanto.getUTCDate() - 3);
    holidays.push(juevesSanto);

    // Viernes Santo (Pascua - 2 días)
    const viernesSanto = new Date(easter);
    viernesSanto.setUTCDate(viernesSanto.getUTCDate() - 2);
    holidays.push(viernesSanto);

    // Ascensión del Señor (Pascua + 43 días)
    const ascension = new Date(easter);
    ascension.setUTCDate(ascension.getUTCDate() + 43);
    holidays.push(ascension);

    // Corpus Christi (Pascua + 64 días)
    const corpus = new Date(easter);
    corpus.setUTCDate(corpus.getUTCDate() + 64);
    holidays.push(corpus);

    // Sagrado Corazón (Pascua + 71 días)
    const sagradoCorazon = new Date(easter);
    sagradoCorazon.setUTCDate(sagradoCorazon.getUTCDate() + 71);
    holidays.push(sagradoCorazon);

    // Mapear a string YYYY-MM-DD
    return holidays.map(h => h.toISOString().split('T')[0]);
}

/**
 * Verifica si una fecha dada en formato 'YYYY-MM-DD' es festivo en Colombia.
 */
export function isColombiaHoliday(dateStr: string): boolean {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;
    const year = parseInt(parts[0], 10);
    const holidays = getColombiaHolidays(year);
    return holidays.includes(dateStr);
}
