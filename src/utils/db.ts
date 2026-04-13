import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Determinar la ruta de la base de datos
const dbPath = path.resolve(process.cwd(), 'data.db');

// Inicializar la conexión
const db = new Database(dbPath, {
    // verbose: console.log 
});

// Crear tablas si no existen
const initDb = () => {
    // Tabla de leads
    db.prepare(`
        CREATE TABLE IF NOT EXISTS investment_leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            score INTEGER NOT NULL,
            profile TEXT NOT NULL,
            answers TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Tabla de puntero de asignación
    db.prepare(`
        CREATE TABLE IF NOT EXISTS assignee_pointer (
            id INTEGER PRIMARY KEY,
            current_index INTEGER DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Tabla de historial de asignaciones (Deduplicación)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS lead_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            phone TEXT,
            coach_email TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Índices para búsquedas rápidas
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_lead_email ON lead_assignments(email)`).run();
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_lead_phone ON lead_assignments(phone)`).run();

    // Insertar registro inicial si está vacía
    const row = db.prepare('SELECT COUNT(*) as count FROM assignee_pointer').get() as { count: number } | undefined;
    if (row && row.count === 0) {
        db.prepare('INSERT INTO assignee_pointer (id, current_index) VALUES (1, 0)').run();
        console.log('[DB] Initialized assignee_pointer to 0');

        // Migración del archivo JSON antiguo con index persistente
        try {
            const isProd = process.env.NODE_ENV === 'production';
            const POINTER_FILE = isProd
                ? path.join(process.cwd(), '.assignee_pointer.json')
                : path.join(os.tmpdir(), '.assignee_pointer.json');

            if (fs.existsSync(POINTER_FILE)) {
                const data = fs.readFileSync(POINTER_FILE, 'utf8');
                const parsed = JSON.parse(data);
                if (typeof parsed.index === 'number') {
                    db.prepare('UPDATE assignee_pointer SET current_index = ? WHERE id = 1').run(parsed.index);
                    console.log(`[DB] Migrated assignee pointer from JSON: ${parsed.index}`);
                }
            }
        } catch (migrationError) {
            console.warn('[DB] Could not migrate assignee_pointer.json:', migrationError);
        }
    }
};

initDb();

export default db;
