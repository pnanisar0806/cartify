/**
 * URL detection, SSRF protection, and recipe extraction utilities.
 */

/**
 * How much non-URL text has to be present before we assume the user pasted a
 * recipe that merely cites a source, rather than a link they want fetched.
 * Short lead-ins like "Cook this tonight:" stay well under it; a real
 * ingredient list goes well over.
 */
const PASTED_CONTENT_THRESHOLD = 60;

/**
 * Finds a link to fetch in the user's input.
 *
 * Returns null when the input carries enough text of its own to be the recipe,
 * so that pasting a full ingredient list with its source link still uses the
 * list rather than re-fetching the page.
 */
export function extractUrlFromText(text: string): string | null {
  const trimmed = text.trim();
  const urlMatch = trimmed.match(/https?:\/\/[^\s]+/i);
  if (!urlMatch) return null;

  const remainder = trimmed.replace(urlMatch[0], "").trim();
  if (remainder.length > PASTED_CONTENT_THRESHOLD) return null;

  try {
    const parsed = new URL(urlMatch[0]);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * SSRF protection.
 *
 * Returns true only for an address that is safe to fetch from the server. Every
 * private, loopback, link-local and reserved range is rejected, for IPv4 and
 * IPv6 alike, so a submitted link cannot be used to reach the host's own
 * network or a cloud metadata endpoint.
 *
 * Note that a literal check alone is not sufficient: a public hostname can
 * resolve to a private address. `assertPublicUrl` below resolves DNS and
 * re-checks, and `fetchRecipeFromUrl` validates every redirect hop.
 */
export function isPrivateAddress(address: string): boolean {
  // Strip the brackets the URL parser keeps around IPv6 literals, and any zone id.
  const host = address.toLowerCase().replace(/^\[|\]$/g, "").split("%")[0];

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [parseInt(ipv4[1], 10), parseInt(ipv4[2], 10)];
    if (a === 0) return true; // 0.0.0.0/8 "this network"
    if (a === 10) return true; // private
    if (a === 127) return true; // loopback
    if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
    if (a === 169 && b === 254) return true; // link-local, includes cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 192 && b === 0) return true; // IETF protocol assignments
    if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
    if (a >= 224) return true; // multicast and reserved
    return false;
  }

  if (host.includes(":")) {
    // IPv4-mapped and IPv4-compatible forms, e.g. ::ffff:127.0.0.1
    const mapped = host.match(/^::(?:ffff:)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
    if (mapped) return isPrivateAddress(mapped[1]);

    // Node renders ::ffff:127.0.0.1 as ::ffff:7f00:1, so check the hex form too.
    const hexMapped = host.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (hexMapped) {
      const high = parseInt(hexMapped[1], 16);
      const low = parseInt(hexMapped[2], 16);
      const dotted = `${high >> 8}.${high & 0xff}.${low >> 8}.${low & 0xff}`;
      return isPrivateAddress(dotted);
    }

    if (host === "::" || host === "::1") return true; // unspecified, loopback
    if (/^f[cd]/.test(host)) return true; // fc00::/7 unique local
    if (/^fe[89ab]/.test(host)) return true; // fe80::/10 link-local
    if (/^ff/.test(host)) return true; // ff00::/8 multicast
    return false;
  }

  return false;
}

/** Literal check on a URL's host. Does not resolve DNS — see assertPublicUrl. */
export function isPublicUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".home.arpa")
    ) {
      return false;
    }

    return !isPrivateAddress(hostname);
  } catch {
    return false;
  }
}

/**
 * Resolves the hostname and rejects the URL if any address it resolves to is
 * private. This is what stops hostnames that deliberately point at internal
 * addresses, such as the `127.0.0.1.nip.io` family, and DNS entries an attacker
 * controls.
 */
export async function assertPublicUrl(urlString: string): Promise<void> {
  if (!isPublicUrl(urlString)) {
    throw new Error("Invalid or prohibited URL. Please provide a public recipe website URL.");
  }

  const hostname = new URL(urlString).hostname.toLowerCase().replace(/^\[|\]$/g, "");

  // A literal IP has nothing to resolve; isPublicUrl already cleared it.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.includes(":")) return;

  const { lookup } = await import("node:dns/promises");
  let resolved: Array<{ address: string }>;
  try {
    resolved = await lookup(hostname, { all: true });
  } catch {
    throw new Error("Could not resolve that website's address. Please check the link.");
  }

  if (resolved.length === 0 || resolved.some((entry) => isPrivateAddress(entry.address))) {
    throw new Error("Invalid or prohibited URL. Please provide a public recipe website URL.");
  }
}

