import { describe, it, expect } from 'vitest';
import {
    calculateTotalVolume,
    updateEspressoYieldFromRatio,
    updateEspressoRatioFromYield
} from './calculations';

describe('Calculations', () => {
    it('calculates total volume correctly', () => {
        const espresso = { dose: 18, yield: 36, time: 30, ratio: 2, temp: 93 };
        const components = [
            { id: '1', type: 'milk_steamed', volume: 150, name: 'Milk' },
            { id: '2', type: 'syrup', volume: 20, name: 'Vanilla' }
        ] as any;

        // 36 + 150 + 20 = 206
        expect(calculateTotalVolume(espresso, components)).toBe(206);
    });

    it('updates yield from ratio', () => {
        // 18g * 2.5 = 45g
        expect(updateEspressoYieldFromRatio(18, 2.5)).toBe(45);
    });

    it('updates ratio from yield', () => {
        // 36g / 18g = 2.0
        expect(updateEspressoRatioFromYield(18, 36)).toBe(2.0);
        // 40g / 20g = 2.0
        expect(updateEspressoRatioFromYield(20, 40)).toBe(2.0);
    });
});
