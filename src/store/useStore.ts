import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Recipe, DrinkBase, DrinkComponent, ComponentType, BrewProfile } from '../types';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import {
    getDefaultEspressoParams,
    generateId,
    calculateTotalVolume,
    updateEspressoYieldFromRatio
} from '../utils/calculations';

interface StoreState {
    currentRecipe: Recipe;
    isPrecisionMode: boolean;
    brewProfiles: BrewProfile[];
    activeMode: 'recipe' | 'dialin' | 'analysis' | 'profiles';

    // Actions
    setBaseDrink: (base: DrinkBase) => void;
    updateEspressoParams: (params: Partial<Recipe['espressoParams']>) => void;
    addComponent: (type: ComponentType) => void;
    updateComponent: (id: string, updates: Partial<DrinkComponent>) => void;
    removeComponent: (id: string) => void;

    togglePrecisionMode: () => void;

    // Brew Profiles
    addBrewProfile: (profile: Omit<BrewProfile, 'id' | 'lastUpdated'>) => void;
    updateBrewProfile: (id: string, updates: Partial<BrewProfile>) => void;
    removeBrewProfile: (id: string) => void;

    // Preset Management
    loadPreset: (presetName: string) => void;
    loadRecipe: (recipe: Recipe) => void;
    resetToEspresso: () => void;
    setActiveMode: (mode: 'recipe' | 'dialin' | 'analysis' | 'profiles') => void;

    // Theme
    theme: 'dark' | 'light';
    toggleTheme: () => void;

    // Auth
    user: User | null;
    session: Session | null;
    setAuth: (user: User | null, session: Session | null) => void;
    fetchProfiles: () => Promise<void>;
    signOut: () => Promise<void>;
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

const getInitialTheme = (): 'dark' | 'light' => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme-preference');
        if (saved === 'dark' || saved === 'light') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
};

export const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            currentRecipe: createInitialRecipe(),
            isPrecisionMode: false,
            brewProfiles: [],
            activeMode: 'dialin',

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

            addBrewProfile: async (profile) => {
                const { user } = get();
                const newProfile: BrewProfile = {
                    ...profile,
                    id: generateId(),
                    lastUpdated: new Date().toISOString(),
                };

                if (user) {
                    const { error } = await supabase.from('brew_profiles').insert({
                        id: newProfile.id,
                        user_id: user.id,
                        bean_name: newProfile.beanName,
                        roast_date: newProfile.roastDate || null, // FIX: Convert empty string to null
                        grind_setting: newProfile.grindSetting,
                        dose: Number(newProfile.dose),
                        expected_yield: Number(newProfile.expectedYield),
                        expected_time: Number(newProfile.expectedTime),
                        notes: newProfile.notes || null
                    });

                    if (error) {
                        console.error('SUPABASE INSERT ERROR:', error.message, error.details, error.hint);
                        alert(`Cloud save failed: ${error.message}`);
                        return; // Don't update local state if cloud save failed while logged in
                    }
                }

                set(state => ({ brewProfiles: [newProfile, ...state.brewProfiles] }));
            },

            updateBrewProfile: async (id, updates) => {
                const { user } = get();
                const lastUpdated = new Date().toISOString();

                if (user) {
                    const dbUpdates: any = { last_updated: lastUpdated };
                    if (updates.beanName) dbUpdates.bean_name = updates.beanName;
                    if (updates.roastDate !== undefined) dbUpdates.roast_date = updates.roastDate || null;
                    if (updates.grindSetting) dbUpdates.grind_setting = updates.grindSetting;
                    if (updates.dose !== undefined) dbUpdates.dose = Number(updates.dose);
                    if (updates.expectedYield !== undefined) dbUpdates.expected_yield = Number(updates.expectedYield);
                    if (updates.expectedTime !== undefined) dbUpdates.expected_time = Number(updates.expectedTime);
                    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;

                    const { error } = await supabase
                        .from('brew_profiles')
                        .update(dbUpdates)
                        .eq('id', id);
                    if (error) console.error('SUPABASE UPDATE ERROR:', error.message);
                }

                set(state => ({
                    brewProfiles: state.brewProfiles.map(p =>
                        p.id === id ? { ...p, ...updates, lastUpdated } : p
                    )
                }));
            },

            removeBrewProfile: async (id) => {
                const { user } = get();
                if (user) {
                    const { error } = await supabase
                        .from('brew_profiles')
                        .delete()
                        .eq('id', id);
                    if (error) console.error('Error deleting from cloud:', error);
                }
                set(state => ({ brewProfiles: state.brewProfiles.filter(p => p.id !== id) }));
            },

            loadPreset: (name) => {
                const preset = PRESETS[name];
                if (preset) {
                    set({ currentRecipe: { ...preset, id: generateId() } });
                }
            },

            loadRecipe: (recipe) => {
                set({ currentRecipe: { ...recipe, id: generateId() } });
            },

            resetToEspresso: () => {
                set({ currentRecipe: { ...PRESETS['Espresso'], id: generateId() } });
            },

            toggleTheme: () => {
                const { theme } = get();
                const newTheme = theme === 'dark' ? 'light' : 'dark';
                const root = window.document.documentElement;
                root.classList.remove('light', 'dark');
                root.classList.add(newTheme);
                localStorage.setItem('theme-preference', newTheme);
                set({ theme: newTheme });
            },

            user: null,
            session: null,
            setAuth: (user, session) => set({ user, session }),

            fetchProfiles: async () => {
                const { user } = get();
                if (!user) return;

                const { data, error } = await supabase
                    .from('brew_profiles')
                    .select('*')
                    .order('last_updated', { ascending: false });

                if (error) {
                    console.error('Error fetching profiles:', error);
                    return;
                }

                if (data) {
                    const profiles: BrewProfile[] = data.map(row => ({
                        id: row.id,
                        beanName: row.bean_name,
                        roastDate: row.roast_date,
                        grindSetting: row.grind_setting,
                        dose: parseFloat(row.dose),
                        expectedYield: parseFloat(row.expected_yield),
                        expectedTime: row.expected_time,
                        notes: row.notes,
                        lastUpdated: row.last_updated
                    }));
                    set({ brewProfiles: profiles });
                }
            },

            signOut: async () => {
                await supabase.auth.signOut();
                set({ user: null, session: null, brewProfiles: [] });
            },

            setActiveMode: (mode) => set({ activeMode: mode })
        }),
        {
            name: 'coffee-app-storage',
            partialize: (state) => ({
                theme: state.theme,
                brewProfiles: state.brewProfiles,
                isPrecisionMode: state.isPrecisionMode,
                activeMode: state.activeMode,
            }),
        }
    )
);
