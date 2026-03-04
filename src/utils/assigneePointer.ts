import fs from 'fs';
import path from 'path';
import os from 'os';

// Store in /tmp instead of project root to prevent Vite dev server from triggering full page reloads on file change
const POINTER_FILE = path.join(os.tmpdir(), '.assignee_pointer.json');
export function getAssigneePointer(): number {
    try {
        if (fs.existsSync(POINTER_FILE)) {
            const data = fs.readFileSync(POINTER_FILE, 'utf8');
            const parsed = JSON.parse(data);
            return typeof parsed.index === 'number' ? parsed.index : 0;
        }
    } catch (e) {
        console.error("Error reading assignee pointer:", e);
    }
    return 0; // Default to 0 if file doesn't exist or fails
}

export function saveAssigneePointer(index: number): void {
    try {
        fs.writeFileSync(POINTER_FILE, JSON.stringify({ index }), 'utf8');
    } catch (e) {
        console.error("Error saving assignee pointer:", e);
    }
}
