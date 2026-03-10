import { describe, it, expect } from 'vitest';
import { calculateScore, type AnswerMap } from '../scoringEngine';

describe('Investment Profile Scoring Engine', () => {
    it('should map flat neutral answers (all 3s) to Moderado (score ~60)', () => {
        const answers: AnswerMap = {
            1: 3, 2: 3, 3: 3, 4: 3,
            5: 3, 6: 3, 7: 3,
            8: 3, 9: 3, 10: 3,
            11: 3, 12: 3, 13: 3, 14: 3
        };

        const result = calculateScore(answers);

        // Max per block: CF=20, TR=15, HO=15, CE=20.
        // Answering 3 for all: CF=12, TR=9, HO=9, CE=12
        // Math: CF(60%)*0.4 + TR(60%)*0.3 + HO(60%)*0.2 + CE(60%)*0.1 = 60
        expect(result.score).toBe(60);
        expect(result.profile).toBe('Moderado');
        expect(result.isGateTriggered).toBe(false);
    });

    describe('Restrictive Gates (Overrides)', () => {
        it('Gate 1: should return No Aplica if emergency fund is less than 1 month (Q2=1)', () => {
            // Very aggressive math profile
            const answers: AnswerMap = {
                1: 5, 2: 1, 3: 5, 4: 5,
                5: 5, 6: 5, 7: 5,
                8: 5, 9: 5, 10: 5,
                11: 5, 12: 5, 13: 5, 14: 5
            };

            const result = calculateScore(answers);
            expect(result.profile).toBe('No Aplica');
            expect(result.isGateTriggered).toBe(true);
            expect(result.gateReason).toContain('Sin fondo de emergencia');
        });

        it('Gate 2: should return No Aplica if loss tolerance is zero (Q4=1)', () => {
            const answers: AnswerMap = {
                1: 5, 2: 5, 3: 5, 4: 1,
                5: 5, 6: 5, 7: 5,
                8: 5, 9: 5, 10: 5,
                11: 5, 12: 5, 13: 5, 14: 5
            };

            const result = calculateScore(answers);
            expect(result.profile).toBe('No Aplica');
            expect(result.isGateTriggered).toBe(true);
            expect(result.gateReason).toContain('Capacidad nula de soportar pérdidas');
        });

        it('Gate 3: should cap at Conservador if debt ratio is high (Q3=1) despite high math score', () => {
            const answers: AnswerMap = {
                1: 5, 2: 5, 3: 1, 4: 5,
                5: 5, 6: 5, 7: 5,
                8: 5, 9: 5, 10: 5,
                11: 5, 12: 5, 13: 5, 14: 5
            };

            const result = calculateScore(answers);
            // Math should be high, but profile capped
            expect(result.profile).toBe('Conservador');
            expect(result.isGateTriggered).toBe(true);
            expect(result.gateReason).toContain('Alto nivel de endeudamiento');
        });

        it('Gate 4: should cap at Conservador if horizon is short (Q8=1)', () => {
            const answers: AnswerMap = {
                1: 5, 2: 5, 3: 5, 4: 5,
                5: 5, 6: 5, 7: 5,
                8: 1, 9: 5, 10: 5,
                11: 5, 12: 5, 13: 5, 14: 5
            };

            const result = calculateScore(answers);
            expect(result.profile).toBe('Conservador');
            expect(result.isGateTriggered).toBe(true);
            expect(result.gateReason).toContain('Horizonte de inversión muy corto');
        });
    });

    describe('Profile Mappings (No Gates Triggered)', () => {
        it('should map to Conservador (0-34)', () => {
            const answers: AnswerMap = {
                1: 1, 2: 2, 3: 4, 4: 3, // Passed gates, lower Q3 to keep score at ~33
                5: 1, 6: 1, 7: 1,
                8: 2, 9: 1, 10: 1,
                11: 1, 12: 1, 13: 1, 14: 1
            };
            const result = calculateScore(answers);
            expect(result.profile).toBe('Conservador');
            expect(result.score).toBeLessThanOrEqual(34);
        });

        it('should map to Agresivo (75-100)', () => {
            const answers: AnswerMap = {
                1: 5, 2: 5, 3: 5, 4: 5,
                5: 5, 6: 5, 7: 5,
                8: 5, 9: 5, 10: 5,
                11: 5, 12: 5, 13: 5, 14: 4 // Drop one max just to test
            };
            const result = calculateScore(answers);
            expect(result.profile).toBe('Agresivo');
            expect(result.score).toBeGreaterThanOrEqual(75);
        });
    });
});
