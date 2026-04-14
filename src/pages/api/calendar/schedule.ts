// src/pages/api/calendar/schedule.ts
import type { APIRoute } from 'astro';

export const prerender = false;

// [GHL] GoHighLevel Inbound Webhook URL (desde .env)
const GHL_WEBHOOK_URL = import.meta.env.GHL_WEBHOOK_URL || process.env.GHL_WEBHOOK_URL;

// [N8N] Webhook de respaldo redundante (desde .env)
const N8N_WEBHOOK_URL = import.meta.env.N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;

import { COACH_CONFIG } from '../../../utils/coachConfig';
import { getAndIncrementPointer, checkExistingAssignment, saveAssignment } from '../../../utils/assigneePointer';


// [FASE 4] Google Calendar desconectado — importación eliminada
// import { createGoogleMeetEvent } from '../../../utils/googleCalendar';

export const POST: APIRoute = async ({ request }) => {
    try {
        let data: any = {};
        try {
            data = await request.json();
            console.log("SCHEDULE PAYLOAD RECEIVED:", data);
        } catch (err: any) {
            console.error("Payload read error:", err.message);
            return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400 });
        }

        // [FASE 4] Validación simplificada: solo requerimos leadDetails (date/time ya no existen)
        if (!data || !data.leadDetails) {
            console.log("Validation failed. Missing leadDetails.");
            return new Response(JSON.stringify({ error: 'Faltan detalles del lead' }), { status: 400 });
        }

        // ─── FASE 2.1: CONGELADOR — Early return para leads descalificados ───────
        if (data.leadDetails?.nivel_calificacion === "Baja") {
            try {
                const rawPhoneBaja = (data.leadDetails.telefono || '').replace(/[^\d]/g, '');
                let ddiBaja = "+57";
                let numBaja = rawPhoneBaja;
                if (rawPhoneBaja.startsWith('57') && rawPhoneBaja.length > 10) {
                    numBaja = rawPhoneBaja.substring(2);
                } else if (rawPhoneBaja.length > 10 && !rawPhoneBaja.startsWith('3')) {
                    ddiBaja = `+${rawPhoneBaja.substring(0, 2)}`;
                    numBaja = rawPhoneBaja.substring(2);
                }

                const fullNameBaja = data.leadDetails.nombre || 'Sin Nombre';
                const namePartsBaja = fullNameBaja.split(' ');

                const webhookPayload: Record<string, any> = {
                    "first_name": namePartsBaja[0] || '',
                    "last_name": namePartsBaja.slice(1).join(' ') || '',
                    "email": data.leadDetails.email || '',
                    "phone": `${ddiBaja}${numBaja}`,
                    "source": data.leadDetails.fuente || "ADS",
                    "customData": {
                        "lead_id": data.leadDetails.lead_id || '',
                        "ingresos": data.leadDetails.ingresos || '',
                        "objetivo": data.leadDetails.objetivo || '',
                        "capital_liquido": data.leadDetails.capital_disponible || '',
                        "nivel_calificacion": data.leadDetails.nivel_calificacion,
                        "agencia": data.leadDetails.agencia || "Sin atribuir",
                        "utm_campaign": data.leadDetails.utm_campaign || '',
                        "utm_source": data.leadDetails.utm_source || '',
                        "utm_medium": data.leadDetails.utm_medium || '',
                    },
                };

                console.log("[CONGELADOR] Lead Baja interceptado. Enviando a GHL nutrición:", webhookPayload);

                await fetch(
                    GHL_WEBHOOK_URL,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify(webhookPayload),
                    }
                );
            } catch (bajaError: any) {
                console.error("[CONGELADOR][GHL] Error al enviar lead Baja a nutrición:", bajaError.message);
            }

            return new Response(
                JSON.stringify({ success: true, message: "Lead derivado a nutrición", skipCalendar: true }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }
        // ─────────────────────────────────────────────────────────────────────────

        // 1. Obtener lista de coaches activos desde la configuración local
        const coaches = COACH_CONFIG
            .filter(config => config.active !== false)
            .map(config => ({
                email: config.email,
                first_name: config.email.split('@')[0].split('.')[0],
                last_name: config.email.split('@')[0].split('.').slice(1).join(' '),
                configLeader: config.leader,
                calendlyUrl: config.calendlyUrl,
            }));

        if (coaches.length === 0) throw new Error('No valid coaches available');

        // 2. Lógica de Asignación (Deduplicación -> Coach específico -> Round-Robin)
        let assignedCoach = coaches[0]; // Default fallback
        let alreadyRegistered = false;
        const requestedCoachEmail = data.coachEmail;
        const leadEmail = data.leadDetails?.email;
        const leadPhone = data.leadDetails?.telefono;

        if (requestedCoachEmail) {
            const matchedCoach = coaches.find(c => c.email?.toLowerCase() === requestedCoachEmail.toLowerCase());
            if (matchedCoach) {
                assignedCoach = matchedCoach;
            } else {
                console.warn(`Requested coach ${requestedCoachEmail} not found, falling back to Round-Robin`);
                assignedCoach = coaches[pointer];
            }
        }

        if (!alreadyRegistered) {
            if (requestedCoachEmail) {
                // Coach preseleccionado: NO consumir el puntero
                const matchedCoach = coaches.find((c: any) => c.email?.toLowerCase() === requestedCoachEmail.toLowerCase());
                if (matchedCoach) {
                    assignedCoach = matchedCoach;
                    console.log(`[ROUND-ROBIN] Coach preseleccionado: ${assignedCoach.email}`);
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
                console.log(`[ROUND-ROBIN] Usando índice ${pointer} → ${assignedCoach.email}`);
            }

            // Registrar nueva asignación para futuras peticiones (Deduplicación)
            saveAssignment(leadEmail, leadPhone, assignedCoach.email);
        }


        const fullName = data.leadDetails.nombre || 'Sin Nombre';

        // ─── 3. Preparar payloads para GHL y n8n ────────────────────────────────
        let rawPhone = data.leadDetails.telefono || '';
        rawPhone = rawPhone.replace(/[^\d]/g, ''); // Leave only digits

        let ddi = "+57";
        let phoneNum = rawPhone;

        if (rawPhone.startsWith('57') && rawPhone.length > 10) {
            phoneNum = rawPhone.substring(2);
        } else if (rawPhone.length > 10 && !rawPhone.startsWith('3')) {
            ddi = `+${rawPhone.substring(0, 2)}`;
            phoneNum = rawPhone.substring(2);
        }

        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const formattedPhone = `${ddi}${phoneNum}`;

        // Payload GHL: estructura anidada con customData
        const ghlPayload: any = {
            "first_name": firstName,
            "last_name": lastName,
            "email": data.leadDetails.email,
            "phone": formattedPhone,
            "source": data.leadDetails.fuente || "ADS",
            "customData": {
                "lead_id": data.leadDetails.lead_id || '',
                "ingresos": data.leadDetails.ingresos || "",
                "objetivo": data.leadDetails.objetivo || "",
                "capital_liquido": data.leadDetails.capital_disponible || "",
                "nivel_calificacion": data.leadDetails.nivel_calificacion || "Baja",
                "agencia": data.leadDetails.agencia || "Sin atribuir",
                "assigned_coach_email": assignedCoach.email,
                "utm_campaign": data.leadDetails.utm_campaign || "",
                "utm_source": data.leadDetails.utm_source || "",
                "utm_medium": data.leadDetails.utm_medium || "",
            },
        };

        // Payload n8n: campos planos sin anidación
        const n8nPayload: any = {
            lead_id: data.leadDetails.lead_id || '',
            fecha: new Date().toISOString(),
            nombre: fullName,
            first_name: firstName,
            last_name: lastName,
            email: data.leadDetails.email || "",
            telefono: formattedPhone,
            ingresos: data.leadDetails.ingresos || "",
            objetivo: data.leadDetails.objetivo || "",
            capital_liquido: data.leadDetails.capital_disponible || "",
            nivel_calificacion: data.leadDetails.nivel_calificacion || "Baja",
            fuente: data.leadDetails.fuente || "ADS",
            agencia: data.leadDetails.agencia || "Sin atribuir",
            assigned_coach_email: assignedCoach.email,
            utm_campaign: data.leadDetails.utm_campaign || "",
            utm_source: data.leadDetails.utm_source || "",
            utm_medium: data.leadDetails.utm_medium || "",
        };

        // ─── 4. Envío paralelo e independiente: GHL + n8n ───────────────────────
        console.log(`[GHL] Enviando lead ${data.leadDetails.email} a GoHighLevel...`);
        console.log(`[N8N] Enviando lead ${data.leadDetails.email} a n8n...`);

        const [ghlResult, n8nResult] = await Promise.allSettled([
            // GHL Inbound Webhook
            fetch(GHL_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(ghlPayload),
            }),
            // n8n Webhook de respaldo
            fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(n8nPayload),
            }),
        ]);

        // ─── 5. Logs independientes por destino ─────────────────────────────────
        // GHL
        if (ghlResult.status === 'fulfilled') {
            const ghlRes = ghlResult.value;
            if (ghlRes.ok) {
                console.log(`[GHL] ✅ Webhook exitoso (${ghlRes.status}): ${await ghlRes.text()}`);
            } else {
                console.error(`[GHL] ❌ Webhook falló (${ghlRes.status}): ${await ghlRes.text()}`);
            }
        } else {
            console.error(`[GHL] ❌ Error de red/fetch: ${ghlResult.reason}`);
        }

        // n8n
        if (n8nResult.status === 'fulfilled') {
            const n8nRes = n8nResult.value;
            if (n8nRes.ok) {
                console.log(`[N8N] ✅ Webhook exitoso (${n8nRes.status}): ${await n8nRes.text()}`);
            } else {
                console.error(`[N8N] ❌ Webhook falló (${n8nRes.status}): ${await n8nRes.text()}`);
            }
        } else {
            console.error(`[N8N] ❌ Error de red/fetch: ${n8nResult.reason}`);
        }

        // [FASE 4] Bloque de Google Calendar eliminado — ahora se usa Calendly
        // const eventData = await createGoogleMeetEvent(...);

        console.log(`[ROUND-ROBIN] Assigned Lead to: ${assignedCoach.email}. Persistent index saved.`);

        // [FASE 4] Resolver configuración local del coach (para obtener calendlyUrl)
        const coachConfig = COACH_CONFIG.find(c => c.email === assignedCoach.email);


        // [FASE 5] Enviar email de respaldo al lead (fire-and-forget, no bloquea la respuesta)
        const coachFirstName = assignedCoach.first_name || assignedCoach.email.split('@')[0].split('.')[0] || '';
        const coachLastName = assignedCoach.last_name || assignedCoach.email.split('@')[0].split('.').slice(1).join(' ') || '';
        const coachDisplayName = `${coachFirstName} ${coachLastName}`.trim() || 'tu Money Strategist';
        sendBackupEmail(
            data.leadDetails.email,
            firstName,
            coachConfig?.calendlyUrl || 'https://calendly.com/default-financiera',
            coachDisplayName
        ).catch((err: any) => console.error('[EMAIL] Error en sendBackupEmail:', err.message));

        return new Response(JSON.stringify({
            success: true,
            alreadyRegistered,
            coach: assignedCoach.email,
            coachName: coachDisplayName,
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

    console.log(`[EMAIL] Backup email enviado a ${leadEmail} (coach: ${coachName})`);
}
// ────────────────────────────────────────────────────────────────────────────
