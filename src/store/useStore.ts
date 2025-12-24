import { create } from 'zustand';
import type { Recipe, DrinkBase, DrinkComponent, ComponentType } from '../types';
import {
    getDefaultEspressoParams,
    generateId,
    calculateTotalVolume,
    updateEspressoYieldFromRatio
} from '../utils/calculations';

interface StoreState {
    currentRecipe: Recipe;
    isPrecisionMode: boolean;

    // Actions
    setBaseDrink: (base: DrinkBase) => void;
    updateEspressoParams: (params: Partial<Recipe['espressoParams']>) => void;
    addComponent: (type: ComponentType) => void;
    updateComponent: (id: string, updates: Partial<DrinkComponent>) => void;
    removeComponent: (id: string) => void;

    togglePrecisionMode: () => void;

    // Preset Management
    loadPreset: (presetName: string) => void;
    resetToEspresso: () => void;

    // Theme
    theme: 'dark' | 'light';
    toggleTheme: () => void;


}

const PRESETS: Record<string, Recipe> = {
    'Espresso': {
        id: 'p-espresso',
        name: 'Espresso',
        baseDrink: 'espresso',
        espressoParams: { dose: 18, yield: 36, time: 30, ratio: 2, temp: 93 },
        components: [],
        totalVolume: 36
    },
    'Lungo': {
        id: 'p-lungo',
        name: 'Lungo',
        baseDrink: 'lungo',
        espressoParams: { dose: 18, yield: 54, time: 35, ratio: 3, temp: 92 },
        components: [],
        totalVolume: 54
    },
    'Macchiato': {
        id: 'p-macchiato',
        name: 'Short Mac',
        baseDrink: 'espresso',
        espressoParams: { dose: 18, yield: 36, time: 30, ratio: 2, temp: 93 },
        components: [
            { id: 'm-foam', type: 'milk_foamed', volume: 10, name: 'Milk Spot', temperature: 60 }
        ],
        totalVolume: 46
    },
    'Cortado': {
        id: 'p-cortado',
        name: 'Cortado',
        baseDrink: 'espresso',
        espressoParams: { dose: 18, yield: 36, time: 30, ratio: 2, temp: 93 },
        components: [
            { id: 'c-milk', type: 'milk_steamed', volume: 36, name: 'Steamed Milk', temperature: 60 }
        ],
        totalVolume: 72
    },
    'Cappuccino': {
        id: 'p-cappuccino',
        name: 'Cappuccino',
        baseDrink: 'espresso',
        espressoParams: { dose: 18, yield: 36, time: 30, ratio: 2, temp: 93 },
        components: [
            { id: 'cap-steam', type: 'milk_steamed', volume: 60, name: 'Steamed Milk', temperature: 60 },
            { id: 'cap-foam', type: 'milk_foamed', volume: 60, name: 'Milk Foam', temperature: 60 }
        ],
        totalVolume: 156
    },
    'Flat White': {
        id: 'p-flatwhite',
        name: 'Flat White',
        baseDrink: 'espresso',
        espressoParams: { dose: 20, yield: 40, time: 30, ratio: 2, temp: 93 },
        components: [
            { id: 'fw-milk', type: 'milk_steamed', volume: 110, name: 'Microfoam', temperature: 60 }
        ],
        totalVolume: 150
    },
    'Latte': {
        id: 'p-latte',
        name: 'Latte',
        baseDrink: 'espresso',
        espressoParams: { dose: 18, yield: 36, time: 30, ratio: 2, temp: 93 },
        components: [
            { id: 'l-milk', type: 'milk_steamed', volume: 180, name: 'Steamed Milk', temperature: 60 },
            { id: 'l-foam', type: 'milk_foamed', volume: 10, name: 'Top Foam', temperature: 60 }
        ],
        totalVolume: 226
    },
    'Long Black': {
        id: 'p-longblack',
        name: 'Long Black',
        baseDrink: 'espresso',
        espressoParams: { dose: 18, yield: 36, time: 30, ratio: 2, temp: 93 },
        components: [
            { id: 'lb-water', type: 'water', volume: 120, name: 'Hot Water', temperature: 90 }
        ],
        totalVolume: 156
    }
};

const createInitialRecipe = (): Recipe => {
    return { ...PRESETS['Espresso'], id: generateId() };
};

// Helper for initial theme
const getInitialTheme = (): 'dark' | 'light' => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme-preference');
        if (saved === 'dark' || saved === 'light') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
};

export const useStore = create<StoreState>((set, get) => ({
    currentRecipe: createInitialRecipe(),
    isPrecisionMode: false,

    // Theme initialization
    theme: getInitialTheme(),

    setBaseDrink: (base) => {
        const { currentRecipe } = get();
        const newParams = getDefaultEspressoParams(base);
        set({
            currentRecipe: {
                ...currentRecipe,
                baseDrink: base,
                espressoParams: newParams,
                totalVolume: calculateTotalVolume(newParams, currentRecipe.components)
            }
        });
    },

    updateEspressoParams: (updates) => {
        const { currentRecipe } = get();
        let newParams = { ...currentRecipe.espressoParams, ...updates };

        if (updates.ratio !== undefined && updates.yield === undefined) {
            newParams.yield = updateEspressoYieldFromRatio(newParams.dose, newParams.ratio);
        }

        set({
            currentRecipe: {
                ...currentRecipe,
                espressoParams: newParams,
                totalVolume: calculateTotalVolume(newParams, currentRecipe.components)
            }
        });
    },

    addComponent: (type) => {
        const { currentRecipe } = get();
        const newComponent: DrinkComponent = {
            id: generateId(),
            type,
            volume: type === 'syrup' ? 20 : 150,
            name: type,
            temperature: 60,
        };

        const newComponents = [...currentRecipe.components, newComponent];

        set({
            currentRecipe: {
                ...currentRecipe,
                components: newComponents,
                totalVolume: calculateTotalVolume(currentRecipe.espressoParams, newComponents)
            }
        });
    },

    updateComponent: (id, updates) => {
        const { currentRecipe } = get();
        const newComponents = currentRecipe.components.map(c =>
            c.id === id ? { ...c, ...updates } : c
        );

        set({
            currentRecipe: {
                ...currentRecipe,
                components: newComponents,
                totalVolume: calculateTotalVolume(currentRecipe.espressoParams, newComponents)
            }
        });
    },

    removeComponent: (id) => {
        const { currentRecipe } = get();
        const newComponents = currentRecipe.components.filter(c => c.id !== id);
        set({
            currentRecipe: {
                ...currentRecipe,
                components: newComponents,
                totalVolume: calculateTotalVolume(currentRecipe.espressoParams, newComponents)
            }
        });
    },

    togglePrecisionMode: () => set(state => ({ isPrecisionMode: !state.isPrecisionMode })),

    loadPreset: (name) => {
        const preset = PRESETS[name];
        if (preset) {
            set({ currentRecipe: { ...preset, id: generateId() } });
        }
    },

    resetToEspresso: () => {
        set({ currentRecipe: { ...PRESETS['Espresso'], id: generateId() } });
    },

    toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'dark' ? 'light' : 'dark';

        // Update DOM
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(newTheme);

        // Persist
        localStorage.setItem('theme-preference', newTheme);

        set({ theme: newTheme });
    }
}));
