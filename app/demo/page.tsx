"use client";

import { useState, useEffect } from "react";
import { ShoppingBasket, ArrowUpRight, Check, Sparkles, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEMO_RECIPES = [
  {
    title: "Viral Chili Oil Noodles",
    input: "Viral Chili Oil Noodles: 2 packs ramen noodles, 3 cloves minced garlic, 1 tbsp chili flakes, 2 tbsp soy sauce, 1 tbsp black vinegar, 2 green onions, 2 tbsp hot sesame oil",
    ingredients: ["ramen noodles", "garlic", "chili flakes", "soy sauce", "black vinegar", "green onions", "sesame oil"],
  },
  {
    title: "Garlic Butter Steak Bites",
    input: "Garlic Butter Steak Bites: 500g beef sirloin cubed, 3 tbsp butter, 4 cloves minced garlic, 1 tsp salt, 1/2 tsp black pepper, fresh parsley",
    ingredients: ["beef sirloin", "butter", "garlic", "salt", "black pepper", "parsley"],
  },
];

export default function DemoPage() {
  const [selectedRecipe, setSelectedRecipe] = useState(0);
  const [step, setStep] = useState<"idle" | "typing" | "converting" | "results">("idle");
  const [displayText, setDisplayText] = useState("");
  const currentRecipe = DEMO_RECIPES[selectedRecipe];

  function startAnimation() {
    setStep("typing");
    setDisplayText("");
    const text = currentRecipe.input;
    let i = 0;
    const interval = setInterval(() => {
      i += 3;
      if (i <= text.length) {
        setDisplayText(text.slice(0, i));
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setStep("converting");
          setTimeout(() => {
            setStep("results");
          }, 1200);
        }, 600);
      }
    }, 30);
  }

  function reset() {
    setStep("idle");
    setDisplayText("");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-4 font-sans text-slate-100">
      {/* Recording frame in 9:16 mobile aspect ratio */}
      <div className="relative flex h-[844px] w-[390px] flex-col overflow-hidden rounded-[40px] border-4 border-slate-700 bg-[#f6f9f7] shadow-2xl text-slate-900">
        {/* Dynamic Island / Header */}
        <div className="flex h-12 items-center justify-between px-6 pt-2">
          <span className="text-xs font-semibold text-slate-500">9:41</span>
          <div className="h-5 w-24 rounded-full bg-slate-900"></div>
          <span className="text-xs font-semibold text-slate-500">5G</span>
        </div>

        {/* In-app header */}
        <div className="flex items-center justify-between border-b border-green-900/10 bg-white px-5 py-3">
          <div className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
            <ShoppingBasket className="h-5 w-5 text-primary" />
            Cartify<span className="text-primary">.</span>
          </div>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-primary">
            Instant Groceries
          </span>
        </div>

        {/* Content container */}
        <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
          <div className="mb-4 text-center">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Recipe to Grocery Cart
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Paste recipe &rarr; Get Swiggy & Blinkit search buttons
            </p>
          </div>

          {/* Form */}
          <div className="rounded-xl border border-green-900/10 bg-white p-4 shadow-sm">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              What are you cooking?
            </label>
            <div className="h-28 w-full rounded-lg border border-slate-200 bg-[#fbfcfb] p-3 text-xs leading-5 text-slate-800 overflow-hidden font-mono">
              {step === "idle" ? (
                <span className="text-slate-400">Paste ingredients or recipe link here...</span>
              ) : (
                displayText
              )}
            </div>

            <button
              type="button"
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold text-white transition-all ${
                step === "converting"
                  ? "bg-primary/80 animate-pulse"
                  : "bg-primary hover:bg-[#104d3a]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {step === "converting" ? "Extracting Ingredients..." : "Convert to Shopping Links"}
            </button>
          </div>

          {/* Results section */}
          <div className="mt-4 flex-1">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Shopping List</span>
              {step === "results" && (
                <span className="text-[10px] font-medium text-slate-500">
                  {currentRecipe.ingredients.length} items
                </span>
              )}
            </div>

            {step !== "results" ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-green-900/20 p-4 text-center text-xs text-slate-400">
                <ShoppingBasket className="mb-2 h-6 w-6 text-slate-300" />
                <span>Store links will appear here</span>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto pb-4 max-h-[380px]">
                {currentRecipe.ingredients.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-2 rounded-lg border border-green-900/10 bg-white p-2.5 shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <span className="text-xs font-semibold capitalize text-slate-800">{item}</span>
                    </div>
                    <div className="flex gap-1.5 pt-0.5">
                      <a
                        href={`https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(item)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-1 items-center justify-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-900 hover:bg-orange-100"
                      >
                        Swiggy
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                      <a
                        href={`https://blinkit.com/s/?q=${encodeURIComponent(item)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-1 items-center justify-center gap-1 rounded-md border border-yellow-200 bg-yellow-50 px-2 py-1 text-[11px] font-semibold text-green-900 hover:bg-yellow-100"
                      >
                        Blinkit
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controller Buttons below phone mock */}
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={startAnimation} disabled={step === "typing" || step === "converting"} className="gap-2 bg-emerald-600 hover:bg-emerald-500">
          <Play className="h-4 w-4" /> Start Reel Animation
        </Button>
        <Button onClick={reset} variant="outline" className="gap-2 text-slate-900">
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
        <select
          value={selectedRecipe}
          onChange={(e) => {
            setSelectedRecipe(Number(e.target.value));
            reset();
          }}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
        >
          {DEMO_RECIPES.map((r, i) => (
            <option key={i} value={i}>
              {r.title}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Open <code>/demo</code> & record your screen in 9:16 format for Reels, Shorts & TikTok!
      </p>
    </div>
  );
}
