import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware: detects the user's region and sets a `cartify-region` cookie.
 * Priority: existing cookie > Vercel geo header > Accept-Language > default (IN).
 */

const COOKIE_NAME = "cartify-region";
const VALID_REGIONS = new Set(["IN", "US", "UK"]);

/** Map ISO country codes to our region codes */
function countryToRegion(country: string | null | undefined): string {
  if (!country) return "IN";
  const upper = country.toUpperCase();
  if (upper === "US") return "US";
  if (upper === "GB" || upper === "UK") return "UK";
  if (upper === "IN") return "IN";
  // Map other English-speaking countries to closest region
  if (["CA"].includes(upper)) return "US";
  if (["IE", "AU", "NZ"].includes(upper)) return "UK";
  return "IN";
}

/** Try to infer region from Accept-Language header */
function regionFromAcceptLanguage(header: string | null): string | null {
  if (!header) return null;
  const lang = header.toLowerCase();
  if (lang.startsWith("en-us") || lang.startsWith("en-ca")) return "US";
  if (lang.startsWith("en-gb") || lang.startsWith("en-au") || lang.startsWith("en-nz") || lang.startsWith("en-ie")) return "UK";
  if (lang.startsWith("hi") || lang.startsWith("bn") || lang.startsWith("ta") || lang.startsWith("te") || lang.startsWith("mr") || lang.startsWith("en-in")) return "IN";
  return null;
}

export function middleware(request: NextRequest) {
  const existing = request.cookies.get(COOKIE_NAME)?.value;

  // If a valid region cookie already exists, skip detection
  if (existing && VALID_REGIONS.has(existing)) {
    return NextResponse.next();
  }

  // 1. Try Vercel's geo header (free on Vercel deployments)
  const vercelCountry = request.headers.get("x-vercel-ip-country");
  let region = countryToRegion(vercelCountry);

  // 2. If Vercel header missing (local dev), try Accept-Language
  if (!vercelCountry) {
    const fromLang = regionFromAcceptLanguage(request.headers.get("accept-language"));
    if (fromLang) region = fromLang;
  }

  // Set the cookie on the response so the client can read it
  const response = NextResponse.next();
  response.cookies.set(COOKIE_NAME, region, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/"],
};
