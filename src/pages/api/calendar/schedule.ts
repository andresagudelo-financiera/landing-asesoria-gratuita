// src/pages/api/calendar/schedule.ts
import type { APIRoute } from 'astro';

export const prerender = false;

import { COACH_CONFIG } from '../../../utils/coachConfig';
import { getAndIncrementPointer, checkExistingAssignment, saveAssignment } from '../../../utils/assigneePointer';


// [FASE 4] Google Calendar desconectado — importación eliminada
// import { createGoogleMeetEvent } from '../../../utils/googleCalendar';

export const POST: APIRoute = async ({ request }) => {
    try {
        let data: any = {};
        try {
            data = await request.json();
        } catch (err: any) {
            console.error("Payload read error:", err.message);
            return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400 });
        }

        // [FASE 4] Validación simplificada: solo requerimos leadDetails (date/time ya no existen)
        if (!data || !data.leadDetails) {
            return new Response(JSON.stringify({ error: 'Faltan detalles del lead' }), { status: 400 });
        }

        // ─────────────────────────────────────────────────────────────────────────

        // 1. Obtener lista de coaches desde configuración local (Fuente de Verdad única para GHL)
        const coaches = COACH_CONFIG
            .filter(config => config.active !== false && config.calendlyUrl)
            .map(config => {
                const nameParts = config.email.split('@')[0].split('.');
                const capitalize = (s: string) => s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : '';
                return {
                    email: config.email,
                    configLeader: config.leader,
                    configWebhook: config.webhook,
                    calendlyUrl: config.calendlyUrl,
                    first_name: capitalize(nameParts[0] || ''),
                    last_name: capitalize(nameParts[1] || '')
                };
            });

        if (coaches.length === 0) throw new Error('No valid coaches available in configuration');

        // 2. Lógica de Asignación (Deduplicación -> Coach específico -> Round-Robin)
        const ENABLE_ROUND_ROBIN = false; // [DESHABILITADO PARA GHL]
        const ENABLE_BACKUP_EMAIL = false; // [DESHABILITADO PARA GHL]

        let assignedCoach = coaches[0]; // Default fallback for UI
        let alreadyRegistered = false;
        const requestedCoachEmail = data.coachEmail;
        const leadEmail = data.leadDetails?.email;
        const leadPhone = data.leadDetails?.telefono;

        if (ENABLE_ROUND_ROBIN) {
            // --- CHECK DEDUPLICACIÓN ---
            const existingCoachEmail = checkExistingAssignment(leadEmail, leadPhone);

            if (existingCoachEmail) {
                const matchedExiting = coaches.find((c: any) => c.email?.toLowerCase() === existingCoachEmail.toLowerCase());
                if (matchedExiting) {
                    assignedCoach = matchedExiting;
                    alreadyRegistered = true;
                }
            }

            if (!alreadyRegistered) {
                if (requestedCoachEmail) {
                    // Coach preseleccionado: NO consumir el puntero
                    const matchedCoach = coaches.find((c: any) => c.email?.toLowerCase() === requestedCoachEmail.toLowerCase());
                    if (matchedCoach) {
                        assignedCoach = matchedCoach;
                    } else {
                        // Coach solicitado no existe → fallback a Round-Robin (sí consume el puntero)
                        console.warn(`[ROUND-ROBIN] Coach ${requestedCoachEmail} no encontrado, usando Round-Robin`);
                        const pointer = getAndIncrementPointer(coaches.length);
                        assignedCoach = coaches[pointer];
                    }
                } else {
                    // Sin coach específico → Round-Robin puro
                    const pointer = getAndIncrementPointer(coaches.length);
                    assignedCoach = coaches[pointer];
                }

                // Registrar nueva asignación para futuras peticiones (Deduplicación)
                saveAssignment(leadEmail, leadPhone, assignedCoach.email);
            }
        }

        let debugLogs = [];
        debugLogs.push(`[GHL] Creating Lead for ${data.leadDetails.email} with lead_id: ${data.leadDetails.lead_id || 'EMPTY'}`);

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
            const webhookPayload: any = {
                "nombre": firstName,
                "first-name": firstName,
                "last-name": lastName,
                "email": data.leadDetails.email,
                "telefono": `${ddi}${phoneNum}`,
                "ocupacion": "none",
                "fecha": new Date().toISOString(),
                "ingresos": data.leadDetails.ingresos || "",
                "ahorro": data.leadDetails.flujo_caja || "",
                "capital_liquido": data.leadDetails.capital_disponible || "",
                "patrimonio": data.leadDetails.declara_renta || "",
                "objetivo": data.leadDetails.objetivo || "",
                "coach": ENABLE_ROUND_ROBIN ? assignedCoach.email : "", // [VACÍO] - Se asignará en GHL vía automatización
                "lead_id": data.leadDetails.lead_id || "",
                // [FASE 1] Campos de enriquecimiento enviados por el frontend
                "agencia": data.leadDetails.agencia || "Asygnuz",
                "fuente": data.leadDetails.fuente || "Organico",
                "nivel_calificacion": data.leadDetails.nivel_calificacion || "Baja",
            };

            // Append UTM parameters dynamically
            if (data.leadDetails) {
                Object.keys(data.leadDetails).forEach(key => {
                    if (key.startsWith('utm_')) {
                        webhookPayload[key] = data.leadDetails[key];
                    }
                });
            }

            debugLogs.push(`[GHL] Sending Webhook Payload: ${JSON.stringify(webhookPayload)}`);

            // 3. Send via Webhooks in parallel (GHL and n8n)
            const ghlWebhookUrl = import.meta.env.GHL_WEBHOOK_URL || process.env.GHL_WEBHOOK_URL || 'https://services.leadconnectorhq.com/hooks/vEh7JAwgMFnBubxjOxId/webhook-trigger/8b06b917-b26c-4535-bd62-0886f99b0e3e';
            const n8nWebhookUrl = import.meta.env.N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL || 'https://services.leadconnectorhq.com/hooks/vEh7JAwgMFnBubxjOxId/webhook-trigger/8b06b917-b26c-4535-bd62-0886f99b0e3e';

            const [webhookRes, n8nWebhookRes] = await Promise.all([
                fetch(ghlWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(webhookPayload)
                }),
                fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(webhookPayload)
                })
            ]);

            console.log("n8nWebhookRes", n8nWebhookRes);
            if (!webhookRes.ok) {
                debugLogs.push(`[GHL] Failed Webhook. Status: ${webhookRes.status}. Text: ${await webhookRes.text()}`);


            } else {
                debugLogs.push(`[GHL] Success Webhook: ${await webhookRes.text()}`);
            }
        } catch (crmError: any) {
            debugLogs.push(`[GHL] Unhandled CRM error: ${crmError.message}`);
        }

        // [FASE 4] Resolver configuración local del coach (para obtener calendlyUrl)
        const coachConfig = COACH_CONFIG.find(c => c.email === assignedCoach.email);

        if (ENABLE_BACKUP_EMAIL) {
            const firstName = fullName.split(' ')[0] || fullName;
            const coachDisplayName = `${assignedCoach.first_name || ''} ${assignedCoach.last_name || ''}`.trim() || 'tu Money Strategist';
            sendBackupEmail(
                data.leadDetails.email,
                firstName,
                coachConfig?.calendlyUrl || 'https://calendly.com/default-financiera',
                coachDisplayName
            ).catch((err: any) => console.error('[EMAIL] Error en sendBackupEmail:', err.message));
        }

        return new Response(JSON.stringify({
            success: true,
            alreadyRegistered,
            coach: "unassigned",
            coachName: "Money Strategist",
            calendlyUrl: coachConfig?.calendlyUrl || 'https://calendly.com/default-financiera'
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

// ─── FASE 5: Helper de email de respaldo vía SendGrid REST API ───────────────
async function sendBackupEmail(
    leadEmail: string,
    leadName: string,
    calendlyUrl: string,
    coachName: string
): Promise<void> {
    const apiKey = import.meta.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY;
    if (!apiKey) {
        console.warn('[EMAIL] SENDGRID_API_KEY no definida. Email de respaldo omitido.');
        return;
    }

    const htmlBody = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0d0d0d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0d;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d1f00 100%);padding:40px 40px 30px;text-align:center;border-bottom:2px solid #ff9800;">
          <p style="margin:0 0 8px;font-size:13px;color:#ff9800;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Financieramente CU</p>
          <h1 style="margin:0;font-size:28px;color:#ffffff;font-weight:800;line-height:1.2;">Tu enlace de agendamiento</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="color:#e0e0e0;font-size:16px;line-height:1.7;margin:0 0 16px;">Hola <strong style="color:#ffffff;">${leadName}</strong>,</p>
          <p style="color:#b0b0b0;font-size:15px;line-height:1.7;margin:0 0 24px;">Hemos recibido tu solicitud y te hemos asignado a <strong style="color:#ff9800;">${coachName}</strong>, quien ser&aacute; tu Money Strategist personal para tu sesi&oacute;n estrat&eacute;gica de inversi&oacute;n.</p>
          <p style="color:#b0b0b0;font-size:15px;line-height:1.7;margin:0 0 32px;">Haz clic en el bot&oacute;n para elegir la fecha y hora que mejor te convenga:</p>
          <!-- CTA Button -->
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:32px;">
            <a href="${calendlyUrl}" target="_blank" style="display:inline-block;background-color:#ff9800;color:#000000;font-size:16px;font-weight:800;text-decoration:none;padding:16px 40px;border-radius:100px;letter-spacing:1px;text-transform:uppercase;">Agendar mi sesi&oacute;n</a>
          </td></tr></table>
          <p style="color:#606060;font-size:13px;line-height:1.6;margin:0;border-top:1px solid #2a2a2a;padding-top:24px;">Si el bot&oacute;n no funciona, copia y pega este enlace en tu navegador:<br><a href="${calendlyUrl}" style="color:#ff9800;word-break:break-all;">${calendlyUrl}</a></p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background-color:#111111;padding:24px 40px;text-align:center;border-top:1px solid #2a2a2a;">
          <p style="margin:0;color:#404040;font-size:12px;line-height:1.6;">Este correo fue enviado por Financieramente CU &mdash; Finanzas con Claudia Uribe<br>Si no solicitaste esta sesi&oacute;n, puedes ignorar este mensaje.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const payload = {
        personalizations: [{ to: [{ email: leadEmail }] }],
        from: { email: 'soporte@financieramentecu.com', name: 'Financieramente CU' },
        subject: 'Tu enlace de agendamiento - Financieramente CU',
        content: [{ type: 'text/html', value: htmlBody }],
    };

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`SendGrid ${res.status}: ${errText}`);
    }

}
// ────────────────────────────────────────────────────────────────────────────
