// src/pages/api/calendar/availability.ts
export const prerender = false;

import type { APIRoute } from 'astro';

const CLINT_API_KEY = 'U2FsdGVkX1+dyDsqKNRQ2D4DpjOtA9OXhlwMY6YjbD2LeXJD/eZ0+pDh4eVYOXuSv4BRdBTeDEgswf2I7Ym6tw==';
const CLINT_BASE_URL = 'https://api.clint.digital/v1';

// Lista curada de los emails de los Coaches válidos según lo conversado (13)
import { COACH_CONFIG } from '../../../utils/coachConfig';

// Import Google Calendar Logic
import { getCoachesAvailability } from '../../../utils/googleCalendar';
import { getAssigneePointer, getAndIncrementPointer } from '../../../utils/assigneePointer';
import { isColombiaHoliday } from '../../../utils/colombiaHolidays';

export const GET: APIRoute = async ({ request }) => {
    try {
        // 1. Fetch Coaches from Clint API
        const clintRes = await fetch(`${CLINT_BASE_URL}/users`, {
            method: 'GET',
            headers: {
                'api-token': CLINT_API_KEY,
                'Accept': 'application/json'
            }
        });

        if (!clintRes.ok) {
            throw new Error(`Clint API Error: ${clintRes.statusText}`);
        }

        const clintUsers = await clintRes.json();

        const usersArray = clintUsers.data || clintUsers; // Manejar si viene en .data o directo

        // 2. Filter only valid & active coaches WITH calendlyUrl, preserving COACH_CONFIG order (interleaved)
        const coaches = COACH_CONFIG
            .filter(config => config.active !== false && config.calendlyUrl)
            .map(config => {
                const clintUser = usersArray.find((user: any) => user.email?.toLowerCase() === config.email.toLowerCase());
                if (clintUser) {
                    return { ...clintUser, configLeader: config.leader };
                }
                return null;
            })
            .filter(Boolean);

        // 3. Calendar Availability Logic
        const availableSlots: Record<string, { time: string, coach: string }[]> = {};
        const today = new Date();

        // Define standard slots we want to offer (06:00 to 19:00)
        const STANDARD_SLOTS: string[] = [];
        for (let h = 6; h <= 19; h++) {
            const hourStr = h.toString().padStart(2, '0');
            STANDARD_SLOTS.push(`${hourStr}:00`);
            if (h !== 19) {
                STANDARD_SLOTS.push(`${hourStr}:30`);
            }
        }

        const startForApi = new Date(today);
        startForApi.setDate(today.getDate() + 2);
        startForApi.setHours(0, 0, 0, 0);

        const endForApi = new Date(today);
        endForApi.setDate(today.getDate() + 11);
        endForApi.setHours(0, 0, 0, 0);

        const coachEmails = coaches.map((c: any) => c.email);
        const allBusyPeriods = await getCoachesAvailability(coachEmails, startForApi.toISOString(), endForApi.toISOString());

        // 4. Obtener y avanzar el puntero global atómicamente para que la próxima carga empiece en otro lugar
        const basePointer = getAndIncrementPointer(coaches.length);

        // Usamos un puntero local que irá rotando entre cada slot/día para distribuir la carga equitativamente
        let localPointer = basePointer;

        // Available 2 to 10 days from now
        for (let i = 2; i <= 10; i++) {
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + i);
            const dayOfWeek = nextDate.getDay();

            // Monday (1) through Saturday (6)
            if (dayOfWeek >= 1 && dayOfWeek <= 6) {
                const dateStr = [
                    nextDate.getFullYear(),
                    String(nextDate.getMonth() + 1).padStart(2, '0'),
                    String(nextDate.getDate()).padStart(2, '0')
                ].join('-');

                if (isColombiaHoliday(dateStr)) {
                    availableSlots[dateStr] = [];
                    continue;
                }

                availableSlots[dateStr] = [];

                for (const slot of STANDARD_SLOTS) {
                    const slotStart = new Date(`${dateStr}T${slot}:00-05:00`).getTime();
                    const slotEnd = slotStart + 30 * 60 * 1000; // 30 min slot

                    let assignedCoachEmail = null;

                    // Rotación interna: buscamos al primer coach libre empezando desde localPointer
                    for (let cIdx = 0; cIdx < coaches.length; cIdx++) {
                        const currentIdx = (localPointer + cIdx) % coaches.length;
                        const potentialCoach = coaches[currentIdx];
                        const busyPeriods = allBusyPeriods[potentialCoach.email] || [];

                        const isBusy = busyPeriods.some((busy: any) => {
                            const bStart = new Date(busy.start).getTime();
                            const bEnd = new Date(busy.end).getTime();
                            return (slotStart < bEnd && slotEnd > bStart);
                        });

                        if (!isBusy) {
                            assignedCoachEmail = potentialCoach.email;
                            // Avanzamos el puntero local para el PRÓXIMO slot
                            localPointer = (currentIdx + 1) % coaches.length;
                            break; // Encontrado!
                        }
                    }

                    if (assignedCoachEmail) {
                        availableSlots[dateStr].push({ time: slot, coach: assignedCoachEmail });
                    }
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            coachesFound: coaches.length,
            coaches: coaches.map((c: any) => ({
                id: c.id,
                name: `${c.first_name} ${c.last_name}`,
                email: c.email
            })),
            availability: availableSlots
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Error fetching availability'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
