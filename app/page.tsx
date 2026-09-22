"use client";

import { useState, useEffect, type FormEvent } from "react";
import { ArrowUpRight, Check, Leaf, ListChecks, LoaderCircle, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AdUnit } from "@/components/ad-unit";
import { RegionSelector } from "@/components/region-selector";
import { getRegionConfig, isValidRegion, DEFAULT_REGION, type RegionCode, type StoreConfig } from "@/lib/regions";

/* ------------------------------------------------------------------ */
/*  Store logo imports — India                                         */
/* ------------------------------------------------------------------ */
import { SwiggyLogo, BlinkitLogo, AmazonFreshLogo, AmazonNowLogo } from "@/components/store-logos";

/* ------------------------------------------------------------------ */
/*  Store logo imports — US & UK                                       */
/* ------------------------------------------------------------------ */
import {
  InstacartLogo,
  WalmartLogo,
  TargetLogo,
  TescoLogo,
  SainsburysLogo,
  OcadoLogo,
  AmazonFreshUSLogo,
  AmazonFreshUKLogo,
} from "@/components/global-store-logos";

/**
 * Maps a store's logoComponent string to its actual React component.
 * This lets us dynamically render the right logo based on region config.
 */
const LOGO_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  SwiggyLogo,
  BlinkitLogo,
  AmazonFreshLogo,
  AmazonNowLogo,
  InstacartLogo,
  WalmartLogo,
  TargetLogo,
  TescoLogo,
  SainsburysLogo,
  OcadoLogo,
  AmazonFreshUSLogo,
  AmazonFreshUKLogo,
};

/** Read a cookie by name (client-side) */
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}


export default function Home() {
  const [recipeText, setRecipeText] = useState("");
  const [ingredients, setIngredients] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---- Region detection (reads cookie set by middleware) ---- */
  const [region, setRegion] = useState<RegionCode>(DEFAULT_REGION);

  useEffect(() => {
    const cookieRegion = getCookie("cartify-region");
    if (isValidRegion(cookieRegion)) {
      setRegion(cookieRegion);
    }
  }, []);

  const regionConfig = getRegionConfig(region);

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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-2.5 text-2xl font-bold tracking-tight"><ShoppingBasket className="text-primary" aria-hidden="true" />Cartify<span className="text-primary">.</span></a>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 sm:block">Less searching. More cooking.</span>
            <RegionSelector currentRegion={region} onRegionChange={setRegion} />
          </div>
        </div>
      </header>

      {/* 3-column layout: left ad | main content | right ad */}
      <div className="mx-auto flex max-w-7xl gap-6 px-4">

        {/* Left sidebar ad — hidden on screens smaller than lg */}
        <aside className="hidden lg:block w-[160px] shrink-0 pt-12" aria-label="Advertisement">
          <AdUnit slot="sidebar" />
        </aside>

        <main className="mx-auto w-full max-w-3xl px-1 pb-16 pt-12 sm:pt-16">
          <div className="mb-9 text-center">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e2efe7]"><Leaf className="h-6 w-6 text-primary" aria-hidden="true" /></div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Your recipe. Your shopping list.</h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-500">Paste a recipe, pick a store, and find what you need.<br className="hidden sm:block" /> We'll take care of the ingredient list.</p>
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
              <>
                {/* Affiliate disclosure. Required by the Amazon Associates
                    Operating Agreement, by the FTC in the US, the ASA in the UK
                    and ASCI in India. It must be visible BEFORE the shopper
                    clicks an outbound link, so it sits above the list rather
                    than in the footer. Do not remove it while store links carry
                    affiliate tracking. */}
                <p className="mb-3 text-xs leading-5 text-slate-500">
                  Some store links are affiliate links. As an Amazon Associate we earn from
                  qualifying purchases. This costs you nothing extra.
                </p>
                <ul className="divide-y divide-green-900/10 overflow-hidden rounded-xl border border-green-900/10 bg-white">
                {ingredients.map((ingredient, index) => (
                  <li key={`${ingredient}-${index}`} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="flex min-w-0 items-center gap-3 font-medium">
                      <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="break-words">{ingredient}</span>
                    </span>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {regionConfig.stores.map((store: StoreConfig) => {
                        const LogoComponent = LOGO_MAP[store.logoComponent];
                        return (
                          <Button
                            key={store.id}
                            asChild
                            variant="outline"
                            className={`h-9 px-2.5 ${store.buttonStyles.border} bg-white ${store.buttonStyles.hover} transition-all shadow-xs`}
                            title={store.name}
                          >
                            <a
                              href={store.getUrl(ingredient)}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Find ${ingredient} on ${store.name} (opens in new tab)`}
                            >
                              {LogoComponent && <LogoComponent className="h-4 w-auto" />}
                              <ArrowUpRight className={`h-3.5 w-3.5 ${store.buttonStyles.arrowColor}`} aria-hidden="true" />
                            </a>
                          </Button>
                        );
                      })}
                    </div>
                  </li>
                ))}
                </ul>
              </>
            )}
          </section>

          {/* Bottom banner ad */}
          <div className="mt-10" aria-label="Advertisement">
            <AdUnit slot="banner-bottom" />
          </div>

          <p className="mt-7 text-center text-xs leading-5 text-slate-500">Links open store search results in a new tab.<br />Availability and delivery depend on your location.</p>
        </main>

        {/* Right sidebar ad — hidden on screens smaller than lg */}
        <aside className="hidden lg:block w-[160px] shrink-0 pt-12" aria-label="Advertisement">
          <AdUnit slot="sidebar" />
        </aside>
      </div>
    </div>
  );
}
