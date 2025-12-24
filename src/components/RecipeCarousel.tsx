import { useState } from 'react';
// @ts-ignore
import { Splide, SplideSlide } from '@splidejs/react-splide';
// @ts-ignore
import '@splidejs/react-splide/css';
import { Zap, X } from 'lucide-react';

interface CarouselRecipe {
    id: string;
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
    recipes: CarouselRecipe[];
}

export default function RecipeCarousel({ recipes }: RecipeCarouselProps) {
    const [selectedRecipe, setSelectedRecipe] = useState<CarouselRecipe | null>(null);

    return (
        <div className="w-full min-h-[100dvh] bg-background text-foreground flex flex-col justify-center items-center relative overflow-hidden pt-16 pb-[140px] md:pt-24 md:pb-24">
            {/* Background Ambience */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at center, hsl(var(--background) / 0.12), hsl(var(--background) / 0.92) 55%, hsl(var(--background)))'
                }}
            />

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
                            <div className="group relative flex flex-col h-full bg-[hsl(var(--card)/0.85)] border border-[hsl(var(--border)/0.6)] rounded-3xl overflow-hidden backdrop-blur-sm transition-all duration-500 shadow-[0_18px_48px_-30px_hsl(var(--foreground)/0.35)]">
                                {/* Image Section */}
                                <div className="h-[200px] md:h-[240px] overflow-hidden relative flex-shrink-0">
                                    <div
                                        className="absolute inset-0 z-10 pointer-events-none"
                                        style={{
                                            background: 'linear-gradient(to top, hsl(var(--background) / 0.9), transparent 55%)'
                                        }}
                                    />
                                    <img
                                        src={recipe.image}
                                        alt={recipe.title}
                                        className="w-full h-full object-cover transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4 z-20 bg-[hsl(var(--background)/0.85)] backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-500 border border-[hsl(var(--border)/0.6)]">
                                        <Zap size={12} className="fill-current" />
                                        {recipe.energy}%
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex flex-1 flex-col overflow-hidden p-4 md:p-6">
                                    <div className="mb-3 md:mb-4 flex-shrink-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground group-hover:text-amber-500 transition-colors">
                                                {recipe.fullTitle || recipe.title}
                                            </h3>
                                            <recipe.icon size={20} className="text-muted-foreground group-hover:text-amber-500 transition-colors mt-1" />
                                        </div>
                                        <p className="text-muted-foreground text-sm font-medium leading-relaxed line-clamp-2">
                                            {recipe.description}
                                        </p>
                                    </div>

                                    {/* Recipe Stats Grid - Compact */}
                                    <div className="grid grid-cols-2 gap-2 mb-3 md:mb-4 flex-shrink-0">
                                        <div className="rounded-lg p-2.5 bg-[hsl(var(--secondary)/0.85)] border border-[hsl(var(--border)/0.4)]">
                                            <span className="block text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-0.5">Dose</span>
                                            <span className="text-foreground font-mono text-xs">{recipe.recipe.dose}</span>
                                        </div>
                                        <div className="rounded-lg p-2.5 bg-[hsl(var(--secondary)/0.85)] border border-[hsl(var(--border)/0.4)]">
                                            <span className="block text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-0.5">Yield</span>
                                            <span className="text-foreground font-mono text-xs">{recipe.recipe.yield}</span>
                                        </div>
                                        {(recipe.recipe.milk || recipe.recipe.water) && (
                                            <div className="col-span-2 rounded-lg p-2.5 bg-[hsl(var(--secondary)/0.85)] border border-[hsl(var(--border)/0.4)] flex items-center justify-between">
                                                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                                                    {recipe.recipe.milk ? 'Milk' : 'Water'}
                                                </span>
                                                <span className="text-foreground font-mono text-xs">
                                                    {recipe.recipe.milk || recipe.recipe.water}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Steps Section */}
                                    <div className="border-t border-[hsl(var(--border)/0.4)] pt-3 md:pt-4 pb-2 flex-1 overflow-y-auto custom-scrollbar">
                                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex-shrink-0">Preparation Steps</h4>
                                        <ul className="space-y-2.5 pr-1">
                                            {recipe.steps.map((step, index) => (
                                                <li key={index} className="flex gap-3 text-sm text-foreground/90">
                                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--accent)/0.85)] border border-[hsl(var(--border)/0.5)] flex items-center justify-center text-[10px] font-bold text-amber-500">
                                                        {index + 1}
                                                    </span>
                                                    <span className="leading-relaxed text-xs text-foreground/80">{step}</span>
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
                    <div className="absolute inset-0 bg-[hsl(var(--background)/0.9)] backdrop-blur-md" onClick={() => setSelectedRecipe(null)} />
                    <div className="relative w-full max-w-lg bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.6)] rounded-3xl overflow-hidden shadow-[0_22px_52px_-32px_hsl(var(--foreground)/0.35)] animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-[hsl(var(--border)/0.4)] flex justify-between items-center bg-[hsl(var(--card)/0.85)] backdrop-blur">
                            <div>
                                <h3 className="text-xl font-black text-foreground">{selectedRecipe.fullTitle || selectedRecipe.title}</h3>
                                <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Full Recipe Steps</p>
                            </div>
                            <button
                                onClick={() => setSelectedRecipe(null)}
                                className="p-2 rounded-full bg-[hsl(var(--secondary)/0.9)] text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar bg-[hsl(var(--card))]">
                            <ul className="space-y-6">
                                {selectedRecipe.steps.map((step, index) => (
                                    <li key={index} className="flex gap-4 group">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(var(--accent)/0.9)] border border-[hsl(var(--border)/0.5)] flex items-center justify-center text-sm font-bold text-amber-500 group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors duration-500">
                                            {index + 1}
                                        </span>
                                        <span className="text-foreground leading-relaxed pt-1">{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-6 bg-[hsl(var(--background)/0.92)] border-t border-[hsl(var(--border)/0.4)]">
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
          background: hsl(var(--card) / 0.85);
          backdrop-filter: blur(6px);
          border: 1px solid hsl(var(--border) / 0.5);
          width: 3rem;
          height: 3rem;
          transition: all 0.3s ease;
          color: hsl(var(--foreground));
        }

        .recipe-splide .splide__list {
          align-items: stretch;
        }

        .recipe-splide .splide__slide {
          display: flex;
          height: 100%;
        }

        .recipe-splide .splide__slide > div {
          width: 100%;
          height: 100%;
        }
        .splide__arrow svg {
          fill: currentColor;
        }
        .splide__arrow:hover {
          background: hsl(var(--primary));
          border-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
        .splide__arrow:hover svg {
          fill: currentColor;
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
          background: hsl(var(--background));
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary));
        }
      `}</style>
        </div>
    );
}
