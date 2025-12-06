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
