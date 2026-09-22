/**
 * Affiliate link handling.
 *
 * Affiliate programmes work in one of two ways, so this module supports both:
 *
 * 1. Native tag — the retailer accepts your tracking ID as a query parameter on
 *    its own URL. Amazon works this way: `&tag=yourtag-21`.
 *
 * 2. Deep link template — the retailer is reached through an affiliate network
 *    (Awin, Impact, CJ, Rakuten, Cuelinks, EarnKaro). The network issues a
 *    redirect URL and you paste it whole, marking where the destination goes
 *    with `{URL}`. Example for Awin:
 *
 *      https://www.awin1.com/cread.php?awinmid=1234&awinaffid=5678&ued={URL}
 *
 * A store with no configuration linked to it sends the shopper straight to the
 * retailer, untracked. Nothing breaks; you simply earn nothing on that click.
 *
 * IMPORTANT: every environment variable must be referenced literally, because
 * Next.js inlines `NEXT_PUBLIC_*` values at build time by static analysis.
 * `process.env[someVariable]` returns undefined in the browser bundle.
 */

/** Fallback template applied to any store without its own, when set. */
function globalTemplate(): string | undefined {
  return process.env.NEXT_PUBLIC_AFFILIATE_TEMPLATE;
}

function fillTemplate(template: string, directUrl: string): string {
  return template.replace("{URL}", encodeURIComponent(directUrl));
}

/**
 * Routes a destination URL through an affiliate network's redirect.
 *
 * @param directUrl the retailer URL the shopper should end up on
 * @param template  the network's redirect URL containing `{URL}`, usually read
 *                  from a literal `process.env.NEXT_PUBLIC_*` reference
 */
export function withTemplate(directUrl: string, template?: string): string {
  const own = template?.trim();
  if (own && own.includes("{URL}")) {
    return fillTemplate(own, directUrl);
  }

  const fallback = globalTemplate()?.trim();
  if (fallback && fallback.includes("{URL}")) {
    return fillTemplate(fallback, directUrl);
  }

  return directUrl;
}

/**
 * Appends an Amazon Associates tag. Each Amazon region is a separate programme
 * with its own tag — an amazon.in tag earns nothing on amazon.com.
 *
 * Falls back to the template mechanism when no tag is set, so a shopper can
 * still be tracked through a network if you prefer that route.
 */
export function withAmazonTag(directUrl: string, tag?: string): string {
  const id = tag?.trim();
  if (!id) {
    return withTemplate(directUrl);
  }
  const separator = directUrl.includes("?") ? "&" : "?";
  return `${directUrl}${separator}tag=${encodeURIComponent(id)}`;
}

/**
 * Marks a store as having no affiliate programme available.
 *
 * Swiggy Instamart and Blinkit are the current examples: neither operates a
 * public affiliate programme, so their links are deliberately left clean rather
 * than carrying a parameter that would silently earn nothing. If you hold a
 * cashback-network account that covers them, set
 * `NEXT_PUBLIC_AFFILIATE_TEMPLATE` and it applies here too.
 */
export function unmonetised(directUrl: string): string {
  return withTemplate(directUrl);
}
