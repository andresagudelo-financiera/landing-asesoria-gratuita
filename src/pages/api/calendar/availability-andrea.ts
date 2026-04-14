// src/pages/api/calendar/availability-andrea.ts
export const prerender = false;

import type { APIRoute } from 'astro';

import { COACH_CONFIG } from '../../../utils/coachConfig';

// Import Google Calendar Logic
import { getCoachesAvailability } from '../../../utils/googleCalendar';
import { getAssigneePointer } from '../../../utils/assigneePointer';

export const GET: APIRoute = async ({ request }) => {
    try {
        // 1. Filter ONLY Andrea Estrada for testing (desde config local)
        const coaches = COACH_CONFIG
            .filter(config => config.email === 'andrea.estrada@financieramentecu.com')
            .map(config => ({
                email: config.email,
                first_name: config.email.split('@')[0].split('.')[0],
                last_name: config.email.split('@')[0].split('.').slice(1).join(' '),
            }));

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
                    const slotEnd = slotStart + 30 * 60 * 1000;

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
