# Repurposing Cartify

Cartify is built around one pipeline, and groceries are only the vertical it ships configured for:

```
pasted text or URL  ->  fetch and clean the content
                    ->  AI extracts a list of items
                    ->  build a search URL per item, per retailer
                    ->  attach your affiliate tracking
```

Nothing in that pipeline is food-specific. Changing the vertical means changing an extraction prompt and a set of retailer URLs. It is configuration work, not an architecture change, and a competent developer can do it in an afternoon.

This guide covers three verticals in detail and the general procedure for any other.

---

## The six seams

Every repurposing touches the same places.

| # | What it controls | Where |
|---|---|---|
| 1 | What the AI extracts | `app/api/convert/route.ts` — `SYSTEM_PROMPT`, line 6 |
| 2 | Which retailers, and each search URL | `lib/regions.ts` — the store arrays |
| 3 | How your tracking attaches | `lib/affiliate.ts` + your `.env.local` |
| 4 | Retailer logos | `components/store-logos.tsx`, `components/global-store-logos.tsx`, and `LOGO_MAP` in `app/page.tsx` |
| 5 | Copy, branding, page metadata | `app/page.tsx`, `app/layout.tsx` |
| 6 | Which regions exist | `lib/regions.ts` — `REGIONS`, `REGION_LIST` |

Two supporting files matter less often:

- `lib/url-extractor.ts` — fetches a URL and pulls content out. Read the structured-data note below before switching vertical.
- `lib/rate-limiter.ts` — IP throttle, vertical-independent.

### A note on structured data

`lib/url-extractor.ts` has two paths. It first looks for Schema.org JSON-LD with `@type: Recipe` and reads `recipeIngredient`. That path is exact, and it is why recipe URLs work so well. If it finds nothing, it falls back to scraping visible text and letting the AI sort it out.

**Only recipes get the exact path.** Every other vertical uses the fallback. That works, but expect lower precision on messy pages and slightly higher token cost, since more text reaches the model.

If your vertical publishes its own Schema.org type you can restore the exact path. Books are the best case — see below.

---

## Vertical 1 — PC and hardware build lists

**Input:** a parts list from a video description, a forum thread, or a PCPartPicker page.
**Output:** a search link per component.

Components cost hundreds, so a 3% commission on a graphics card beats a hundred grocery conversions, and the audience already clicks parts lists.

### The extraction prompt

`app/api/convert/route.ts`, line 6.

The grocery prompt deliberately *strips* detail: "2 cups of roughly chopped fresh bok choy" becomes "bok choy". Hardware needs the opposite. A model number **is** the product; strip it and the link is worthless.

```ts
const SYSTEM_PROMPT =
  "You are a PC component extractor. The user will provide a build list, forum post, or video description. Extract each distinct hardware component as a single search string, preserving the exact manufacturer and model number. Keep specifics: 'RTX 4070 Ti Super 16GB' stays as written. Drop prices, retailer names, commentary, and build notes. Return a JSON object with a single key 'ingredients' containing an array of strings.";
```

Keep the JSON key `ingredients`. Renaming it means touching the parser, the route, the page and the tests for no functional gain — it is an internal name no visitor sees.

### The retailers

In `lib/regions.ts`, replace a region's store array:

```ts
const usStores: StoreConfig[] = [
  {
    id: "amazon-us",
    name: "Amazon",
    logoComponent: "AmazonFreshUSLogo", // swap for your own logo component
    getUrl: (item) =>
      withAmazonTag(
        `https://www.amazon.com/s?k=${encodeURIComponent(item)}`,
        process.env.NEXT_PUBLIC_AMAZON_TAG_US
      ),
    buttonStyles: { border: "border-slate-200", hover: "hover:bg-slate-50", arrowColor: "text-slate-600" },
  },
  {
    id: "newegg",
    name: "Newegg",
    logoComponent: "NeweggLogo",
    getUrl: (item) =>
      withTemplate(
        `https://www.newegg.com/p/pl?d=${encodeURIComponent(item)}`,
        process.env.NEXT_PUBLIC_AFFILIATE_NEWEGG
      ),
    buttonStyles: { border: "border-orange-200", hover: "hover:bg-orange-50", arrowColor: "text-orange-500" },
  },
];
```

Every `NEXT_PUBLIC_` variable must be written literally like this. Next.js inlines them at build time by static analysis, so `process.env[someVariable]` returns undefined in the browser.

---

## Vertical 2 — Skincare and makeup routines

**Input:** a routine from a TikTok caption, a blog post, or a "get ready with me" transcript.
**Output:** a search link per product.

High repeat purchase, strong commission tiers, and creators publish this content constantly.

### The extraction prompt

Brand and product name together form the identity. "Niacinamide serum" is useless; "The Ordinary Niacinamide 10% + Zinc 1%" converts.

```ts
const SYSTEM_PROMPT =
  "You are a beauty product extractor. The user will provide a skincare or makeup routine. Extract each distinct product as a search string containing the brand name and the product name. Keep both: 'The Ordinary Niacinamide 10% + Zinc 1%' stays as written. Drop application steps, quantities, timing, frequency, and commentary. Return a JSON object with a single key 'ingredients' containing an array of strings.";
