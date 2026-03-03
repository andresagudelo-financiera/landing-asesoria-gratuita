// src/pages/api/calendar/availability.ts
export const prerender = false;

import type { APIRoute } from 'astro';

const CLINT_API_KEY = 'U2FsdGVkX1+dyDsqKNRQ2D4DpjOtA9OXhlwMY6YjbD2LeXJD/eZ0+pDh4eVYOXuSv4BRdBTeDEgswf2I7Ym6tw==';
const CLINT_BASE_URL = 'https://api.clint.digital/v1';

// Lista curada de los emails de los Coaches válidos según lo conversado (13)
const COACH_CONFIG = [
    // LIDER: ANDREA
    { email: 'andrea.estrada@financieramentecu.com', leader: 'Andrea' },
    { email: 'alexandra.perdomo@financieramentecu.com', leader: 'Andrea' },
    { email: 'elizabeth.rojas@financieramentecu.com', leader: 'Andrea' },
    { email: 'johana.bernal@financieramentecu.com', leader: 'Andrea' },
    { email: 'kevin.gonzalez@financieramentecu.com', leader: 'Andrea' },
    { email: 'monica.navarro@financieramentecu.com', leader: 'Andrea' },
    { email: 'robinson.sanchez@financieramentecu.com', leader: 'Andrea' },
    { email: 'viviana.huertas@financieramentecu.com', leader: 'Andrea' },
    { email: 'yohan.espana@financieramentecu.com', leader: 'Andrea' },

    // LIDER: ANA
    { email: 'ana.mendiola@financieramentecu.com', leader: 'Ana Med' },
    { email: 'lina.cardona@financieramentecu.com', leader: 'Ana Med' },
    { email: 'luisa.rios@financieramentecu.com', leader: 'Ana Med' },
    { email: 'luz.pinedo@financieramentecu.com', leader: 'Ana Med' },
    { email: 'natalia.guerrero@financieramentecu.com', leader: 'Ana Med' },
    { email: 'nestor.baute@financieramentecu.com', leader: 'Ana Med' },
    { email: 'olga.rico@financieramentecu.com', leader: 'Ana Med' },
    { email: 'renier.gonzalez@financieramentecu.com', leader: 'Ana Med' },
    { email: 'sandy.carrillo@financieramentecu.com', leader: 'Ana Med' },
    { email: 'sivoney.perez@financieramentecu.com', leader: 'Ana Med' },

    // LIDER: JHON
    { email: 'daniela.barrera@financieramentecu.com', leader: 'Jhon' },
    { email: 'jhon.acevedo@financieramentecu.com', leader: 'Jhon' },
    { email: 'bryan.rozo@financieramentecu.com', leader: 'Jhon' },
    { email: 'diego.ruiz@financieramentecu.com', leader: 'Jhon' },
    { email: 'john.carmona@financieramentecu.com', leader: 'Jhon' },
    { email: 'julieta.villa@financieramentecu.com', leader: 'Jhon' },
    { email: 'julieth.vargas@financieramentecu.com', leader: 'Jhon' },
    { email: 'karen.camacho@financieramentecu.com', leader: 'Jhon' },
    { email: 'lorena.martinez@financieramentecu.com', leader: 'Jhon' },
    { email: 'marcela.espitia@financieramentecu.com', leader: 'Jhon' },
    { email: 'mariana.narvaez@financieramentecu.com', leader: 'Jhon' },
    { email: 'mauricio.urrea@financieramentecu.com', leader: 'Jhon' },
    { email: 'paula.duque@financieramentecu.com', leader: 'Jhon' },
    { email: 'yesica.montoya@financieramentecu.com', leader: 'Jhon' },

    // LIDER: MALU
    { email: 'maria.mendiola@financieramentecu.com', leader: 'Malu' },
    { email: 'alejandra.gutierrez@financieramentecu.com', leader: 'Malu' },
    { email: 'andrea.reyes@financieramentecu.com', leader: 'Malu' },
    { email: 'isul.jimenez@financieramentecu.com', leader: 'Malu' },
    { email: 'jacobo.arguello@financieramentecu.com', leader: 'Malu' },
    { email: 'luis.castano@financieramentecu.com', leader: 'Malu' },
    { email: 'monica.mendieta@financieramentecu.com', leader: 'Malu' },
    { email: 'paola.roa@financieramentecu.com', leader: 'Malu' },
    { email: 'tatiana.restrepo@financieramentecu.com', leader: 'Malu' },
    { email: 'victoria.pelaez@financieramentecu.com', leader: 'Malu' }
];

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

        // Define standard slots we want to offer
        const STANDARD_SLOTS = ['08:00', '10:00', '14:00', '16:00'];

        for (let i = 1; i <= 10; i++) {
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + i);
            const dayOfWeek = nextDate.getDay();

            // Only Monday (1) through Friday (5)
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
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
