# 🛒 Cartify — Quickstart & Buyer Setup Guide

Thank you for purchasing **Cartify**! This guide will walk you through setting up, deploying, and monetizing your new AI recipe-to-grocery shopping app in less than 5 minutes.

---

## ⚡ 3-Minute 1-Click Deployment (Recommended)

The fastest way to deploy Cartify is using [Vercel](https://vercel.com) (free tier available):

1. **Push to your GitHub**:
   - Create a new private or public repository on [GitHub](https://github.com/new).
   - Push this codebase to your repository:
     ```bash
     git init
     git add -A
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/<your-username>/<your-repo-name>.git
     git push -u origin main
     ```
2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new) and import your new repository.
3. **Set Environment Variables**:
   In the Vercel deployment screen under **Environment Variables**, add:
   - `OPENROUTER_API_KEY` = your OpenRouter API Key (get free at [openrouter.ai/keys](https://openrouter.ai/keys))
   - `NEXT_PUBLIC_AMAZON_TAG_IN` = *(Optional)* your Amazon Associates tag for India (e.g. `yourtag-21`).
     Use `NEXT_PUBLIC_AMAZON_TAG_US` and `NEXT_PUBLIC_AMAZON_TAG_UK` for those regions — each Amazon
     region is a separate programme. See `AFFILIATE_SETUP.md` for every store's variable.
4. **Click Deploy**:
   - Vercel will build and launch your live site with a free SSL certificate in ~45 seconds!

> [!IMPORTANT]
> **To make your app public without requiring visitors to log into Vercel:**
> In your Vercel Dashboard &rarr; Go to **Settings** &rarr; **Deployment Protection** &rarr; Disable **Vercel Authentication**.

---

## 💻 Running Locally on Your Machine

### Prerequisites:
- [Node.js](https://nodejs.org) (version 18 or 20+ recommended)
- Git

### Steps:
1. Open a terminal in the project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your local environment file:
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Open `.env.local` in any text editor and paste your OpenRouter API key:
     ```env
     OPENROUTER_API_KEY=sk-or-v1-...
     NEXT_PUBLIC_AMAZON_TAG_IN=yourtag-21
     ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💰 Monetization Setup (Amazon Associates & Quick Commerce)

Cartify is pre-configured to generate revenue through grocery affiliate links:

1. **Amazon Associates (India)**:
   - Sign up at [Amazon Associates India](https://affiliate-program.amazon.in/).
   - Get your tracking tag (e.g., `store-21`).
   - Add `NEXT_PUBLIC_AMAZON_TAG_IN=store-21` to your host's Environment Variables.
     Remember that `NEXT_PUBLIC_` values are baked into the build, so redeploy after changing one.
   - Every time a user clicks **Amazon Fresh** or **Amazon Now**, your affiliate tag is automatically attached.

2. **Swiggy Instamart & Blinkit**:
   - Cartify generates direct deep-search queries into Swiggy Instamart and Blinkit.
   - If you partner with local affiliate networks (or programmatic ad networks), you can route these URLs through your tracking redirects.

---

## 🎨 Customizing Branding, Colors & Metadata

- **App Name & Headings**: Edit `app/page.tsx` to change the title, tagline, or placeholder examples.
- **Favicon & Metadata**: Edit `app/layout.tsx` to update title, description, OpenGraph preview cards, and icons.
- **Colors & Styling**: Cartify uses Tailwind CSS. You can customize colors in `tailwind.config.ts` or change classes in `app/page.tsx`.

---

## 🧪 Built-in Verification & Quality Checks

Run these commands at any time to verify code health:
- `npm run typecheck` — Verifies TypeScript types with 0 errors.
- `npm test` — Runs automated Vitest test suites.
- `npm run build` — Tests full Next.js production compilation.

---

## 📄 License & Support

Refer to `LICENSE.md` for terms of use. If you need any assistance, reach out via your purchase platform. Happy building!

---

## Further reading

- **`AFFILIATE_SETUP.md`** — every affiliate variable, which programmes accept you
  immediately versus which need an application, and your disclosure obligations.
- **`ADSENSE_SETUP.md`** — getting approved, `ads.txt`, consent for EU/UK visitors,
  and the placement rules that protect your account.
- **`REPURPOSING_GUIDE.md`** — using the same engine for a different niche, with
  the exact files to change.
- **`DEPLOYMENT_AND_MONETIZATION.md`** — hosting options and revenue strategies.
