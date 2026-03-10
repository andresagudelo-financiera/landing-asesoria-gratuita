export const prerender = false;
import type { APIRoute } from 'astro';
import db from '../../utils/db';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const { name, email, score, profile, answers } = data;

        if (!name || !email) {
            return new Response(JSON.stringify({ error: 'Name and email are required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        // Comprobar si el correo ya existe
        const existingLead = db.prepare('SELECT id FROM investment_leads WHERE email = ?').get(email);
        if (existingLead) {
            return new Response(JSON.stringify({ error: 'Ya existe un registro con este correo electrónico. Solo puedes realizar el test una vez.' }), {
                status: 409, // Conflict
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const stmt = db.prepare(`
      INSERT INTO investment_leads (name, email, score, profile, answers)
      VALUES (?, ?, ?, ?, ?)
    `);

        const result = stmt.run(name, email, score || 0, profile || '', JSON.stringify(answers || {}));

        return new Response(JSON.stringify({
            success: true,
            id: result.lastInsertRowid
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error saving lead:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
