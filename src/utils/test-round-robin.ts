import { COACH_CONFIG } from './coachConfig';

function simulate() {
    console.log("=== LISTA DE COACHES INTERCALADOS (COACH_CONFIG) ===");
    COACH_CONFIG.forEach((c, i) => {
        console.log(`${i}: ${c.email} (${c.leader})`);
    });

    console.log("\n=== SIMULACIÓN DE ORDEN DE SELECCIÓN (Next 20) ===");
    let pointer = 8; // Simulado desde el DB actual
    for (let i = 0; i < 20; i++) {
        const current = COACH_CONFIG[pointer];
        console.log(`Lead ${i+1}: ${current.email} [Team: ${current.leader}]`);
        pointer = (pointer + 1) % COACH_CONFIG.length;
    }
}

simulate();
