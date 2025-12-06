import type { EspressoParams, DrinkComponent, DrinkBase } from '../types';

export const calculateTotalVolume = (
    espressoParams: EspressoParams,
    components: DrinkComponent[]
): number => {
    const componentVolume = components.reduce((acc, c) => acc + c.volume, 0);
    return Number((espressoParams.yield + componentVolume).toFixed(1));
};

export const updateEspressoYieldFromRatio = (
    dose: number,
    ratio: number
): number => {
    return Number((dose * ratio).toFixed(1));
};

export const updateEspressoRatioFromYield = (
    dose: number,
    yieldAmount: number
): number => {
    if (dose === 0) return 0;
    return Number((yieldAmount / dose).toFixed(2));
};

// Default params for bases
export const getDefaultEspressoParams = (base: DrinkBase): EspressoParams => {
    switch (base) {
        case 'espresso':
            return { dose: 18, yield: 36, time: 30, ratio: 2.0, temp: 93 };
        case 'lungo':
            return { dose: 18, yield: 54, time: 35, ratio: 3.0, temp: 92 };
        default:
            return { dose: 18, yield: 36, time: 30, ratio: 2.0, temp: 93 };
    }
};

export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 9);
};
