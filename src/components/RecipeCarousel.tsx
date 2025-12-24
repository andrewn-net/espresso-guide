import { useState } from 'react';
// @ts-ignore
import { Splide, SplideSlide } from '@splidejs/react-splide';
// @ts-ignore
import '@splidejs/react-splide/css';
import { Zap, X } from 'lucide-react';

interface Recipe {
    id: number;
    title: string;
    fullTitle?: string;
    description: string;
    recipe: {
        dose: string;
        yield: string;
        time?: string;
        water?: string;
        milk?: string;
    };
    steps: string[];
    icon: any;
    energy: number;
    image: string;
}

interface RecipeCarouselProps {
    recipes: Recipe[];
}

export default function RecipeCarousel({ recipes }: RecipeCarouselProps) {
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    return (
        <div className="w-full h-screen bg-stone-950 flex flex-col justify-center items-center relative overflow-hidden pb-32 md:pb-24">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800/20 via-stone-950 to-stone-950 pointer-events-none" />

            <div className="w-full max-w-7xl mx-auto px-4 md:px-4 px-0 relative z-10">
                <Splide
                    options={{
                        type: 'loop',
                        perPage: 3,
                        focus: 'center',
                        gap: '2rem',
                        pagination: false,
                        arrows: true,
                        breakpoints: {
                            1024: {
                                perPage: 2,
                                gap: '1.5rem',
                            },
                            640: {
                                perPage: 1,
                                gap: '0.5rem',
                                padding: { left: '0.75rem', right: '0.75rem' },
                                arrows: true,
                            },
                        },
                    }}
                    className="recipe-splide"
                >
                    {recipes.map((recipe) => (
                        <SplideSlide key={recipe.id}>
                            <div className="group relative min-h-[500px] md:min-h-[600px] h-auto bg-stone-900/50 border border-stone-800 rounded-3xl overflow-hidden backdrop-blur-sm transition-all duration-500">
                                {/* Image Section */}
                                <div className="h-[200px] md:h-[240px] overflow-hidden relative flex-shrink-0">
                                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent z-10" />
                                    <img
                                        src={recipe.image}
                                        alt={recipe.title}
                                        className="w-full h-full object-cover transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4 z-20 bg-stone-950/80 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-500 border border-stone-800">
                                        <Zap size={12} className="fill-current" />
                                        {recipe.energy}%
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-4 md:p-6 flex flex-col">
                                    <div className="mb-3 md:mb-4 flex-shrink-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight group-hover:text-amber-500 transition-colors">
                                                {recipe.fullTitle || recipe.title}
                                            </h3>
                                            <recipe.icon size={20} className="text-stone-600 group-hover:text-amber-500 transition-colors mt-1" />
                                        </div>
                                        <p className="text-stone-400 text-sm font-medium leading-relaxed line-clamp-2">
                                            {recipe.description}
                                        </p>
                                    </div>

                                    {/* Recipe Stats Grid - Compact */}
                                    <div className="grid grid-cols-2 gap-2 mb-3 md:mb-4 flex-shrink-0">
                                        <div className="bg-stone-950/50 rounded-lg p-2.5 border border-stone-800/50">
                                            <span className="block text-stone-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Dose</span>
                                            <span className="text-stone-200 font-mono text-xs">{recipe.recipe.dose}</span>
                                        </div>
                                        <div className="bg-stone-950/50 rounded-lg p-2.5 border border-stone-800/50">
                                            <span className="block text-stone-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Yield</span>
                                            <span className="text-stone-200 font-mono text-xs">{recipe.recipe.yield}</span>
                                        </div>
                                        {(recipe.recipe.milk || recipe.recipe.water) && (
                                            <div className="col-span-2 bg-stone-950/50 rounded-lg p-2.5 border border-stone-800/50 flex items-center justify-between">
                                                <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider">
                                                    {recipe.recipe.milk ? 'Milk' : 'Water'}
                                                </span>
                                                <span className="text-stone-200 font-mono text-xs">
                                                    {recipe.recipe.milk || recipe.recipe.water}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Steps Section */}
                                    <div className="border-t border-stone-800/50 pt-3 md:pt-4 pb-6">
                                        <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-3">Preparation Steps</h4>
                                        <ul className="space-y-2.5">
                                            {recipe.steps.map((step, index) => (
                                                <li key={index} className="flex gap-3 text-sm text-stone-300">
                                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-[10px] font-bold text-amber-500">
                                                        {index + 1}
                                                    </span>
                                                    <span className="leading-relaxed text-xs">{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </SplideSlide>
                    ))}
                </Splide>
            </div>

            {/* Modal for all steps */}
            {selectedRecipe && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-md" onClick={() => setSelectedRecipe(null)} />
                    <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-900/50 backdrop-blur">
                            <div>
                                <h3 className="text-xl font-black text-white">{selectedRecipe.fullTitle || selectedRecipe.title}</h3>
                                <p className="text-stone-500 text-[10px] uppercase font-bold tracking-widest">Full Recipe Steps</p>
                            </div>
                            <button
                                onClick={() => setSelectedRecipe(null)}
                                className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar bg-stone-900">
                            <ul className="space-y-6">
                                {selectedRecipe.steps.map((step, index) => (
                                    <li key={index} className="flex gap-4 group">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-sm font-bold text-amber-500 group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors duration-500">
                                            {index + 1}
                                        </span>
                                        <span className="text-stone-200 leading-relaxed pt-1">{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-6 bg-stone-950/50 border-t border-stone-800">
                            <button
                                onClick={() => setSelectedRecipe(null)}
                                className="w-full py-4 rounded-2xl bg-amber-500 text-stone-950 font-black text-sm uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-xl shadow-amber-500/10"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Styles for Splide to match the dark theme */}
            <style>{`
        .splide__arrow {
          background: rgba(41, 37, 36, 0.8);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(68, 64, 60, 0.5);
          width: 3rem;
          height: 3rem;
          transition: all 0.3s ease;
        }
        .splide__arrow svg {
          fill: #e7e5e4;
        }
        .splide__arrow:hover {
          background: #f59e0b;
          border-color: #f59e0b;
        }
        .splide__arrow:hover svg {
          fill: #1c1917;
        }
        
        /* Mobile arrow positioning */
        @media (max-width: 640px) {
          .splide__arrow {
            width: 2.5rem;
            height: 2.5rem;
            opacity: 0.9;
          }
          .splide__arrow--prev {
            left: 0.25rem;
          }
          .splide__arrow--next {
            right: 0.25rem;
          }
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1c1917;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #44403c;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f59e0b;
        }
      `}</style>
        </div>
    );
}