/**
 * Parses HTML and tries to find:
 * 1. Schema.org JSON-LD Recipe structured data (recipeIngredient array)
 * 2. Fallback: Cleaned text from HTML body
 */
export function extractRecipeFromHtml(html: string): string | null {
  if (!html || typeof html !== "string") return null;

  // 1. Try JSON-LD extraction (Schema.org Recipe)
  const jsonLdRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const rawJson = match[1].trim();
      const parsed = JSON.parse(rawJson);

      const findIngredientsInObject = (obj: any): string[] | null => {
        if (!obj || typeof obj !== "object") return null;

        // Check @graph array
        if (Array.isArray(obj["@graph"])) {
          for (const item of obj["@graph"]) {
            const found = findIngredientsInObject(item);
            if (found && found.length > 0) return found;
          }
        }

        // Check if object is Recipe or array of types includes Recipe
        const type = obj["@type"];
        const isRecipe =
          (typeof type === "string" && type.toLowerCase() === "recipe") ||
          (Array.isArray(type) && type.some((t: any) => typeof t === "string" && t.toLowerCase() === "recipe"));

        if (isRecipe && Array.isArray(obj.recipeIngredient) && obj.recipeIngredient.length > 0) {
          return obj.recipeIngredient.filter((i: any) => typeof i === "string" && i.trim().length > 0);
        }

        return null;
      };

      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const found = findIngredientsInObject(item);
          if (found && found.length > 0) {
            return found.join("\n");
          }
        }
      } else {
        const found = findIngredientsInObject(parsed);
        if (found && found.length > 0) {
          return found.join("\n");
        }
      }
    } catch {
      // Continue searching next JSON-LD block
    }
  }

  // 2. Fallback: Strip non-content tags and extract visible text
  let cleaned = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
    .replace(/<header\b[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, " ")
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, " ");

  // Strip all HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, " ");

  // Decode common HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length > 0) {
    // Limit to reasonable character length for model prompt
    return cleaned.slice(0, 10000);
  }

  return null;
}

/**
 * Fetches webpage content and extracts recipe text.
 */
/** Redirects are followed by hand so every hop can be re-checked. */
const MAX_REDIRECTS = 5;

/** Hard ceiling on downloaded bytes, so one huge page cannot exhaust memory. */
const MAX_RESPONSE_BYTES = 2_000_000;

/** Reads a response body up to the byte ceiling, discarding anything beyond it. */
async function readCapped(response: Response): Promise<string> {
  const body = response.body;

  // Not every runtime (or test double) exposes a streaming body. Fall back to
  // reading it whole, then trim to the same ceiling.
  if (!body || typeof body.getReader !== "function") {
    const text = await response.text();
    return text.length > MAX_RESPONSE_BYTES ? text.slice(0, MAX_RESPONSE_BYTES) : text;
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  const chunks: string[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_RESPONSE_BYTES) {
        chunks.push(decoder.decode(value, { stream: true }));
        break;
      }
      chunks.push(decoder.decode(value, { stream: true }));
    }
  } finally {
    await reader.cancel().catch(() => {});
  }

  return chunks.join("");
}

export async function fetchRecipeFromUrl(urlString: string): Promise<string> {
  let current = urlString;
  let response: Response | null = null;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    // Re-validate on every hop. Checking only the first URL would let a public
    // page redirect the server to an internal address.
    await assertPublicUrl(current);

    response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(12000), // 12 second fetch timeout
    });

    const isRedirect = response.status >= 300 && response.status < 400;
    if (!isRedirect) break;

    const location = response.headers.get("location");
    if (!location) {
      throw new Error("That website sent an incomplete redirect.");
    }

    // Relative Location headers are legal, so resolve against the current URL.
    current = new URL(location, current).href;
    response = null;
  }

  if (!response) {
    throw new Error("That website redirected too many times.");
  }

  if (!response.ok) {
    throw new Error(`Could not access webpage (status ${response.status}).`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text") && !contentType.includes("html") && !contentType.includes("json")) {
    throw new Error("The provided link does not point to a readable webpage.");
  }

  const html = await readCapped(response);
  const extracted = extractRecipeFromHtml(html);

  if (!extracted || !extracted.trim()) {
    throw new Error("No readable recipe content could be found on the webpage.");
  }

  return extracted;
}
