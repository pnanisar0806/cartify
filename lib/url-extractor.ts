/**
 * URL detection, SSRF protection, and recipe extraction utilities.
 */

// Detect if input text starts with or contains an HTTP/HTTPS URL
export function extractUrlFromText(text: string): string | null {
  const trimmed = text.trim();
  const urlMatch = trimmed.match(/https?:\/\/[^\s]+/i);
  if (!urlMatch) return null;
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

// SSRF Protection: verify host is not a private or loopback address
export function isPublicUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    const hostname = parsed.hostname.toLowerCase();

    // Check loopback / localhost
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) {
      return false;
    }

    // Check private IPv4 ranges:
    // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const octet1 = parseInt(ipv4Match[1], 10);
      const octet2 = parseInt(ipv4Match[2], 10);

      if (octet1 === 10) return false;
      if (octet1 === 127) return false;
      if (octet1 === 0) return false;
      if (octet1 === 169 && octet2 === 254) return false;
      if (octet1 === 192 && octet2 === 168) return false;
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return false;
    }

    return true;
  } catch {
    return false;
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
export async function fetchRecipeFromUrl(urlString: string): Promise<string> {
  if (!isPublicUrl(urlString)) {
    throw new Error("Invalid or prohibited URL. Please provide a public recipe website URL.");
  }

  const response = await fetch(urlString, {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(12000), // 12 second fetch timeout
  });

  if (!response.ok) {
    throw new Error(`Could not access webpage (status ${response.status}).`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text") && !contentType.includes("html") && !contentType.includes("json")) {
    throw new Error("The provided link does not point to a readable webpage.");
  }

  const html = await response.text();
  const extracted = extractRecipeFromHtml(html);

  if (!extracted || !extracted.trim()) {
    throw new Error("No readable recipe content could be found on the webpage.");
  }

  return extracted;
}
