"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Leaf, ListChecks, LoaderCircle, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getSwiggyUrl, getBlinkitUrl, getAmazonFreshUrl, getAmazonNowUrl } from "@/lib/utils";
import { SwiggyLogo, BlinkitLogo, AmazonFreshLogo, AmazonNowLogo } from "@/components/store-logos";


export default function Home() {
  const [recipeText, setRecipeText] = useState("");
  const [ingredients, setIngredients] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function convert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true); setError(""); setIngredients(null);
    try {
      const response = await fetch("/api/convert", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipeText }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not extract ingredients. Please try again.");
      if (!Array.isArray(data.ingredients) || !data.ingredients.every((item: unknown) => typeof item === "string")) throw new Error("Could not read the ingredient list. Please try again.");
      setIngredients(data.ingredients);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-green-900/10 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-2.5 text-2xl font-bold tracking-tight"><ShoppingBasket className="text-primary" aria-hidden="true" />Cartify<span className="text-primary">.</span></a>
          <span className="hidden text-sm text-slate-500 sm:block">Less searching. More cooking.</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-12 sm:pt-16">
        <div className="mb-9 text-center">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e2efe7]"><Leaf className="h-6 w-6 text-primary" aria-hidden="true" /></div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Your recipe. Your shopping list.</h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-500">Paste a recipe, pick a store, and find what you need.<br className="hidden sm:block" /> We’ll take care of the ingredient list.</p>
        </div>

        <form onSubmit={convert} className="rounded-2xl border border-green-900/10 bg-white p-5 shadow-[0_6px_30px_rgba(24,60,49,0.04)] sm:p-7">
          <label htmlFor="recipe" className="mb-3 block text-base font-semibold">What are you cooking?</label>
          <Textarea id="recipe" placeholder="Paste your recipe ingredients or recipe website link here..." value={recipeText} onChange={event => setRecipeText(event.target.value)} maxLength={20000} required disabled={loading} className="min-h-56 resize-y bg-[#fbfcfb] leading-7" aria-describedby="recipe-hint" />
          <p id="recipe-hint" className="mb-6 mt-3 text-sm text-slate-500">Paste ingredients, a full recipe, or any recipe webpage link.</p>
          <Button type="submit" size="lg" className="w-full" disabled={loading || !recipeText.trim()} aria-busy={loading}>
            {loading ? (
              <LoaderCircle className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
            )}
            <span>{loading ? "Converting to Shopping Links..." : "Convert to Shopping Links"}</span>
          </Button>
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        </form>

        <section className="mt-9" aria-labelledby="results-heading" aria-live="polite" aria-busy={loading}>
          <div className="mb-4 flex items-center justify-between"><h2 id="results-heading" className="text-lg font-semibold">Your shopping list</h2>{ingredients !== null && <span className="text-sm text-slate-500">{ingredients.length} {ingredients.length === 1 ? "ingredient" : "ingredients"}</span>}</div>
          {ingredients === null ? (
            <div className="rounded-xl border border-dashed border-green-900/20 p-8 text-center">
              <ListChecks className="mx-auto mb-3 h-7 w-7 text-primary/60" aria-hidden="true" />
              <p className="text-sm text-slate-500">
                {loading ? "Turning your recipe into a grocery list…" : "Your ingredients and store links will appear here."}
              </p>
            </div>
          ) : ingredients.length === 0 ? (
            <p className="rounded-xl border bg-white p-6 text-sm text-slate-500">
              No grocery ingredients found. Try pasting a recipe with an ingredient list.
            </p>
          ) : (
            <ul className="divide-y divide-green-900/10 overflow-hidden rounded-xl border border-green-900/10 bg-white">
              {ingredients.map((ingredient, index) => (
                <li key={`${ingredient}-${index}`} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex min-w-0 items-center gap-3 font-medium">
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="break-words">{ingredient}</span>
                  </span>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button asChild variant="outline" className="h-9 px-2.5 border-orange-200/80 bg-white hover:bg-orange-50/80 hover:border-orange-300 transition-all shadow-xs" title="Swiggy Instamart">
                      <a href={getSwiggyUrl(ingredient)} target="_blank" rel="noopener noreferrer" aria-label={`Find ${ingredient} on Swiggy Instamart (opens in new tab)`}>
                        <SwiggyLogo className="h-4 w-auto" />
                        <ArrowUpRight className="h-3.5 w-3.5 text-orange-400" aria-hidden="true" />
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="h-9 px-2.5 border-amber-200/80 bg-white hover:bg-amber-50/80 hover:border-amber-300 transition-all shadow-xs" title="Blinkit">
                      <a href={getBlinkitUrl(ingredient)} target="_blank" rel="noopener noreferrer" aria-label={`Find ${ingredient} on Blinkit (opens in new tab)`}>
                        <BlinkitLogo className="h-4 w-auto" />
                        <ArrowUpRight className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="h-9 px-2.5 border-emerald-200/80 bg-white hover:bg-emerald-50/80 hover:border-emerald-300 transition-all shadow-xs" title="Amazon Fresh">
                      <a href={getAmazonFreshUrl(ingredient)} target="_blank" rel="noopener noreferrer" aria-label={`Find ${ingredient} on Amazon Fresh (opens in new tab)`}>
                        <AmazonFreshLogo className="h-4 w-auto" />
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="h-9 px-2.5 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs" title="Amazon Now">
                      <a href={getAmazonNowUrl(ingredient)} target="_blank" rel="noopener noreferrer" aria-label={`Find ${ingredient} on Amazon Now (opens in new tab)`}>
                        <AmazonNowLogo className="h-4 w-auto" />
                        <ArrowUpRight className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
                      </a>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="mt-7 text-center text-xs leading-5 text-slate-500">Links open store search results in a new tab.<br />Availability and delivery depend on your location.</p>
      </main>
    </div>
  );
}
