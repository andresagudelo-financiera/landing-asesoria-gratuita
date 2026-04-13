import db from './db';

const POINTER_ID = 1;

/**
 * Reads the current assignee pointer from DB.
 * Used for read-only checks (like availability display).
 * Automatically wraps around if it exceeds totalCoaches.
 */
export function getAssigneePointer(totalCoaches?: number): number {
    try {
        const row = db.prepare('SELECT current_index FROM assignee_pointer WHERE id = ?').get(POINTER_ID) as { current_index: number } | undefined;
        let idx = row && typeof row.current_index === 'number' ? row.current_index : 0;

        // Wrap if the coach list has shrunk (safety)
        if (totalCoaches && totalCoaches > 0 && idx >= totalCoaches) {
            idx = 0;
        }

        return idx;
    } catch (e) {
        console.error('[Pointer] Error reading assignee pointer from DB:', e);
        return 0;
    }
}

/**
 * Gets the current pointer (for assignment) and atomically increments it.
 * Returns the index to use for the current assignment.
 *
 * Only call this when you are actually assigning a coach via round-robin.
 * If the coach was pre-selected (coachEmail provided), do NOT call this.
 */
export function getAndIncrementPointer(totalCoaches: number): number {
    if (totalCoaches <= 0) return 0;

    const transaction = db.transaction(() => {
        // 1. Read current index
        const row = db.prepare('SELECT current_index FROM assignee_pointer WHERE id = ?').get(POINTER_ID) as { current_index: number } | undefined;
        let currentIndex = row && typeof row.current_index === 'number' ? row.current_index : 0;

        // 2. Safety: wrap if out of bounds (e.g. coach list changed)
        if (currentIndex >= totalCoaches) {
            currentIndex = 0;
        }

        // 3. Calculate next index (rotating round-robin)
        const nextIndex = (currentIndex + 1) % totalCoaches;

        // 4. Persist next index atomically
        db.prepare(
            'UPDATE assignee_pointer SET current_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).run(nextIndex, POINTER_ID);

        console.log(`[Pointer] Round-robin: using index ${currentIndex}, next will be ${nextIndex} (total: ${totalCoaches})`);

        // Return current index for this assignment
        return currentIndex;
    });

    return transaction();
}

/**
 * Checks if a lead with the same email or phone already has an assigned coach.
 * Returns the coach email if found, null otherwise.
 */
export function checkExistingAssignment(email?: string, phone?: string): string | null {
    try {
        if (!email && !phone) return null;

        let query = 'SELECT coach_email FROM lead_assignments WHERE 1=0';
        const params: any[] = [];

        if (email) {
            query += ' OR email = ?';
            params.push(email.toLowerCase().trim());
        }
        if (phone) {
            const cleanPhone = phone.replace(/[^\d]/g, '');
            if (cleanPhone) {
                query += ' OR phone = ?';
                params.push(cleanPhone);
            }
        }

        // Get the most recent assignment if multiple exist
        const row = db.prepare(`${query} ORDER BY created_at DESC LIMIT 1`).get(...params) as { coach_email: string } | undefined;
        return row ? row.coach_email : null;
    } catch (e) {
        console.error('[Pointer] Error checking existing assignment:', e);
        return null;
    }
}

/**
 * Records a new assignment for deduplication.
 */
export function saveAssignment(email: string | undefined, phone: string | undefined, coachEmail: string): void {
    try {
        const cleanEmail = email ? email.toLowerCase().trim() : null;
        const cleanPhone = phone ? phone.replace(/[^\d]/g, '') : null;

        db.prepare(
            'INSERT INTO lead_assignments (email, phone, coach_email) VALUES (?, ?, ?)'
        ).run(cleanEmail, cleanPhone, coachEmail);
        
        console.log(`[Pointer] Saved assignment for ${cleanEmail || 'unknown'} / ${cleanPhone || 'unknown'} -> ${coachEmail}`);
    } catch (e) {
        console.error('[Pointer] Error saving assignment:', e);
    }
}

/**
 * Forcefully resets the pointer to a specific index.
 * Useful for admin/debug resets.
 */
export function resetPointer(index: number = 0): void {
    try {
        db.prepare(
            'UPDATE assignee_pointer SET current_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).run(index, POINTER_ID);
        console.log(`[Pointer] Reset to index ${index}`);
    } catch (e) {
        console.error('[Pointer] Error resetting pointer:', e);
    }
}
