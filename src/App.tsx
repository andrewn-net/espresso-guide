import { useEffect } from "react";
import RecipeCarousel from "@/components/RecipeCarousel";
import DialInMode from "@/components/DialInMode";
import AnalysisMode from "@/components/AnalysisMode";
import BrewProfilesMode from "@/components/BrewProfilesMode";
import { Coffee, Droplets, Wind, Zap, Sun, Moon, Settings2, Camera, BookOpen } from "lucide-react";
import { useStore } from "@/store/useStore";
import { supabase } from "@/lib/supabase";

// Extended Drink Definitions for the Radial Menu
const DRINKS = [
  {
    id: "1",
    title: "Espresso",
    description: "The foundation of all coffee drinks. Intense and pure.",
    recipe: { dose: "18g", yield: "36g", time: "25-30s" },
    steps: [
      "Grind 18g fine coffee",
      "Tamp with 30lbs pressure",
      "Extract 36g liquid"
    ],
    icon: Zap,
    energy: 100,
    status: "completed",
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "2",
    title: "Long Black",
    description: "A delicate balance of water and espresso. Australian standard.",
    recipe: { dose: "18g", yield: "36g", water: "120ml" },
    steps: [
      "Fill cup with 120ml hot water (90°C)",
      "Extract double shot (36g) directly over water",
      "Serve immediately to preserve crema"
    ],
    icon: Droplets,
    energy: 80,
    status: "in-progress",
    relatedIds: [1],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtKHawubzIfHTxITkicpfnryijcFD07TK-8Q&s"
  },
  {
    id: "3",
    title: "Flat White",
    description: "Silky, smooth microfoam integrated with espresso.",
    recipe: { dose: "18g", yield: "36g", milk: "150ml" },
    steps: [
      "Extract double shot (36g)",
      "Steam milk to microfoam (latex paint texture)",
      "Pour aggressive art pattern"
    ],
    icon: Wind,
    energy: 60,
    status: "pending",
    relatedIds: [1, 4],
    image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "4",
    title: "Latte",
    description: "Creamy and comforting with more milk.",
    recipe: { dose: "18g", yield: "36g", milk: "220ml" },
    steps: [
      "Extract double shot (36g)",
      "Steam milk with slightly more foam",
      "Pour gently for a creamy finish"
    ],
    icon: Coffee,
    energy: 40,
    status: "pending",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "5",
    title: "Cappuccino",
    description: "Rich textures with equal parts foam, milk, and espresso.",
    recipe: { dose: "18g", yield: "36g", milk: "150ml" },
    steps: [
      "Extract double shot (36g)",
      "Steam milk to thick, dense foam",
      "Pour to create a distinct foam cap"
    ],
    icon: Wind,
    energy: 50,
    status: "pending",
    image: "https://www.cuisinart.ca/dw/image/v2/ABAF_PRD/on/demandware.static/-/Sites-ca-cuisinart-sfra-Library/default/dwc7862ee0/images/recipe-Images/cappuccino1-recipe.jpg?sw=1200&sh=1200&sm=fit"
  },
  {
    id: "6",
    title: "Piccolo",
    description: "A ristretto shot topped with warm, silky milk served in a small glass.",
    recipe: { dose: "18g", yield: "20g (Ristretto)", milk: "70ml" },
    steps: [
      "Extract ristretto shot (20g)",
      "Steam milk with thin microfoam",
      "Pour gently to integrate"
    ],
    icon: Coffee,
    energy: 70,
    relatedIds: [1, 4],
    image: "https://whitehorsecoffee.com.au/cdn/shop/articles/9B605647-F527-4816-A532-8449B8DB39FF.jpg?v=1680243604"
  },
  {
    id: "7",
    title: "Short Mac",
    description: "Espresso 'stained' with a dash of warm milk and foam.",
    recipe: { dose: "18g", yield: "36g", milk: "Dash" },
    steps: [
      "Extract double shot (36g)",
      "Add a teaspoon of textured milk and foam",
      "Serve in a small glass"
    ],
    icon: Droplets,
    energy: 90,
    relatedIds: [1],
    fullTitle: "Short Macchiato",
    image: "https://www.breville.com/content/dam/breville-brands/coffeehub/language-masters/en_au/recipes/recipe-hero-stills/Recipes_Banner6_1200x1200_Macchiato.jpeg"
  },
  {
    id: "8",
    title: "Long Mac",
    description: "A bold long black 'stained' with a dash of milk and foam.",
    recipe: { dose: "18g", yield: "36g", water: "80ml", milk: "Dash" },
    steps: [
      "Fill cup with 80ml hot water",
      "Extract double shot over water",
      "Top with a dollop of foam"
    ],
    icon: Droplets,
    energy: 85,
    fullTitle: "Long Macchiato",
    image: "https://methodicalcoffee.com/cdn/shop/articles/macchiato.jpg?v=1693311327&width=1200"
  },
  {
    id: "9",
    title: "Cortado",
    description: "Equal parts espresso and steamed milk. Short and balanced.",
    recipe: { dose: "18g", yield: "36g", milk: "36g" },
    steps: [
      "Extract double shot (36g)",
      "Steam equal amount of milk (thin foam)",
      "Pour for a 1:1 ratio"
    ],
    icon: Coffee,
    energy: 75,
    image: "https://images.unsplash.com/photo-1514066558159-fc8c737ef259?auto=format&fit=crop&w=600&q=80"
  }
];

