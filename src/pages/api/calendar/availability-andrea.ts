// src/pages/api/calendar/availability-andrea.ts
export const prerender = false;

import type { APIRoute } from 'astro';

const CLINT_API_KEY = 'U2FsdGVkX1+dyDsqKNRQ2D4DpjOtA9OXhlwMY6YjbD2LeXJD/eZ0+pDh4eVYOXuSv4BRdBTeDEgswf2I7Ym6tw==';
const CLINT_BASE_URL = 'https://api.clint.digital/v1';

import { COACH_CONFIG } from '../../../utils/coachConfig';

// Import Google Calendar Logic
import { getCoachesAvailability } from '../../../utils/googleCalendar';
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
        const usersArray = clintUsers.data || clintUsers;

        // 2. Filter ONLY Andrea Estrada for testing
        const coaches = usersArray.filter((user: any) =>
            user.email && user.email.toLowerCase() === 'andrea.estrada@financieramentecu.com'
        );

        // 3. Calendar Availability Logic
        const availableSlots: Record<string, { time: string, coach: string }[]> = {};
        const today = new Date();

        // Define standard slots we want to offer (06:00 to 19:00)
        const STANDARD_SLOTS: string[] = [];
        let currentMinutes = 6 * 60; // 6:00 AM
        const endMinutes = 19 * 60; // 7:00 PM

        while (currentMinutes + 45 <= endMinutes) {
            const h = Math.floor(currentMinutes / 60);
            const m = currentMinutes % 60;
            const hourStr = h.toString().padStart(2, '0');
            const minStr = m.toString().padStart(2, '0');
            STANDARD_SLOTS.push(`${hourStr}:${minStr}`);
            currentMinutes += 45;
        }

        const startForApi = new Date(today);
        startForApi.setDate(today.getDate() + 2);
        startForApi.setHours(0, 0, 0, 0);

        const endForApi = new Date(today);
        endForApi.setDate(today.getDate() + 11);
        endForApi.setHours(0, 0, 0, 0);

        const coachEmails = coaches.map((c: any) => c.email);
        const allBusyPeriods = await getCoachesAvailability(coachEmails, startForApi.toISOString(), endForApi.toISOString());

        let basePointer = getAssigneePointer();
        if (basePointer >= coaches.length) basePointer = 0;

        // Available 2 to 10 days from now
        for (let i = 2; i <= 10; i++) {
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + i);
            const dayOfWeek = nextDate.getDay();

            if (dayOfWeek >= 1 && dayOfWeek <= 6) {
                const dateStr = nextDate.toISOString().split('T')[0];
                availableSlots[dateStr] = [];

                for (const slot of STANDARD_SLOTS) {
                    const slotStart = new Date(`${dateStr}T${slot}:00-05:00`).getTime();
                    const slotEnd = slotStart + 45 * 60 * 1000; // 45 min slot

                    let assignedCoachEmail = null;

                    for (let cIdx = 0; cIdx < coaches.length; cIdx++) {
                        const currentIdx = (basePointer + cIdx) % coaches.length;
                        const potentialCoach = coaches[currentIdx];
                        const busyPeriods = allBusyPeriods[potentialCoach.email] || [];

                        const isBusy = busyPeriods.some((busy: any) => {
                            const bStart = new Date(busy.start).getTime();
                            const bEnd = new Date(busy.end).getTime();
                            return (slotStart < bEnd && slotEnd > bStart);
                        });

                        if (!isBusy) {
                            assignedCoachEmail = potentialCoach.email;
                            break;
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
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
