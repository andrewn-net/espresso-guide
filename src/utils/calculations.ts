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

// Dial-In Analysis Functions
import type { DialInInput, DialInRecommendation } from '../types';

const TARGET_TIME_MIN = 25; // seconds
const TARGET_TIME_MAX = 30; // seconds
const TARGET_RATIO_MIN = 1.8;
const TARGET_RATIO_MAX = 2.2;
const IDEAL_RATIO = 2.0;

/**
 * Analyzes an espresso shot and provides adjustment recommendations
 */
export const analyzeEspressoShot = (input: DialInInput): DialInRecommendation => {
    const ratio = input.yield / input.dose;

    // Determine diagnosis based on extraction time and ratio
    let diagnosis: DialInRecommendation['diagnosis'];
    let severityLevel: DialInRecommendation['severityLevel'];
    let explanation: string;
    let tasteProfile: string;

    // Time-based diagnosis (primary indicator)
    if (input.time < TARGET_TIME_MIN) {
        diagnosis = 'under-extracted';
        severityLevel = input.time < 20 ? 'major' : 'minor';
        explanation = `Your shot pulled too quickly (${input.time}s). Water flowed through the coffee too fast, not extracting enough flavor compounds.`;
        tasteProfile = 'Expect sour, acidic notes with thin body and weak crema. Shot may taste watery or tea-like.';
    } else if (input.time > TARGET_TIME_MAX) {
        diagnosis = 'over-extracted';
        severityLevel = input.time > 35 ? 'major' : 'minor';
        explanation = `Your shot pulled too slowly (${input.time}s). Water spent too much time in contact with the coffee, extracting bitter compounds.`;
        tasteProfile = 'Expect bitter, astringent, or burnt notes with dry finish. Shot may taste harsh or chalky.';
    } else if (ratio < TARGET_RATIO_MIN || ratio > TARGET_RATIO_MAX) {
        diagnosis = 'ratio-off';
        severityLevel = Math.abs(ratio - IDEAL_RATIO) > 0.5 ? 'minor' : 'good';
        explanation = `Time is good (${input.time}s), but your ratio (1:${ratio.toFixed(1)}) is ${ratio < TARGET_RATIO_MIN ? 'too low' : 'too high'}. This affects extraction balance.`;
        tasteProfile = ratio < TARGET_RATIO_MIN
            ? 'May taste too concentrated or intense, potentially bitter.'
            : 'May taste diluted or weak, lacking intensity.';
    } else {
        diagnosis = 'perfect';
        severityLevel = 'good';
        explanation = `Excellent! Time (${input.time}s) and ratio (1:${ratio.toFixed(1)}) are both in the ideal range.`;
        tasteProfile = 'Should taste balanced with good sweetness, body, and complexity. Fine-tune by taste from here.';
    }

    // Calculate grind adjustment
    const grindAdjustment = getGrindAdjustment(ratio, diagnosis, severityLevel);

    // Calculate dose adjustment (optional, for fine-tuning)
    const doseAdjustment = getDoseAdjustment(input.time, diagnosis);

    return {
        diagnosis,
        severityLevel,
        grindAdjustment,
        doseAdjustment,
        explanation,
        tasteProfile
    };
};

/**
 * Calculate grind adjustment recommendation
 */
const getGrindAdjustment = (
    ratio: number,
    diagnosis: DialInRecommendation['diagnosis'],
    severityLevel: DialInRecommendation['severityLevel']
): DialInRecommendation['grindAdjustment'] => {
    if (diagnosis === 'perfect') {
        return {
            direction: 'no-change',
            amount: 0,
            message: 'No grind adjustment needed. Dial in by taste if desired.'
        };
    }

    if (diagnosis === 'under-extracted') {
        // Too fast = grind finer
        const amount = severityLevel === 'major' ? 3 : severityLevel === 'minor' ? 2 : 1;
        return {
            direction: 'finer',
            amount,
            message: `Grind ${amount} ${amount === 1 ? 'notch' : 'notches'} finer to slow down extraction.`
        };
    }

    if (diagnosis === 'over-extracted') {
        // Too slow = grind coarser
        const amount = severityLevel === 'major' ? 3 : severityLevel === 'minor' ? 2 : 1;
        return {
            direction: 'coarser',
            amount,
            message: `Grind ${amount} ${amount === 1 ? 'notch' : 'notches'} coarser to speed up extraction.`
        };
    }

    // Ratio adjustment (time is good, but ratio is off)
    if (ratio < TARGET_RATIO_MIN) {
        return {
            direction: 'finer',
            amount: 1,
            message: 'Grind slightly finer to restrict flow and increase yield.'
        };
    } else {
        return {
            direction: 'coarser',
            amount: 1,
            message: 'Grind slightly coarser to increase flow and reduce yield.'
        };
    }
};

/**
 * Calculate optional dose adjustment
 */
const getDoseAdjustment = (
    time: number,
    diagnosis: DialInRecommendation['diagnosis']
): DialInRecommendation['doseAdjustment'] | undefined => {
    // Only suggest dose changes for minor adjustments
    if (diagnosis === 'under-extracted' && time < 23) {
        return {
            direction: 'increase',
            amount: 0.5,
            message: 'Consider increasing dose by 0.5g for additional resistance.'
        };
    }

    if (diagnosis === 'over-extracted' && time > 33) {
        return {
            direction: 'decrease',
            amount: 0.5,
            message: 'Consider decreasing dose by 0.5g to reduce resistance.'
        };
    }

    return undefined;
};

