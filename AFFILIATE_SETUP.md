# Affiliate setup

How Cartify attaches your affiliate tracking, which programmes you can join, and what the law requires of you.

Read the eligibility section before planning revenue. Most programmes are not instant, and two of the Indian partners have no programme at all.

---

## The short version

Everything is optional. With nothing configured the app works exactly as it does with tracking — shoppers reach the retailer, you simply earn nothing.

Two mechanisms, because affiliate programmes work in two different ways.

**Amazon takes a tag.** Set your Associates ID and it is appended to Amazon links:

```bash
NEXT_PUBLIC_AMAZON_TAG_IN=yourtag-21
NEXT_PUBLIC_AMAZON_TAG_US=yourtag-20
NEXT_PUBLIC_AMAZON_TAG_UK=yourtag-21
```

**Everything else takes a deep link.** Affiliate networks issue a redirect URL. Paste it whole and put `{URL}` where the destination belongs:

```bash
NEXT_PUBLIC_AFFILIATE_TESCO=https://www.awin1.com/cread.php?awinmid=1234&awinaffid=5678&ued={URL}
NEXT_PUBLIC_AFFILIATE_INSTACART=https://instacart.xxxxxx.net/c/1234567/890123/4567?u={URL}
```

That is the whole integration. No code changes, no SDK, no callback URL. Cartify URL-encodes the destination and substitutes it into your link.

A template missing `{URL}` is ignored rather than used, so a half-pasted link sends shoppers to the retailer instead of somewhere wrong.

### Every variable

| Variable | Store |
|---|---|
| `NEXT_PUBLIC_AMAZON_TAG_IN` | Amazon Fresh and Amazon Now, India |
| `NEXT_PUBLIC_AMAZON_TAG_US` | Amazon Fresh, US |
| `NEXT_PUBLIC_AMAZON_TAG_UK` | Amazon Fresh, UK |
| `NEXT_PUBLIC_AFFILIATE_INSTACART` | Instacart |
| `NEXT_PUBLIC_AFFILIATE_WALMART` | Walmart Grocery |
| `NEXT_PUBLIC_AFFILIATE_TARGET` | Target |
| `NEXT_PUBLIC_AFFILIATE_TESCO` | Tesco |
| `NEXT_PUBLIC_AFFILIATE_SAINSBURYS` | Sainsbury's |
| `NEXT_PUBLIC_AFFILIATE_OCADO` | Ocado |
| `NEXT_PUBLIC_AFFILIATE_TEMPLATE` | fallback for any store without its own |

`NEXT_PUBLIC_AMAZON_TAG` is still read for India so older deployments keep working.

### Verifying it works

Deploy, run a conversion, right-click a result link and copy the address. Your tag or redirect must be visible in it.

`NEXT_PUBLIC_` values are baked in at build time, not read at runtime. **Changing one on your host requires a redeploy.** This catches almost everybody once.

---

## Which programmes you can actually join

### Self-serve, approved in minutes

**Amazon Associates.** The one genuinely instant option.

Two things to know first. Each region is a **separate programme with a separate tag** — `amazon.in`, `amazon.com` and `amazon.co.uk` do not share accounts, and an India tag earns nothing on a `.com` link. Second, Amazon closes accounts that record no qualifying sale within 180 days of approval, so register once you have traffic to send.

### Application required, usually with a live site

You apply to the network, then separately to each retailer. Retailers reject applicants with no traffic or a thin site, so build first and apply second.

| Retailer | Network |
|---|---|
| Instacart, Walmart, Target | Impact (impact.com) |
| Tesco, Sainsbury's, Ocado | Awin (awin.com) |

Expect days to weeks. Applying with an empty deployment is the most common rejection reason.

### No programme exists

**Swiggy Instamart and Blinkit** run no public affiliate programme. Cartify sends their links out clean rather than attaching a parameter that would look like tracking and silently earn nothing.

If you hold a cashback-network account — Cuelinks, EarnKaro — that carries these merchants, set `NEXT_PUBLIC_AFFILIATE_TEMPLATE` and it applies to them along with any other store lacking its own template. Rates are below a direct relationship, and the network can drop a merchant at any time.

---

## Legal obligations

Affiliate links carry disclosure requirements. These are law, not network policy.

**United States.** The FTC requires clear and conspicuous disclosure that you earn commission, near the links rather than buried in a footer. Plain language works: "We earn a commission from purchases made through these links."

**United Kingdom.** The ASA requires the same and expects it visible before the click.

**European Union.** Comparable rules per member state, plus GDPR over any tracking or analytics you add.

**Amazon** additionally requires you to state that you are an Amazon Associate. Take the current wording from their Operating Agreement rather than copying another site — it changes.

A single line above your results list satisfies all of these. **Cartify does not add it for you**; it depends on which programmes you joined, and it is your legal responsibility.

---

## Realistic expectations

Commission runs roughly 1–10% by category, groceries at the low end, hardware and beauty higher. The shopper must complete a purchase inside the cookie window — 24 hours for Amazon, longer for most networks.

A search link converts less well than a direct product link, because the shopper still picks the product. That is a deliberate trade-off: search links never break when a product is delisted, where direct links rot constantly and need a catalogue API to maintain.

Measure your own conversion rate with real traffic before projecting income.

---

## Where this lives in the code

`lib/affiliate.ts` holds the two mechanisms. `lib/regions.ts` maps each store to its variable. Adding a retailer means adding one entry to the region's store list — see `REPURPOSING_GUIDE.md`.
