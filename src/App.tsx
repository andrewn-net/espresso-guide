import { useState, useEffect } from "react";
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
    id: "espresso",
    title: "Classic Espresso",
    description: "Rich, syrupy, and intense.",
    recipe: { dose: "18g", yield: "36g", time: "25-30s" },
    steps: [
      "Target 18g in, 36g out",
      "Aim for 25-30 seconds",
      "Look for hazelnut crema"
    ],
    icon: Coffee,
    energy: 25,
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "flatwhite",
    title: "Flat White",
    description: "Silky microfoam over double espresso.",
    recipe: { dose: "18g", yield: "36g", milk: "150ml" },
    steps: [
      "Steam milk to 60-65°C",
      "Gently pour over espresso",
      "Maintain a thin layer of foam"
    ],
    icon: Droplets,
    energy: 45,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "v60",
    title: "Manual Brew (V60)",
    description: "Clean, delicate, and tea-like.",
    recipe: { dose: "15g", yield: "250g", time: "3:00" },
    steps: [
      "15g coffee, 250g water",
      "Bloom for 30 seconds",
      "Total draw down ~3:00"
    ],
    icon: Wind,
    energy: 15,
    image: "https://images.unsplash.com/photo-1544787210-2211d7c9adac?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "coldbrew",
    title: "Cold Brew",
    description: "Smooth, low acid, refreshing.",
    recipe: { dose: "100g", yield: "800ml", time: "18-24h" },
    steps: [
      "Coarse grind 1:8 ratio",
      "Steep for 18-24 hours",
      "Filter twice for clarity"
    ],
    icon: Zap,
    energy: 35,
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "cortado",
    title: "Cortado",
    description: "Equal parts espresso and milk.",
    recipe: { dose: "18g", yield: "36g", milk: "40ml" },
    steps: [
      "Double shot of espresso",
      "Add 60ml steamed milk",
      "Pour for a 1:1 ratio"
    ],
    icon: Coffee,
    energy: 75,
    image: "https://images.unsplash.com/photo-1514066558159-fc8c737ef259?auto=format&fit=crop&w=600&q=80"
  }
];

export default function App() {
  const { theme, toggleTheme, setAuth, fetchProfiles } = useStore();

  const [mode, setMode] = useState<'recipe' | 'dialin' | 'analysis' | 'profiles'>('dialin');

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
      {mode === 'recipe' && <RecipeCarousel recipes={DRINKS} />}
      {mode === 'dialin' && <DialInMode />}
      {mode === 'analysis' && <AnalysisMode />}
      {mode === 'profiles' && <BrewProfilesMode />}


      {/* Floating Bottom Tab Navigation */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="bg-secondary/90 backdrop-blur-xl rounded-full border border-border/50 shadow-[0_12px_28px_-18px_hsl(var(--foreground)/0.2)] p-1.5 flex gap-1">
          <button
            onClick={() => setMode('dialin')}
            className={`flex items-center gap-2 px-4 py-3 rounded-full font-semibold transition-all ${mode === 'dialin'
              ? 'bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_hsl(var(--foreground)/0.22)]'
              : 'text-foreground hover:bg-secondary/50'
              }`}
          >
            <Settings2 size={20} />
            {mode === 'dialin' && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Dial-In</span>}
          </button>

          <button
            onClick={() => setMode('analysis')}
            className={`flex items-center gap-2 px-4 py-3 rounded-full font-semibold transition-all ${mode === 'analysis'
              ? 'bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_hsl(var(--foreground)/0.22)]'
              : 'text-foreground hover:bg-secondary/50'
              }`}
          >
            <Camera size={20} />
            {mode === 'analysis' && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Analysis</span>}
          </button>

          <button
            onClick={() => setMode('profiles')}
            className={`flex items-center gap-2 px-4 py-3 rounded-full font-semibold transition-all ${mode === 'profiles'
              ? 'bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_hsl(var(--foreground)/0.22)]'
              : 'text-foreground hover:bg-secondary/50'
              }`}
          >
            <BookOpen size={20} />
            {mode === 'profiles' && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Profiles</span>}
          </button>

          <button
            onClick={() => setMode('recipe')}
            className={`flex items-center gap-2 px-4 py-3 rounded-full font-semibold transition-all ${mode === 'recipe'
              ? 'bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_hsl(var(--foreground)/0.22)]'
              : 'text-foreground hover:bg-secondary/50'
              }`}
          >
            <Coffee size={20} />
            {mode === 'recipe' && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Recipes</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