```

### The retailers

Amazon is self-serve. Sephora and Ulta run through Rakuten; Boots and LookFantastic through Awin. Start with Amazon and add the networks once approved — see `AFFILIATE_SETUP.md`.

```ts
getUrl: (item) =>
  withTemplate(
    `https://www.sephora.com/search?keyword=${encodeURIComponent(item)}`,
    process.env.NEXT_PUBLIC_AFFILIATE_SEPHORA
  ),
```

### One caution

Do not let your site copy make claims about what products do for skin. Repeating a creator's routine is fine; asserting that a product treats a condition moves you into territory the FTC and ASA both police, and ad networks enforce it too.

---

## Vertical 3 — Reading lists

**Input:** a "10 books that changed my career" article, podcast show notes, or a syllabus.
**Output:** a search link per title.

The simplest of the three and the easiest to demo. Book titles are unambiguous in a way "moisturiser" is not, so accuracy is high with no tuning.

### The extraction prompt

```ts
const SYSTEM_PROMPT =
  "You are a book extractor. The user will provide an article, list, or transcript mentioning books. Extract each distinct book as a search string in the form 'Title Author'. Include the author whenever it is stated or clearly implied. Drop descriptions, rankings, commentary, and ISBNs. Return a JSON object with a single key 'ingredients' containing an array of strings.";
```

### The retailers

```ts
getUrl: (item) =>
  withAmazonTag(
    `https://www.amazon.com/s?k=${encodeURIComponent(item)}&i=stripbooks`,
    process.env.NEXT_PUBLIC_AMAZON_TAG_US
  ),
```

Bookshop.org runs its own programme, operates in the US and UK, supports independent bookshops, and approves more easily than most networks.

### Optional upgrade: exact extraction

Books are the one vertical where you can restore the precise structured-data path recipes enjoy. In `lib/url-extractor.ts`, the JSON-LD block checks for `@type: Recipe`. Add a parallel check for `@type: Book`, reading `name` and `author.name` instead of `recipeIngredient`. Goodreads, publisher sites and many book blogs publish this, and it removes the AI step entirely for those URLs — faster, cheaper, exact.

---

## Any other vertical

Ask three questions:

1. **Is the item identity a short string a search box can match?** Books and graphics cards, yes. "A nice throw pillow", no.
2. **Does the retailer expose a search URL you can build by hand?** Search the site and read the address bar. If it posts a form or needs a session, a plain link will not work.
3. **Can you join that retailer's affiliate programme?** Check before building. See `AFFILIATE_SETUP.md`.

Verticals that pass all three: DIY and woodworking tool lists, travel packing lists, home gym equipment, craft and knitting materials, board games, camera kit.

---

## Regions

Region handling is independent of vertical. `middleware.ts` detects the visitor's country from the hosting platform's geo header and sets a cookie; the header differs per platform and Vercel, Netlify, Cloudflare and Fly are all handled. `lib/regions.ts` maps region codes to store lists.

To run a single region, reduce `REGIONS` and `REGION_LIST` to one entry and the selector disappears on its own.

---

## After any change

```bash
npm run typecheck
npm test
npm run build
```

`lib/regions.test.ts` and `lib/affiliate.test.ts` assert on store URLs and affiliate behaviour, so they will fail once you change the stores. That is expected — update the expectations rather than deleting the tests. They are the only thing that catches a malformed affiliate URL before your traffic does.

`app/api/convert/live.test.ts` calls the real API and needs a valid `OPENROUTER_API_KEY`; it skips without one.
