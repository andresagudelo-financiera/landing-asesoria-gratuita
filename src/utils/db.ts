import Database from 'better-sqlite3';
import path from 'path';

// Determinar la ruta de la base de datos
// En desarrollo, estará en la raíz del proyecto.
const dbPath = path.resolve(process.cwd(), 'data.db');

// Inicializar la conexión
const db = new Database(dbPath, {
    // verbose: console.log 
});

// Crear tabla si no existe
const initDb = () => {
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
};

initDb();

export default db;
