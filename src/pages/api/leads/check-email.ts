// src/pages/api/leads/check-email.ts
import type { APIRoute } from 'astro';
import { checkExistingAssignment } from '../../../utils/assigneePointer';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const { email, phone } = await request.json();

        if (!email && !phone) {
            return new Response(JSON.stringify({ exists: false, error: 'Email o teléfono requerido' }), { status: 400 });
        }

        const existingCoach = checkExistingAssignment(email, phone);

        return new Response(JSON.stringify({ 
            exists: !!existingCoach,
            coach: existingCoach 
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error('[API] Error checking email:', err.message);
        return new Response(JSON.stringify({ exists: false, error: err.message }), { status: 500 });
    }
}
