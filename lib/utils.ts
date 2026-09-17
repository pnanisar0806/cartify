import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Wraps an outbound store URL with an affiliate redirect network (e.g. Cuelinks, EarnKaro, or custom affiliate template).
 * If no affiliate configuration is present in environment variables, returns the clean direct URL.
 */
export function wrapAffiliateUrl(targetUrl: string): string {
  const customTemplate = process.env.NEXT_PUBLIC_AFFILIATE_TEMPLATE;
  if (customTemplate && customTemplate.includes("{URL}")) {
    return customTemplate.replace("{URL}", encodeURIComponent(targetUrl));
  }

  const cuelinksId = process.env.NEXT_PUBLIC_CUELINKS_ID;
  if (cuelinksId) {
    return `https://linksredirect.com/?cid=${encodeURIComponent(cuelinksId)}&url=${encodeURIComponent(targetUrl)}`;
  }

  const earnkaroId = process.env.NEXT_PUBLIC_EARNKARO_ID;
  if (earnkaroId) {
    return `https://earnkaro.com/deal?url=${encodeURIComponent(targetUrl)}&user=${encodeURIComponent(earnkaroId)}`;
  }

  return targetUrl;
}

export function getSwiggyUrl(ingredient: string): string {
  const directUrl = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(ingredient)}`;
  return wrapAffiliateUrl(directUrl);
}

export function getBlinkitUrl(ingredient: string): string {
  const directUrl = `https://blinkit.com/s/?q=${encodeURIComponent(ingredient)}`;
  return wrapAffiliateUrl(directUrl);
}


