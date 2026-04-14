import { COACH_CONFIG } from './coachConfig';

function simulate() {
    COACH_CONFIG.forEach((c, i) => {
        console.log(`${i}: ${c.email} (${c.leader})`);
    });

    let pointer = 8; // Simulado desde el DB actual
    for (let i = 0; i < 20; i++) {
        const current = COACH_CONFIG[pointer];
        pointer = (pointer + 1) % COACH_CONFIG.length;
    }
}

simulate();
