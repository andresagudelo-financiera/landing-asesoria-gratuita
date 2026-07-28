const HIDDEN_TEAM_COACHES = new Set([
    "Andrea Estrada",
    "Diego Ruiz",
    "Jhon Acevedo",
    "Jacobo Argüello",
    "Mauricio Urrea",
    "Monica Navarro",
    "Marcela Espitia",
    "Kevin Gonzalez",
    "Lina Cardona",
    "Jorge Vera",
    "Sivoney Perez",
]);

export function isTeamCoachVisible(coachName: string): boolean {
    return !HIDDEN_TEAM_COACHES.has(coachName.trim());
}