export default function App() {
  const { theme, toggleTheme, setTheme, hasManualTheme, setAuth, fetchProfiles, activeMode, setActiveMode } = useStore();

  // Listen for System Theme Changes
  useEffect(() => {
    if (hasManualTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [hasManualTheme, setTheme]);

  // Listen for Auth Changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session?.user ?? null, session);
      if (session?.user) fetchProfiles();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session?.user ?? null, session);
      if (session?.user) fetchProfiles();
    });

    return () => subscription.unsubscribe();
  }, [setAuth, fetchProfiles]);

  // Apply theme class to document root
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <div className="relative w-full min-h-[100dvh] bg-background transition-colors duration-500 font-sans">
      <div className="absolute top-4 left-4 z-50 pointer-events-none select-none">
        <span className="text-lg font-semibold tracking-tight text-foreground">Espresso Guide</span>
      </div>
      {/* Theme Toggle - Keep in top right */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-secondary/80 text-foreground backdrop-blur-sm hover:bg-secondary transition-all"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Main Content */}
      <main className="w-full h-full">
        {activeMode === 'recipe' && <RecipeCarousel recipes={DRINKS} />}
        {activeMode === 'dialin' && <DialInMode />}
        {activeMode === 'analysis' && <AnalysisMode />}
        {activeMode === 'profiles' && <BrewProfilesMode />}
      </main>

      {/* Floating Bottom Tab Navigation */}
      <nav className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="bg-secondary/90 backdrop-blur-xl rounded-full border border-border/50 shadow-[0_12px_28px_-18px_hsl(var(--foreground)/0.2)] p-1.5 flex gap-1">
          <button
            onClick={() => setActiveMode('dialin')}
            className={`flex items-center gap-2 px-4 py-3 rounded-full font-semibold transition-all ${activeMode === 'dialin'
              ? 'bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_hsl(var(--foreground)/0.22)]'
              : 'text-foreground hover:bg-secondary/50'
              }`}
          >
            <Settings2 size={20} />
            {activeMode === 'dialin' && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Dial-In</span>}
          </button>

          <button
            onClick={() => setActiveMode('analysis')}
            className={`flex items-center gap-2 px-4 py-3 rounded-full font-semibold transition-all ${activeMode === 'analysis'
              ? 'bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_hsl(var(--foreground)/0.22)]'
              : 'text-foreground hover:bg-secondary/50'
              }`}
          >
            <Camera size={20} />
            {activeMode === 'analysis' && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Analysis</span>}
          </button>

          <button
            onClick={() => setActiveMode('profiles')}
            className={`flex items-center gap-2 px-4 py-3 rounded-full font-semibold transition-all ${activeMode === 'profiles'
              ? 'bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_hsl(var(--foreground)/0.22)]'
              : 'text-foreground hover:bg-secondary/50'
              }`}
          >
            <BookOpen size={20} />
            {activeMode === 'profiles' && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Profiles</span>}
          </button>

          <button
            onClick={() => setActiveMode('recipe')}
            className={`flex items-center gap-2 px-4 py-3 rounded-full font-semibold transition-all ${activeMode === 'recipe'
              ? 'bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_hsl(var(--foreground)/0.22)]'
              : 'text-foreground hover:bg-secondary/50'
              }`}
          >
            <Coffee size={20} />
            {activeMode === 'recipe' && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Recipes</span>}
          </button>
        </div>
      </nav>
    </div>
  );
}
