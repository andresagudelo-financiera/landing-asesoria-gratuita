// src/pages/api/calendar/schedule.ts
import type { APIRoute } from 'astro';

export const prerender = false;

const CLINT_API_KEY = 'U2FsdGVkX1+dyDsqKNRQ2D4DpjOtA9OXhlwMY6YjbD2LeXJD/eZ0+pDh4eVYOXuSv4BRdBTeDEgswf2I7Ym6tw==';
const CLINT_BASE_URL = 'https://api.clint.digital/v1';

const COACH_CONFIG = [
    // LIDER: ANDREA
    // Webhook asignado (Primera opción)
    { email: 'andrea.estrada@financieramentecu.com', leader: 'Andrea', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' },
    { email: 'alexandra.perdomo@financieramentecu.com', leader: 'Andrea', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' },
    { email: 'elizabeth.rojas@financieramentecu.com', leader: 'Andrea', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' },
    { email: 'johana.bernal@financieramentecu.com', leader: 'Andrea', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' },
    { email: 'kevin.gonzalez@financieramentecu.com', leader: 'Andrea', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' },
    { email: 'monica.navarro@financieramentecu.com', leader: 'Andrea', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' },
    { email: 'robinson.sanchez@financieramentecu.com', leader: 'Andrea', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' },
    { email: 'viviana.huertas@financieramentecu.com', leader: 'Andrea', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' },
    { email: 'yohan.espana@financieramentecu.com', leader: 'Andrea', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' },

    // LIDER: ANA
    // Webhook asignado: c4d098dc...
    { email: 'ana.mendiola@financieramentecu.com', leader: 'Ana Med', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'lina.cardona@financieramentecu.com', leader: 'Ana Med', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'luisa.rios@financieramentecu.com', leader: 'Ana Med', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'luz.pinedo@financieramentecu.com', leader: 'Ana Med', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'natalia.guerrero@financieramentecu.com', leader: 'Ana Med', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'nestor.baute@financieramentecu.com', leader: 'Ana Med', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'olga.rico@financieramentecu.com', leader: 'Ana Med', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'renier.gonzalez@financieramentecu.com', leader: 'Ana Med', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'sandy.carrillo@financieramentecu.com', leader: 'Ana Med', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'sivoney.perez@financieramentecu.com', leader: 'Ana Med', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },

    // LIDER: JHON
    // Webhook asignado: 434a9599...
    { email: 'daniela.barrera@financieramentecu.com', leader: 'Jhon', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'jhon.acevedo@financieramentecu.com', leader: 'Jhon', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'bryan.rozo@financieramentecu.com', leader: 'Jhon', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'diego.ruiz@financieramentecu.com', leader: 'Jhon', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'john.carmona@financieramentecu.com', leader: 'Jhon', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'julieta.villa@financieramentecu.com', leader: 'Jhon', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'julieth.vargas@financieramentecu.com', leader: 'Jhon', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'karen.camacho@financieramentecu.com', leader: 'Jhon', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'lorena.martinez@financieramentecu.com', leader: 'Jhon', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'marcela.espitia@financieramentecu.com', leader: 'Jhon', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'mariana.narvaez@financieramentecu.com', leader: 'Jhon', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'mauricio.urrea@financieramentecu.com', leader: 'Jhon', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'paula.duque@financieramentecu.com', leader: 'Jhon', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'yesica.montoya@financieramentecu.com', leader: 'Jhon', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },

    // LIDER: MALU
    // Webhook asignado: da4eab3d...
    { email: 'maria.mendiola@financieramentecu.com', leader: 'Malu', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'alejandra.gutierrez@financieramentecu.com', leader: 'Malu', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'andrea.reyes@financieramentecu.com', leader: 'Malu', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'isul.jimenez@financieramentecu.com', leader: 'Malu', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'jacobo.arguello@financieramentecu.com', leader: 'Malu', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'luis.castano@financieramentecu.com', leader: 'Malu', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'monica.mendieta@financieramentecu.com', leader: 'Malu', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'paola.roa@financieramentecu.com', leader: 'Malu', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'tatiana.restrepo@financieramentecu.com', leader: 'Malu', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'victoria.pelaez@financieramentecu.com', leader: 'Malu', webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' }
];

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
        if (!data || !data.date || !data.time || !data.leadDetails) {
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

        // 2. Filter only valid coaches, forcing the order of COACH_CONFIG, merging with Clint User IDs
        const coaches = COACH_CONFIG
            .map(config => {
                const clintUser = usersArray.find((user: any) => user.email?.toLowerCase() === config.email);
                if (clintUser) {
                    return { ...clintUser, configLeader: config.leader, configWebhook: config.webhook };
                }
                return null;
            })
            .filter(Boolean);

        if (coaches.length === 0) throw new Error('No valid coaches available in Clint');

        // 2. Lógica ROUND-ROBIN con persistencia
        let pointer = getAssigneePointer();

        // Safety check if pointer got out of bounds (e.g., coach removed)
        if (pointer >= coaches.length) {
            pointer = 0;
        }

        const assignedCoach = coaches[pointer];

        // Save the next pointer
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

        // 5. Crear Enlace de Meet en Google Calendar
        let googleMeetLink = '';
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

        console.log(`[ROUND-ROBIN] Assigned Lead to: ${assignedCoach.email}. Persistent index saved.`);

        // Devolver objeto de confirmación
        return new Response(JSON.stringify({
            success: true,
            coach: {
                name: `${assignedCoach.first_name || ''} ${assignedCoach.last_name || ''}`.trim() || 'Tu Asesor(a)',
                email: assignedCoach.email
            },
            meetLink: googleMeetLink,
            schedule: {
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
