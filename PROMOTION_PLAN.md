# Promotion plan

Two tracks. The Gumroad listing sells the source code; the live app earns affiliate and ad revenue and feeds buyers into the listing. Track 2 makes track 1 easier, so neither is optional.

Internal working document. Not shipped to buyers — `marketing-vault/scripts/package-digital-product.js` uses an explicit include list, and this file is not on it.

---

## The constraints that shape everything

| Constraint | Status |
|---|---|
| Gumroad sales | 0 |
| Gumroad Discover | needs $100 from genuine sales, payout details, then ~3 weeks risk review |
| Gumroad follow form | cannot capture email until the account is reviewed and marked compliant |
| Amazon Associates IN | tag `craftory-21` live on the app; **3 qualifying sales within 180 days of signup or the account closes** |
| Amazon Associates US/UK | not registered. Each starts its own 180-day clock — register only when that region's traffic exists |
| Domain | none yet. Blocks AdSense, Impact and Awin |
| AdSense | blocked on domain; also rejects thin single-tool sites as "low value content" |

**The tightest deadline is the Amazon 180-day window, not anything on Gumroad.** Check the signup date in Associates Central and work backwards from it.

### The insight that changes track 2

A qualifying sale is *any* Amazon purchase made within 24 hours of a click on a tagged link. Someone clicks a tomato link at 6pm and buys headphones at 9pm — that counts, and it pays far better than groceries.

So track 2 should optimise for **click volume, not purchase intent**. Broad reach beats a narrowly targeted cooking audience.

---

## Do these first

- [ ] **Affiliate disclosure on the app.** Required by Amazon's Operating Agreement and by ASCI in India. One line above the results list. Not optional.
- [ ] **Declare the app URL** in Associates Central under *Your Websites and Mobile Apps*. Amazon can void commissions from undeclared sites.
- [ ] **Set the Gumroad bio** — currently empty. `gumroad user update --bio "..."`
- [ ] **Decide the domain.** Everything compounding is blocked behind it.

Traffic sent before these is traffic that leaks or cannot be re-run.

---

## Track 1 — the Gumroad listing

### Who actually buys this

Not Next.js hobbyists. People who want an affiliate site without building one. That puts r/juststart and r/affiliatemarketing ahead of r/nextjs.

### Rules

**Lead with the demo, never the listing.** `cartify-echodigi.vercel.app` does in ten seconds what a paragraph cannot. Every post links the demo; the demo's footer links the product page.

**Use the reels.** The Founder bundle contains five finished vertical reels with voiceover, subtitles, thumbnails and a caption guide. They are built and unused. They sell the app, which sells the source.

### Schedule

**Week 1 — the technical article.** dev.to or Hashnode: *"Fetching arbitrary user-supplied URLs without opening an SSRF hole."* Real material to draw on: the bracketed-IPv6 bug where `hostname === "::1"` never matched, per-hop redirect revalidation, the DNS resolution step that catches the `nip.io` family, and the JSON-LD fast path with an HTML fallback. Demonstrates the code quality you are charging for. Product link at the bottom, not the top.

Cross-post to r/webdev and r/nextjs. Technical posts survive self-promo rules; sales posts do not.

**Week 1 — Reddit launch.** r/SideProject and r/IndieBiz accept launch posts directly.

> I built a recipe-to-grocery app, then realised the engine works for any affiliate niche — selling the source.

Show the demo. Mention the three documented verticals. Be upfront that grocery affiliate rates are at the low end and that hardware and beauty pay better. That candour reads as credibility to this audience.

**Week 2 — r/juststart and r/affiliatemarketing.** Different framing entirely: a turnkey affiliate site where you paste your Awin or Impact deep link and deploy. This audience does not care about TypeScript. It cares that the thing works without a developer, and that the affiliate documentation is honest about which programmes approve instantly and which need an application.

**Week 2 — X thread.** Build-in-public, from `@pnanisar`. The recipe-to-cart transformation is visual, which is rare for a boilerplate. Problem, demo GIF, what's inside, link.

**Week 3 — Indie Hackers.** A "what I built and what I learned" post. That community rewards the post-mortem framing, including the part where the first version's affiliate links earned nothing because the parameters were wrong.

**Later — Product Hunt.** One shot only. Hold it until the domain is live and a few sales provide social proof. Launching to zero reviews wastes it.

**Ongoing — recruit affiliates.** Available today, before Discover unlocks. Someone with an audience of affiliate-site builders sending traffic at 40–50% commission beats waiting three weeks on a risk review.

---

## Track 2 — the app

### Who uses it

People in Indian metros who already order from Instamart and Blinkit. Not developers.

### Channels, by effort-to-return

**Instagram Reels, YouTube Shorts, TikTok.** The five existing reels, posted to all three. Zero marginal cost. Start here.

**Reddit:** r/IndianFood, r/indiasocial, and city subs such as r/bangalore and r/mumbai. "Paste any recipe, get your Instamart cart" is a useful thing to share rather than a pitch.

**WhatsApp and Facebook cooking groups.** Unglamorous, and probably the highest conversion per view in India.

**Pinterest**, once the domain exists. Recipe audiences live there and pins have a long tail that none of the above have.

**SEO** is the only channel that compounds, and it is blocked on the domain. It also feeds AdSense approval, which rejects thin single-tool sites. This is the strongest argument for choosing a domain soon.

### Funnel

Every app visitor should be able to find the source. Footer link from the app to the Gumroad listing, worded for a builder rather than a shopper: *"Built with Next.js. Get the source."*

---

## Sequencing

1. Disclosure, declared site, bio. A day's work at most.
2. Domain. Point at Vercel, set up `ads.txt`, plan content.
3. Track 2 reels and Reddit — cheapest clicks, and the Amazon clock is running.
4. Track 1 technical article and launch posts.
5. Content on the domain, then apply to AdSense.
6. Impact and Awin applications once the domain has real content.
7. Product Hunt, once there is proof.

---

## Open questions

- Signup date on the Associates account, and therefore the real deadline.
- Domain choice, and whether products get subdomains or paths.
- Whether international traffic justifies US and UK Associates accounts yet.
