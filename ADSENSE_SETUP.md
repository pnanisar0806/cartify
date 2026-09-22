# Google AdSense setup

Cartify supports AdSense alongside affiliate links. Running both on one page is permitted.

This covers getting approved, wiring it up, and the policies that most often cost people their account.

---

## Before you write any code: get approved

Approval is the hard part, and worth understanding before you invest time in placement.

Google reviews your live site and rejects what it calls "low value content". **A tool with one input box and no supporting content is exactly the profile that gets rejected.** Applying with a bare Cartify deployment will very likely fail, and reapplying after rejection is slower than getting it right the first time.

What improves your odds:

**Add real content.** Articles, guides, curated recipe collections. This also earns search traffic, which you need regardless.

**Publish the required pages.** A privacy policy is mandatory and must disclose that Google and its partners use cookies to serve ads. Add an about page and a contact method.

**Use a custom domain** with some history. A deployment that went live yesterday on a free subdomain reviews poorly.

**Finish the site first.** Working links, no placeholder text, no broken pages.

Approval typically takes a few days to a few weeks.

---

## Configuration

Once approved, Google gives you a publisher ID shaped like `ca-pub-0000000000000000`. Then create each ad unit in the AdSense dashboard under **Ads > By ad unit** and copy its numeric slot ID.

```bash
NEXT_PUBLIC_ADSENSE_PUB_ID=ca-pub-0000000000000000
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=0000000000
NEXT_PUBLIC_ADSENSE_SLOT_BANNER_TOP=0000000000
NEXT_PUBLIC_ADSENSE_SLOT_BANNER_BOTTOM=0000000000
```

An ad position renders only when **both** the publisher ID and that position's slot ID are set, so a partly configured site shows no empty boxes. With nothing set, no ad code loads at all and the app runs normally.

These are build-time values. Change one and redeploy.

### ads.txt

One line, carrying your own publisher ID:

```
google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
```

Note the format difference: `pub-` here, not `ca-pub-`.

**Where it goes depends on how you deploy, and this catches people out.**

*App on a root domain* (`example.com`): put it in `public/ads.txt`. Next.js serves
`public/` at the site root, so it lands at `example.com/ads.txt`.

*App on a subdomain* (`app.example.com`): Google reads **`example.com/ads.txt`**, the
root domain, not the subdomain's copy. A file in this app's `public/` folder would be
served at `app.example.com/ads.txt`, where nothing looks for it. Put it on whatever
serves your root domain instead. One file there covers every subdomain you run.

Skipping it does not block ads, but it limits which advertisers bid on your inventory,
which directly lowers revenue.

### Consent for EU and UK visitors

If you serve the EEA or the UK, Google requires a certified Consent Management Platform, and consent must be collected before ad cookies are set. Google's own consent tools are free and certified.

This is enforced. Serving European traffic without a CMP puts your account at risk.

---

## Placement

Where you put ads matters more for your account's survival than for revenue.

**Keep ads clearly separated from results.** Your results list is a column of links the visitor intends to click. An ad sitting inside or immediately beside that list, styled similarly, produces accidental clicks — which is invalid traffic, and Google suspends accounts for it. The shipped positions (sidebar, above the form, below the results) are chosen for this reason. If you move them, keep that separation.

**Never click your own ads.** Not to test, not once. Self-clicks are the most common cause of permanent termination. Use AdSense's preview tooling to check rendering.

**Space is already reserved.** Each unit's wrapper carries a `minHeight` so the page does not shift when an ad fills. Keep that if you restyle, or you will hurt your Cumulative Layout Shift score and your search ranking with it.

---

## Revenue expectations

Display advertising pays on impressions, and impressions need volume. A few hundred visits a month earns small change. AdSense becomes meaningful somewhere in the tens of thousands of monthly visitors.

For a tool like this, affiliate commission will almost certainly out-earn AdSense at every traffic level, because one grocery conversion is worth more than thousands of impressions. Treat AdSense as a second layer monetising visitors who browse without buying, not the primary model.

Payout threshold is $100, paid roughly a month after the close of the month you earned it.

---

## What gets accounts banned

Worth stating plainly, because recovery is rare and appeals frequently fail:

- Clicking your own ads, or asking anyone to
- Bot traffic, paid clicks, traffic exchanges
- Ads placed to induce accidental clicks
- Ads on pages with no content, or on error pages
- Copied content
- Serving EEA or UK traffic without a consent mechanism

Read the AdSense Program Policies once, in full, before launch.

---

## Where this lives in the code

`components/ad-unit.tsx` renders a unit and reads the slot variables. `app/layout.tsx` loads the AdSense script, gated on the publisher ID. `app/page.tsx` places the three units.
