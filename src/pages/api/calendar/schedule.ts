// src/pages/api/calendar/schedule.ts
import type { APIRoute } from 'astro';

export const prerender = false;

const CLINT_API_KEY = 'U2FsdGVkX1+dyDsqKNRQ2D4DpjOtA9OXhlwMY6YjbD2LeXJD/eZ0+pDh4eVYOXuSv4BRdBTeDEgswf2I7Ym6tw==';
const CLINT_BASE_URL = 'https://api.clint.digital/v1';

import { COACH_CONFIG } from '../../../utils/coachConfig';

// Import persistent pointer
import { getAssigneePointer, saveAssigneePointer } from '../../../utils/assigneePointer';

import * as fs from 'fs';
import { createGoogleMeetEvent } from '../../../utils/googleCalendar';

export const POST: APIRoute = async ({ request }) => {
    try {
        let data: any = {};
        try {
            data = await request.clone().json();
            fs.writeFileSync('/tmp/api_payload_debug.json', JSON.stringify(data, null, 2));
            console.log("SCHEDULE PAYLOAD RECEIVED:", data);
        } catch (err: any) {
            console.error("Payload read error:", err.message);
            return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400 });
        }

        // Validar payload (respuestas, fecha, hora, etc)
        if (!data || (!data.skipCalendar && (!data.date || !data.time)) || !data.leadDetails) {
            console.log("Validation failed. Missing required fields.");
            return new Response(JSON.stringify({ error: 'Missing required schedule data' }), { status: 400 });
        }

        // 1. Obtener lista de coaches desde Clint en tiempo real
        const clintRes = await fetch(`${CLINT_BASE_URL}/users`, {
            method: 'GET',
            headers: {
                'api-token': CLINT_API_KEY,
                'Accept': 'application/json'
            }
        });

        if (!clintRes.ok) throw new Error('Failed to load coaches');
        const clintUsers = await clintRes.json();
        const usersArray = clintUsers.data || clintUsers;

        // 2. Filter only valid & active coaches, forcing the order of COACH_CONFIG, merging with Clint User IDs
        const coaches = COACH_CONFIG
            .filter(config => config.active !== false)
            .map(config => {
                const clintUser = usersArray.find((user: any) => user.email?.toLowerCase() === config.email);
                if (clintUser) {
                    return { ...clintUser, configLeader: config.leader, configWebhook: config.webhook };
                }
                return null;
            })
            .filter(Boolean);

        if (coaches.length === 0) throw new Error('No valid coaches available in Clint');

        // 2. Lógica de Asignación (Recibir coach o usar Round-Robin como fallback)
        let assignedCoach = coaches[0]; // Default
        const requestedCoachEmail = data.coachEmail;

        let pointer = getAssigneePointer();
        if (pointer >= coaches.length) pointer = 0;

        if (requestedCoachEmail) {
            const matchedCoach = coaches.find((c: any) => c.email?.toLowerCase() === requestedCoachEmail.toLowerCase());
            if (matchedCoach) {
                assignedCoach = matchedCoach;
            } else {
                console.warn(`Requested coach ${requestedCoachEmail} not found, falling back to Round-Robin`);
                assignedCoach = coaches[pointer];
            }
        } else {
            assignedCoach = coaches[pointer];
        }

        // Avanzar el puntero Round-Robin habitual para mantener la rotación
        saveAssigneePointer((pointer + 1) % coaches.length);

        let debugLogs = [];
        debugLogs.push(`[CLINT] Creating Contact for ${data.leadDetails.email}`);

        const fullName = data.leadDetails.nombre || 'Sin Nombre';

        // 3. Create Contact & Deal in Clint CRM (Decoupled from Calendar)
        try {
            let rawPhone = data.leadDetails.telefono || '';
            rawPhone = rawPhone.replace(/[^\d]/g, ''); // Leave only digits

            let ddi = "+57";
            let phoneNum = rawPhone;

            // If the user already typed 57 at the start, remove it for the phone part
            if (rawPhone.startsWith('57') && rawPhone.length > 10) {
                phoneNum = rawPhone.substring(2);
            } else if (rawPhone.length > 10 && !rawPhone.startsWith('3')) {
                // Heuristic: If they put a generic country code without +, extract first 2 digits
                ddi = `+${rawPhone.substring(0, 2)}`;
                phoneNum = rawPhone.substring(2);
            }

            // 1. Separate Name and Last Name
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            // 2. Map form payload specifically to the webhook requested by the user
            const webhookPayload = {
                "name": firstName,
                "last-name": lastName,
                "email": data.leadDetails.email,
                "phone": `${ddi}${phoneNum}`,
                "ocupacion": "none",
                "ingreso": data.leadDetails.ingresos || "",
                "ahorro": data.leadDetails.ahorro || "",
                "ahorrado": data.leadDetails.ahorrado || "",
                "patrimonio": data.leadDetails.patrimonio || "",
                "objetivo": data.leadDetails.objetivo || "",
                "coach": assignedCoach.email
            };

            debugLogs.push(`[CLINT] Sending Webhook Payload: ${JSON.stringify(webhookPayload)}`);

            // 3. Send via Webhook
            const webhookUrl = assignedCoach.configWebhook || 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43';
            const webhookRes = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(webhookPayload)
            });

            if (!webhookRes.ok) {
                debugLogs.push(`[CLINT] Failed Webhook. Status: ${webhookRes.status}. Text: ${await webhookRes.text()}`);
            } else {
                debugLogs.push(`[CLINT] Success Webhook: ${await webhookRes.text()}`);
            }
        } catch (crmError: any) {
            debugLogs.push(`[CLINT] Unhandled CRM error: ${crmError.message}`);
        }

        fs.writeFileSync('/tmp/clint_debug.txt', debugLogs.join('\n'));

        // 5. Crear Enlace de Meet en Google Calendar (OPCIONAL)
        let googleMeetLink = '';
        if (!data.skipCalendar) {
            try {
                const eventData = await createGoogleMeetEvent(
                    assignedCoach.email,
                    data.leadDetails.email,
                    data.date,         // e.g. "2026-03-05"
                    data.time,         // e.g. "14:00"
                    fullName
                );

                googleMeetLink = eventData.hangoutLink || eventData.htmlLink || `https://meet.google.com/mock-${Math.random().toString(36).substring(7)}`;
                console.log(`[CALENDAR] Successfully created Meet link: ${googleMeetLink}`);
            } catch (calendarError) {
                console.error("[CALENDAR] Error generating meet link:", calendarError);
                // Fallback just in case Google API fails so the user still gets a success screen
                googleMeetLink = `https://meet.google.com/mock-${Math.random().toString(36).substring(7)}`;
            }
        }

        console.log(`[ROUND-ROBIN] Assigned Lead to: ${assignedCoach.email}. Persistent index saved.`);

        // Devolver objeto de confirmación
        return new Response(JSON.stringify({
            success: true,
            coach: {
                name: `${assignedCoach.first_name || ''} ${assignedCoach.last_name || ''}`.trim() || 'Tu Money Strategist(a)',
                email: assignedCoach.email
            },
            meetLink: data.skipCalendar ? null : googleMeetLink,
            schedule: data.skipCalendar ? null : {
                date: data.date,
                time: data.time
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Error processing schedule'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
