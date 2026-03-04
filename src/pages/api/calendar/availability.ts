// src/pages/api/calendar/availability.ts
export const prerender = false;

import type { APIRoute } from 'astro';

const CLINT_API_KEY = 'U2FsdGVkX1+dyDsqKNRQ2D4DpjOtA9OXhlwMY6YjbD2LeXJD/eZ0+pDh4eVYOXuSv4BRdBTeDEgswf2I7Ym6tw==';
const CLINT_BASE_URL = 'https://api.clint.digital/v1';

// Lista curada de los emails de los Coaches válidos según lo conversado (13)
import { COACH_CONFIG } from '../../../utils/coachConfig';

// Import Google Calendar Logic
import { checkCoachAvailability } from '../../../utils/googleCalendar';
import { getAssigneePointer } from '../../../utils/assigneePointer';

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

        // 2. Filter only valid coaches
        const validEmails = COACH_CONFIG.map(c => c.email);
        const coaches = usersArray.filter((user: any) =>
            user.email && validEmails.includes(user.email.toLowerCase())
        );

        // 3. Calendar Availability Logic
        const availableSlots: Record<string, string[]> = {};
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

        // Available 2 to 10 days from now
        for (let i = 2; i <= 10; i++) {
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + i);
            const dayOfWeek = nextDate.getDay();

            // Monday (1) through Saturday (6)
            if (dayOfWeek >= 1 && dayOfWeek <= 6) {
                const dateStr = nextDate.toISOString().split('T')[0];
                availableSlots[dateStr] = [];

                let pointer = getAssigneePointer();
                if (pointer >= coaches.length) pointer = 0;
                const nextCoach = coaches[pointer];

                for (const slot of STANDARD_SLOTS) {
                    const slotStart = new Date(`${dateStr}T${slot}:00-05:00`).getTime();
                    const slotEnd = slotStart + 30 * 60 * 1000; // 30 min slot

                    let slotAvailable = false;
                    try {
                        const busyPeriods = await checkCoachAvailability(nextCoach.email, dateStr);

                        const isBusy = busyPeriods.some((busy: any) => {
                            const bStart = new Date(busy.start).getTime();
                            const bEnd = new Date(busy.end).getTime();
                            // Overlap logic
                            return (slotStart < bEnd && slotEnd > bStart);
                        });

                        if (!isBusy) {
                            slotAvailable = true;
                        }
                    } catch (err) {
                        console.error(`Status error for ${nextCoach.email}:`, err);
                    }

                    if (slotAvailable) {
                        availableSlots[dateStr].push(slot);
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
                'Content-Type': 'application/json'
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
