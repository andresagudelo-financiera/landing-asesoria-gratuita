import db from './db';

const POINTER_ID = 1;

/**
 * Reads the current assignee pointer from DB.
 * Used for read-only checks (like availability display).
 */
export function getAssigneePointer(): number {
    try {
        const row = db.prepare('SELECT current_index FROM assignee_pointer WHERE id = ?').get(POINTER_ID) as { current_index: number } | undefined;
        return row && typeof row.current_index === 'number' ? row.current_index : 0;
    } catch (e) {
        console.error("Error reading assignee pointer from DB:", e);
        return 0;
    }
}

/**
 * Gets the current pointer and increments it atomically using a SQLite transaction.
 * Bounds check included.
 */
export function getAndIncrementPointer(totalCoaches: number): number {
    if (totalCoaches <= 0) return 0;

    const transaction = db.transaction(() => {
        // 1. Get current index
        const row = db.prepare('SELECT current_index FROM assignee_pointer WHERE id = ?').get(POINTER_ID) as { current_index: number } | undefined;
        let currentIndex = row && typeof row.current_index === 'number' ? row.current_index : 0;

        // Bounds check: if size has changed or exceeded
        if (currentIndex >= totalCoaches) {
            currentIndex = 0;
        }

        // 2. Calculate next index (rotating round-robin)
        const nextIndex = (currentIndex + 1) % totalCoaches;

        // 3. Save next index
        db.prepare('UPDATE assignee_pointer SET current_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(nextIndex, POINTER_ID);

        return currentIndex; // Return the one that was read for current assignment
    });

    return transaction();
}
