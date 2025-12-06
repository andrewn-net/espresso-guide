import { useState, useEffect } from "react";
import RadialOrbitalTimeline, { type TimelineItem } from "@/components/ui/radial-orbital-timeline";
import { Coffee, Droplets, Wind, Zap } from "lucide-react";
// import { useStore } from "@/store/useStore"; // Removed as we map static presets now

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
  },
  {
    id: 2,
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
    relatedIds: [1]
  },
  {
    id: 3,
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
    relatedIds: [1, 4]
  },
  {
    id: 4,
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
  },
  {
    id: 5,
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
    relatedIds: [1, 4]
  },
  {
    id: 7,
    title: "Short Macchiato",
    description: "Espresso 'stained' with a dash of warm milk and foam.",
    recipe: { dose: "18g", yield: "36g", milk: "Dash" },
    steps: [
      "Extract double shot (36g)",
      "Add a teaspoon of textured milk and foam",
      "Serve in a small glass"
    ],
    icon: Droplets,
    energy: 90,
    relatedIds: [1]
  },
  {
    id: 8,
    title: "Long Macchiato",
    description: "A bold long black 'stained' with a dash of milk and foam.",
    recipe: { dose: "18g", yield: "36g", water: "80ml", milk: "Dash" },
    steps: [
      "Fill cup with 80ml hot water",
      "Extract double shot over water",
      "Top with a dollop of foam"
    ],
    icon: Droplets,
    energy: 85,
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
  }
];

export default function App() {
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);

  useEffect(() => {
    // Map static DRINKS to TimelineItem format with Rich Content
    const nodes: TimelineItem[] = DRINKS.map(drink => ({
      id: drink.id,
      title: drink.title,
      date: "Recipe",
      // Rich Content Render
      content: (
        <div className="space-y-3">
          <p className="italic text-white/90">{drink.description}</p>
          <div className="bg-white/10 p-2 rounded text-[10px] font-mono grid grid-cols-2 gap-2">
            {Object.entries(drink.recipe).map(([k, v]) => (
              <div key={k}><span className="opacity-50 uppercase mr-1">{k}:</span>{v}</div>
            ))}
          </div>
          <ul className="list-disc list-inside space-y-1 text-white/80">
            {drink.steps.map((step, i) => <li key={i}>{step}</li>)}
          </ul>
        </div>
      ),
      category: "Menu",
      icon: drink.icon,


      energy: drink.energy
    }));

    setTimelineData(nodes);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      <RadialOrbitalTimeline timelineData={timelineData} />
    </div>
  );
}
