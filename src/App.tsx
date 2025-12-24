import { useState, useEffect } from "react";
import RecipeCarousel from "@/components/RecipeCarousel";
import DialInMode from "@/components/DialInMode";
import AnalysisMode from "@/components/AnalysisMode";
import { Coffee, Droplets, Wind, Zap, Sun, Moon, Settings2, Camera } from "lucide-react";
import { useStore } from "@/store/useStore";

// Extended Drink Definitions for the Radial Menu
const DRINKS = [
  {
    id: 1,
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
    id: 2,
    title: "Long Black",
    description: "A delicate balance of water and espresso. Australian standard.",
    recipe: { dose: "18g", yield: "36g", water: "120ml" },
    steps: [
      "Fill cup with 120ml hot water (90°C)",
      "Extract double shot (36g) directly over water",
      "Watch the crema form on top",
      "Serve immediately to preserve crema and aroma"
    ],
    icon: Droplets,
    energy: 80,
    status: "in-progress",
    relatedIds: [1],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtKHawubzIfHTxITkicpfnryijcFD07TK-8Q&s"
  },
  {
    id: 3,
    title: "Flat White",
    description: "Silky, smooth microfoam integrated with espresso.",
    recipe: { dose: "18g", yield: "36g", milk: "150ml" },
    steps: [
      "Extract double shot (36g) into a 180ml cup",
      "Steam milk to 60-65°C with microfoam (latex paint texture)",
      "Swirl milk to integrate foam",
      "Pour from height to break crema, then lower for latte art",
      "Aim for a thin layer of microfoam on top"
    ],
    icon: Wind,
    energy: 60,
    status: "pending",
    relatedIds: [1, 4],
    image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    title: "Latte",
    description: "Creamy and comforting with more milk.",
    recipe: { dose: "18g", yield: "36g", milk: "220ml" },
    steps: [
      "Extract double shot (36g) into a large cup",
      "Steam milk to 60-65°C with slightly more foam than flat white",
      "Swirl pitcher to integrate foam",
      "Pour gently from height for a creamy finish",
      "Create latte art if desired"
    ],
    icon: Coffee,
    energy: 40,
    status: "pending",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    title: "Cappuccino",
    description: "Rich textures with equal parts foam, milk, and espresso.",
    recipe: { dose: "18g", yield: "36g", milk: "150ml" },
    steps: [
      "Extract double shot (36g) into a 180ml cup",
      "Steam milk to 60-65°C with thick, dense foam",
      "Tap pitcher to remove large bubbles",
      "Pour to create a distinct 1cm foam cap",
      "Optionally dust with cocoa powder"
    ],
    icon: Wind,
    energy: 50,
    status: "pending",
    image: "https://www.cuisinart.ca/dw/image/v2/ABAF_PRD/on/demandware.static/-/Sites-ca-cuisinart-sfra-Library/default/dwc7862ee0/images/recipe-Images/cappuccino1-recipe.jpg?sw=1200&sh=1200&sm=fit"
  },
  {
    id: 6,
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
    id: 7,
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
    id: 8,
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
    id: 9,
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
  const { theme, toggleTheme } = useStore();

  const [mode, setMode] = useState<'recipe' | 'dialin' | 'analysis'>('dialin');

  // Apply theme class to document root
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);



  return (
    <div className="relative w-full h-[100dvh] bg-background transition-colors duration-500">
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


      {/* Floating Bottom Tab Navigation */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="bg-secondary/90 backdrop-blur-xl rounded-full border border-border/50 shadow-2xl p-1.5 flex gap-1">
          <button
            onClick={() => setMode('dialin')}
            className={`flex items-center gap-2 px-4 py-3 rounded-full font-semibold transition-all ${mode === 'dialin'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'text-foreground hover:bg-secondary/50'
              }`}
          >
            <Settings2 size={20} />
            {mode === 'dialin' && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Dial-In</span>}
          </button>

          <button
            onClick={() => setMode('analysis')}
            className={`flex items-center gap-2 px-4 py-3 rounded-full font-semibold transition-all ${mode === 'analysis'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'text-foreground hover:bg-secondary/50'
              }`}
          >
            <Camera size={20} />
            {mode === 'analysis' && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Analysis</span>}
          </button>

          <button
            onClick={() => setMode('recipe')}
            className={`flex items-center gap-2 px-4 py-3 rounded-full font-semibold transition-all ${mode === 'recipe'
              ? 'bg-primary text-primary-foreground shadow-lg'
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

