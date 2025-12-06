import React from 'react';
import { useStore } from '../store/useStore';
import type { ComponentType, DrinkBase } from '../types';

const getComponentColor = (type: ComponentType | DrinkBase) => {
    switch (type) {
        // High Contrast Palette
        case 'espresso': return 'bg-[#2A1810]'; // Very Dark Brown (almost black)
        case 'lungo': return 'bg-[#4A3228]'; // Deep Brown
        case 'milk_steamed': return 'bg-[#F5F5F0]'; // Off-white
        case 'milk_foamed': return 'bg-[#FFFFFF] ring-1 ring-stone-200 inset'; // Pure white with inner definition
        case 'water': return 'bg-[#AEEEEE] opacity-80'; // Clear Cyan/Water color (simulated)
        case 'ice': return 'bg-cyan-100';
        case 'syrup': return 'bg-amber-400';
        case 'topping': return 'bg-stone-800';
        default: return 'bg-gray-200';
    }
};

export const DrinkGuide: React.FC = () => {
    const { currentRecipe } = useStore();

    // Visual calculations
    const totalVisHeight = 220;
    const scale = totalVisHeight / Math.max(currentRecipe.totalVolume, 150);
    const espressoHeight = currentRecipe.espressoParams.yield * scale;
    const reversedComponents = [...currentRecipe.components].reverse();

    // Special case for Long Black visuals (Water should be visually distinct or imply bottom)
    // The current stacking logic is standard (Base bottom, components stacked top). 
    // For Long Black, water (component) is naturally stacked ON TOP of espresso (base) in this render loop.
    // To fix visually: We can't easily swap without changing the whole logic, but we can make the colors distinct.

    return (
        <div className="flex flex-col gap-8 p-6 md:p-12 max-w-2xl mx-auto animate-fade-in pb-32">
            {/* Header Area */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-stone-900 tracking-tight mb-2">{currentRecipe.name}</h1>
                <p className="text-stone-500 font-medium">{currentRecipe.totalVolume}ml Total Volume</p>
            </div>

            {/* The Cup Visual - Centered & High Contrast */}
            <div className="flex justify-center my-4">
                <div className="relative w-48 h-60 md:w-56 md:h-72 border-b-0 rounded-b-[3rem] bg-white shadow-2xl overflow-hidden ring-4 ring-stone-900/10 flex flex-col-reverse transform transition-all duration-700">
                    <div className="absolute inset-0 z-50 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none mix-blend-overlay"></div>
                    <div className="absolute top-0 w-full h-full bg-stone-50/5 pointer-events-none border-x border-b border-white/40 rounded-b-[3rem]"></div>

                    {/* Visual Stack Logic breakdown:
                        Standard: Base (Espresso) is Bottom. Components added on top.
                        Container is flex-col-reverse.
                        First child = Bottom. Last child = Top.
                        
                        Standard Order:
                        1. Base Div (Bottom)
                        2. Component Divs (Top)

                        Long Black Order (Water First, Espresso Top):
                        1. Water Component (Bottom)
                        2. Base Div (Top)
                    */}

                    {currentRecipe.name === 'Long Black' ? (
                        <>
                            {/* Components (Water) First -> Bottom */}
                            {reversedComponents.map((comp) => (
                                <div
                                    key={comp.id}
                                    className={`w-full transition-all duration-700 ease-in-out ${getComponentColor(comp.type)}`}
                                    style={{ height: `${comp.volume * scale}px` }}
                                />
                            ))}
                            {/* Base (Espresso) Second -> Top */}
                            <div
                                className={`w-full transition-all duration-700 ease-in-out ${getComponentColor(currentRecipe.baseDrink)}`}
                                style={{ height: `${Math.min(espressoHeight, 300)}px` }}
                            />
                        </>
                    ) : (
                        <>
                            {/* Standard: Base First -> Bottom */}
                            <div
                                className={`w-full transition-all duration-700 ease-in-out ${getComponentColor(currentRecipe.baseDrink)}`}
                                style={{ height: `${Math.min(espressoHeight, 300)}px` }}
                            />
                            {/* Components Second -> Top */}
                            {reversedComponents.map((comp) => (
                                <div
                                    key={comp.id}
                                    className={`w-full transition-all duration-700 ease-in-out ${getComponentColor(comp.type)}`}
                                    style={{ height: `${comp.volume * scale}px` }}
                                />
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* Preparation Steps - Simplified & Specific */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-2">Preparation</h3>

                <ol className="relative border-l-2 border-stone-300 ml-3 space-y-8">
                    {/* Dynamic Steps based on Recipe Name */}
                    {currentRecipe.name === 'Long Black' ? (
                        <>
                            <li className="ml-6">
                                <span className="absolute w-4 h-4 bg-cyan-400 rounded-full -left-[9px] mt-1.5 ring-4 ring-stone-50" />
                                <h4 className="text-base font-bold text-stone-900">Prepare Water</h4>
                                <p className="text-stone-600 mt-1">Fill cup with ~120ml hot water (90°C).</p>
                            </li>
                            <li className="ml-6">
                                <span className="absolute w-4 h-4 bg-[#2A1810] rounded-full -left-[9px] mt-1.5 ring-4 ring-stone-50" />
                                <h4 className="text-base font-bold text-stone-900">Extract Espresso</h4>
                                <p className="text-stone-600 mt-1">Extract double shot (36g) directly over the hot water to preserve crema.</p>
                            </li>
                        </>
                    ) : (
                        // Standard Flow
                        <>
                            <li className="ml-6">
                                <span className="absolute w-4 h-4 bg-[#2A1810] rounded-full -left-[9px] mt-1.5 ring-4 ring-stone-50" />
                                <h4 className="text-base font-bold text-stone-900">Pull Espresso</h4>
                                <p className="text-stone-600 mt-1">
                                    Dose: {currentRecipe.espressoParams.dose}g | Yield: {currentRecipe.espressoParams.yield}g | Time: ~{currentRecipe.espressoParams.time}s
                                </p>
                            </li>

                            {currentRecipe.components.some(c => c.type.includes('milk')) && (
                                <li className="ml-6">
                                    <span className="absolute w-4 h-4 bg-stone-200 rounded-full -left-[9px] mt-1.5 ring-4 ring-stone-50" />
                                    <h4 className="text-base font-bold text-stone-900">Texture Milk</h4>
                                    <p className="text-stone-600 mt-1">
                                        {currentRecipe.components.some(c => c.type === 'milk_foamed')
                                            ? 'Stretch for creating dense microfoam. Target 60°C.'
                                            : 'Brief stretch for silky texture. Target 60°C.'}
                                    </p>
                                </li>
                            )}

                            <li className="ml-6">
                                <span className="absolute w-4 h-4 bg-stone-900 rounded-full -left-[9px] mt-1.5 ring-4 ring-stone-50" />
                                <h4 className="text-base font-bold text-stone-900">Pour</h4>
                                <p className="text-stone-600 mt-1">
                                    {currentRecipe.name === 'Macchiato' ? 'Top espresso with a spoon of foam.' :
                                        currentRecipe.name === 'Cappuccino' ? 'Pour milk into center, creating a thick foam cap.' :
                                            currentRecipe.name === 'Flat White' ? 'Pour thin microfoam over espresso, creating fine art.' :
                                                currentRecipe.name === 'Latte' ? 'Pour steamed milk, holding back foam until the end.' :
                                                    'Serve immediately.'}
                                </p>
                            </li>
                        </>
                    )}
                </ol>
            </div>
        </div>
    );
};
