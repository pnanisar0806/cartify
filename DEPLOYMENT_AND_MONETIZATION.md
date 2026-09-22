# Cartify: Vercel Deployment & Monetization Playbook

This guide covers everything needed to take **Cartify** from local development to production on Vercel, followed by monetization strategies (selling as a digital product or launching as a consumer micro-SaaS).

---

## Table of Contents
1. [What the AI Agent Can Build vs. What You Need to Do](#what-the-ai-agent-can-build-vs-what-you-need-to-do)
2. [Part 1: Step-by-Step Vercel Deployment Guide](#part-1-step-by-step-vercel-deployment-guide)
3. [Part 2: Monetization & Digital Product Selling Plan](#part-2-monetization--digital-product-selling-plan)
   - [Strategy 1: Selling as a Digital Product (Source Code / Starter Kit)](#strategy-1-selling-as-a-digital-product-source-code--starter-kit)
   - [Strategy 2: Operating as a Consumer Web App](#strategy-2-operating-as-a-consumer-web-app)
4. [Packaging & Marketing Copy for Selling](#packaging--marketing-copy-for-selling)
5. [Recommended Execution Roadmap](#recommended-execution-roadmap)

---

## What the AI Agent Can Build vs. What You Need to Do

| Category | What the AI Agent Can Take Care Of (In Code) | What You (The User) Need to Do (External) |
| :--- | :--- | :--- |
| **Deployment** | • Verify `.gitignore` and security boundaries<br>• Optimize build artifacts & typecheck<br>• Write step-by-step CLI commands & setup scripts<br>• Configure Vercel serverless functions / edge configs | • Sign in to GitHub and Vercel<br>• Create the remote GitHub repository<br>• Click "Deploy" in Vercel UI<br>• Add custom domain DNS (if desired) |
| **Affiliate Links** | • Implement affiliate tracking query wrapper (e.g., Cuelinks, EarnKaro, Impact)<br>• Dynamically attach referral IDs to Swiggy & Blinkit links | • Register with affiliate networks (Cuelinks / EarnKaro)<br>• Paste your affiliate tag into `.env.local` / Vercel |
| **Store & Region Expansion** | • Add toggle for multi-region presets:<br>  - 🇮🇳 India (Swiggy, Blinkit, Zepto)<br>  - 🇺🇸 US (Instacart, Amazon Fresh, Walmart)<br>  - 🇬🇧 UK (Tesco, Sainsbury's, Ocado) | • Decide target launch geographies |
| **Product Features (Pro / SaaS)** | • Build "Pantry Exclusion" (check off ingredients you already have)<br>• Add weekly meal-plan batch deduplication<br>• Implement Upstash Redis distributed rate limiter | • Define pricing tiers and subscription limits |
| **Digital Product Sales** | • Write customer setup guide (`CUSTOMER_SETUP.md`)<br>• Write high-converting Gumroad / Lemon Squeezy sales copy<br>• Prepare clean code export | • Create Lemon Squeezy / Gumroad / Whop account<br>• Connect payout bank / Stripe account<br>• Publish product listing |

---

## Part 1: Step-by-Step Vercel Deployment Guide

Deploying Cartify to Vercel takes approximately 3–5 minutes.

### Step 1: Verify Secret Isolation
Before committing anything to Git, confirm that sensitive API keys are not tracked:
- Verify `.env.local` is listed in [`.gitignore`](.gitignore).
- Only [`.env.example`](.env.example) should be tracked by Git.

### Step 2: Initialize Git & Push to GitHub
1. Open terminal in the project root (`D:\Cartify`):
   ```bash
   git init
   git add .
   git commit -m "feat: initial release of Cartify with recipe text & URL conversion"
   ```
2. Create a new repository on [GitHub](https://github.com/new) (e.g., `cartify`).
3. Link and push your branch:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/cartify.git
   git push -u origin main
   ```

### Step 3: Connect Project to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Under "Import Git Repository", find and select `cartify`.
4. Framework Preset will auto-detect **Next.js**.
5. Leave the root directory as `./`.

### Step 4: Configure Environment Variables in Vercel
Before clicking Deploy, expand the **Environment Variables** panel:
- **Key:** `OPENROUTER_API_KEY`
- **Value:** `sk-or-v1-...` *(your OpenRouter API key)*
- **Target Environments:** Select *Production*, *Preview*, and *Development*.

### Step 5: Deploy & Test
1. Click **"Deploy"**. Vercel will run the production build and provide a live URL (e.g., `https://cartify.vercel.app`).
2. Test both inputs on the live site:
   - Paste raw recipe text (e.g. *"2 cups chopped bok choy, 1 tbsp soy sauce"*).
   - Paste a live recipe URL (e.g. from Allrecipes or NYT Cooking).
   - Verify outbound links open Swiggy Instamart and Blinkit with query parameters encoded.

> [!NOTE]
> **Serverless Rate Limiting on Vercel:**  
> The current in-memory `Map` rate limiter works per serverless lambda instance. When scaling to high traffic on Vercel's multi-region edge, the standard pattern is **Upstash Redis** (`@upstash/ratelimit`). Upstash has a 1-click integration in the Vercel Marketplace with a 10,000 req/day free tier.

---

## Part 2: Monetization & Digital Product Selling Plan

Cartify can generate revenue through two complementary paths:

```
┌───────────────────────────────────────────────────────────────┐
│                       Cartify Project                         │
└───────────────┬───────────────────────────────┬───────────────┘
                │                               │
                ▼                               ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│ Path 1: Sell Digital Product  │ │ Path 2: Launch Consumer SaaS  │
├───────────────────────────────┤ ├───────────────────────────────┤
│ • Lemon Squeezy / Gumroad     │ │ • Grocery Affiliate Links     │
│ • Whop AI Marketplace         │ │ • Freemium Pro Subscription   │
│ • Turnkey Micro-SaaS Exit     │ │ • Brand / Ingredient Sponsors │
└───────────────────────────────┘ └───────────────────────────────┘
```

---

### Strategy 1: Selling as a Digital Product (Source Code / Starter Kit)

#### 1. Platforms to Target

| Platform | Target Audience | Pricing Model | Best For |
| :--- | :--- | :--- | :--- |
| **Lemon Squeezy / Gumroad** | Solo developers, indie hackers, agency builders | **$39** (Personal) / **$89** (Commercial License) | Selling as an "AI Micro-SaaS Boilerplate" |
| **Whop** | Creator communities, vibe coders | **$29 – $49** one-time or **$19/mo** bundle | Bundling with tutorial and future updates |
| **Acquire.com / Microns.io** | Micro-PE buyers, small investors | **$500 – $2,500** acquisition | Selling a deployed app with domain + branding |

#### 2. Unique Selling Proposition (USP)
- **Zero AI Model Cost:** Uses OpenRouter's free-tier routing (`openrouter/free`), meaning buyers do not need paid OpenAI credits to run the app.
- **Recipe Link Scraping:** Works with both text and webpage URLs out of the box with Schema.org JSON-LD extraction.
- **Production Ready:** Next.js 14 App Router, Tailwind CSS, shadcn/ui components, and 26 passing unit tests.

---

### Strategy 2: Operating as a Consumer Web App

#### 1. Grocery Affiliate Commissions (Passive Revenue)

Read this before forecasting income: which retailers you can earn from depends
entirely on which programmes accept you, and two of the Indian partners have no
programme at all.

**Self-serve, approved quickly**
- **Amazon Associates** — one account per region. An `amazon.in` tag earns
  nothing on `amazon.com`, so register separately for each region you serve.
  Amazon also closes accounts with no qualifying sale within 180 days, so sign
  up once you have traffic.

**Application required, usually with a live site**
- **Impact** (impact.com) — Instacart, Walmart, Target.
- **Awin** (awin.com) — Tesco, Sainsbury's, Ocado.
  You apply to the network, then separately to each retailer. Expect days to
  weeks, and expect rejection if your site is an empty deployment.

**No affiliate programme exists**
- **Swiggy Instamart** and **Blinkit** run no public affiliate programme. Their
  links are deliberately left clean rather than carrying a parameter that would
  silently earn nothing. Cashback networks such as **Cuelinks** or **EarnKaro**
  sometimes carry these merchants; if you hold an account with one, set
  `NEXT_PUBLIC_AFFILIATE_TEMPLATE` and it applies to them too. Rates are lower
  than a direct relationship and the merchant can be dropped at any time.

**Realistic rates.** Commission runs roughly 1–10% by category, with groceries at
the low end, and the shopper must complete a purchase inside the programme's
cookie window — 24 hours for Amazon, longer for most networks. A search link
also converts less well than a direct product link, which is the deliberate
trade-off Cartify makes so links never rot when a product is delisted. Measure
your own conversion rate before projecting income.

**Disclosure is mandatory**, not optional. The FTC (US) and ASA (UK) both
require a clear statement that you earn commission, placed where the visitor
sees it before clicking — not in a footer. Amazon additionally requires you to
state that you are an Amazon Associate. Cartify does not add this for you.

#### 2. Pro Tier Subscription (Freemium Model)
- **Free Tier:** 5 recipe conversions per day.
- **Pro Tier ($3.99/mo or ₹199/mo via Lemon Squeezy / Dodo Payments / Razorpay):**
  - **Unlimited Conversions:** No daily caps.
  - **Pantry Exclusion:** Checkbox next to each ingredient ("I already have this") so it doesn't get added to the cart.
  - **Weekly Meal Plan Batching:** Paste Monday–Sunday recipes at once and auto-merge duplicate items (e.g. 2 onions + 3 onions = 5 onions).
  - **Multi-Region Selection:** Instant switching between India, US, and UK grocery delivery services.

---

## Packaging & Marketing Copy for Selling

If listing on Gumroad, Lemon Squeezy, or Whop, use this high-converting copy:

### Product Title
> **Cartify — AI Recipe-to-Grocery Micro-SaaS Starter Kit (Next.js 14, Tailwind, Zero-Cost AI)**

### Short Description
> Turn any recipe or cooking link into instant 1-click grocery shopping links for Swiggy Instamart and Blinkit. Built with Next.js 14 App Router, shadcn/ui, and OpenRouter with zero API running costs.

### Key Highlights for Buyers
- ⚡ **Zero-AI-Cost Architecture:** Pre-configured with OpenRouter free-tier auto-routing. No OpenAI bill.
- 🔗 **Smart Link Scraping:** Automatically detects recipe URLs, parses Schema.org JSON-LD, and extracts ingredients from websites.
- 🛒 **Instant Cart Search:** Built-in URL generators for quick-commerce apps.
- 🛡️ **SSRF Guard & Rate Limiting:** Built-in IP rate limiter and private subnet protection.
- 🧪 **100% Tested:** 26 automated unit tests with Vitest.
- 🚀 **Deploy in 3 Minutes:** 1-click deploy to Vercel.

---

## Recommended Execution Roadmap

1. **Step 1 (Today):** Deploy Cartify to Vercel using the 5 steps above.
2. **Step 2 (Monetization Phase 1):** Create accounts on Gumroad / Lemon Squeezy, upload the project zip, and paste the product copy.
3. **Step 3 (Consumer Launch):** Launch on Product Hunt, Reddit (`r/SideProject`, `r/webdev`), and Twitter/X with a short screen recording demonstrating pasting a recipe link and getting instant cart buttons.
4. **Step 4 (Affiliate Activation):** Plug in Cuelinks or EarnKaro affiliate links to monetize traffic without charging users.
