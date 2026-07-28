import { describe, expect, it } from "vitest";
import { isTeamCoachVisible } from "../teamCoaches";

describe("team carousel visibility", () => {
    it.each([
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
    ])("hides %s from the carousel", (coachName) => {
        expect(isTeamCoachVisible(coachName)).toBe(false);
    });

    it("keeps coaches that were not requested for removal", () => {
        expect(isTeamCoachVisible("Lorena Martinez")).toBe(true);
    });
});
