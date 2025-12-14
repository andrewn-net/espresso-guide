export type DrinkBase = 'espresso' | 'lungo';

export type ComponentType =
    | 'milk_steamed'
    | 'milk_foamed'
    | 'water'
    | 'ice'
    | 'syrup'
    | 'topping';

export interface DrinkComponent {
    id: string;
    type: ComponentType;
    volume: number; // in ml
    // Specific characteristics which might apply to some
    texture?: 'liquid' | 'microfoam' | 'thick_foam';
    temperature?: number; // in Celsius
    name: string; // User helper name, e.g. "Vanilla Syrup"
}

export interface EspressoParams {
    dose: number; // in grams
    yield: number; // in grams (or ml approx)
    time: number; // in seconds
    ratio: number; // 1:x
    temp: number; // in Celsius
}

export interface SteamingGuide {
    targetTemp: number;
    stretchTime: number; // seconds
    textureDescription: string;
}

export interface Recipe {
    id: string;
    name: string;
    description?: string;
    baseDrink: DrinkBase;
    espressoParams: EspressoParams;
    components: DrinkComponent[];
    totalVolume: number; // calculated
}

export interface DrinkTemplate {
    name: string;
    base: DrinkBase;
    defaultComponents: Omit<DrinkComponent, 'id'>[];
}

// Dial-In Mode Types
export interface DialInInput {
    dose: number;      // grams
    yield: number;     // grams  
    time: number;      // seconds
    grindSetting: number; // 1-10 scale (1=coarse, 10=fine)
}

export interface DialInRecommendation {
    diagnosis: 'perfect' | 'under-extracted' | 'over-extracted' | 'ratio-off';
    severityLevel: 'good' | 'minor' | 'major';
    grindAdjustment: {
        direction: 'finer' | 'coarser' | 'no-change';
        amount: number; // 1-3 (clicks/notches)
        message: string;
    };
    doseAdjustment?: {
        direction: 'increase' | 'decrease';
        amount: number; // grams
        message: string;
    };
    explanation: string;
    tasteProfile: string;
}
