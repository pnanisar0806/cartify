/**
 * Region-based store configuration for Cartify.
 * Defines grocery stores, search URLs, affiliate logic, and UI styles per region.
 */

import { withAmazonTag, withTemplate, unmonetised } from "./affiliate";

export type RegionCode = "IN" | "US" | "UK";

export interface StoreConfig {
  id: string;
  name: string;
  /** Component name from store-logos or global-store-logos */
  logoComponent: string;
  getUrl: (ingredient: string) => string;
  buttonStyles: {
    border: string;
    hover: string;
    arrowColor: string;
  };
}

export interface RegionConfig {
  code: RegionCode;
  name: string;
  stores: StoreConfig[];
}

/* ------------------------------------------------------------------ */
/*  India stores                                                       */
/* ------------------------------------------------------------------ */

const indiaStores: StoreConfig[] = [
  {
    id: "swiggy",
    name: "Swiggy Instamart",
    logoComponent: "SwiggyLogo",
    // Swiggy Instamart operates no public affiliate programme. Link stays clean.
    getUrl: (ingredient) =>
      unmonetised(`https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(ingredient)}`),
    buttonStyles: {
      border: "border-orange-200/80",
      hover: "hover:bg-orange-50/80 hover:border-orange-300",
      arrowColor: "text-orange-400",
    },
  },
  {
    id: "blinkit",
    name: "Blinkit",
    logoComponent: "BlinkitLogo",
    // Blinkit operates no public affiliate programme. Link stays clean.
    getUrl: (ingredient) =>
      unmonetised(`https://blinkit.com/s/?q=${encodeURIComponent(ingredient)}`),
    buttonStyles: {
      border: "border-amber-200/80",
      hover: "hover:bg-amber-50/80 hover:border-amber-300",
      arrowColor: "text-green-600",
    },
  },
  {
    id: "amazon-fresh-in",
    name: "Amazon Fresh",
    logoComponent: "AmazonFreshLogo",
    getUrl: (ingredient) =>
      withAmazonTag(
        `https://www.amazon.in/s?k=${encodeURIComponent(ingredient)}&i=nowstore`,
        process.env.NEXT_PUBLIC_AMAZON_TAG_IN || process.env.NEXT_PUBLIC_AMAZON_TAG
      ),
    buttonStyles: {
      border: "border-emerald-200/80",
      hover: "hover:bg-emerald-50/80 hover:border-emerald-300",
      arrowColor: "text-emerald-600",
    },
  },
  {
    id: "amazon-now",
    name: "Amazon Now",
    logoComponent: "AmazonNowLogo",
    getUrl: (ingredient) =>
      withAmazonTag(
        `https://www.amazon.in/tez/browse/search?searchKeyword=${encodeURIComponent(ingredient)}`,
        process.env.NEXT_PUBLIC_AMAZON_TAG_IN || process.env.NEXT_PUBLIC_AMAZON_TAG
      ),
    buttonStyles: {
      border: "border-slate-200",
      hover: "hover:bg-slate-50 hover:border-slate-300",
      arrowColor: "text-orange-500",
    },
  },
];

/* ------------------------------------------------------------------ */
/*  US stores                                                          */
/* ------------------------------------------------------------------ */

const usStores: StoreConfig[] = [
  {
    id: "instacart",
    name: "Instacart",
    logoComponent: "InstacartLogo",
    // Instacart runs through Impact. Paste your Impact deep link as the template.
    getUrl: (ingredient) =>
      withTemplate(
        `https://www.instacart.com/store/search/${encodeURIComponent(ingredient)}`,
        process.env.NEXT_PUBLIC_AFFILIATE_INSTACART
      ),
    buttonStyles: {
      border: "border-green-200/80",
      hover: "hover:bg-green-50/80 hover:border-green-300",
      arrowColor: "text-green-600",
    },
  },
  {
    id: "walmart",
    name: "Walmart Grocery",
    logoComponent: "WalmartLogo",
    // Walmart runs through Impact. Paste your Impact deep link as the template.
    getUrl: (ingredient) =>
      withTemplate(
        `https://www.walmart.com/search?q=${encodeURIComponent(ingredient)}&cat_id=976759`,
        process.env.NEXT_PUBLIC_AFFILIATE_WALMART
      ),
    buttonStyles: {
      border: "border-blue-200/80",
      hover: "hover:bg-blue-50/80 hover:border-blue-300",
      arrowColor: "text-blue-600",
    },
  },
  {
    id: "amazon-fresh-us",
    name: "Amazon Grocery",
    logoComponent: "AmazonFreshUSLogo",
    getUrl: (ingredient) =>
      withAmazonTag(
        `https://www.amazon.com/s?k=${encodeURIComponent(ingredient)}&i=grocery`,
        process.env.NEXT_PUBLIC_AMAZON_TAG_US
      ),
    buttonStyles: {
      border: "border-emerald-200/80",
      hover: "hover:bg-emerald-50/80 hover:border-emerald-300",
      arrowColor: "text-emerald-600",
    },
  },
  {
    id: "target",
    name: "Target (Shipt)",
    logoComponent: "TargetLogo",
    // Target runs through Impact. Paste your Impact deep link as the template.
    getUrl: (ingredient) =>
      withTemplate(
        `https://www.target.com/s?searchTerm=${encodeURIComponent(ingredient)}&category=5xt1a`,
        process.env.NEXT_PUBLIC_AFFILIATE_TARGET
      ),
    buttonStyles: {
      border: "border-red-200/80",
      hover: "hover:bg-red-50/80 hover:border-red-300",
      arrowColor: "text-red-500",
    },
  },
];

/* ------------------------------------------------------------------ */
/*  UK stores                                                          */
/* ------------------------------------------------------------------ */

const ukStores: StoreConfig[] = [
  {
    id: "tesco",
    name: "Tesco",
    logoComponent: "TescoLogo",
    // Tesco runs through Awin. Paste your Awin cread.php deep link as the template.
    getUrl: (ingredient) =>
      withTemplate(
        `https://www.tesco.com/groceries/en-GB/search?query=${encodeURIComponent(ingredient)}`,
        process.env.NEXT_PUBLIC_AFFILIATE_TESCO
      ),
    buttonStyles: {
      border: "border-blue-300/80",
      hover: "hover:bg-blue-50/80 hover:border-blue-400",
      arrowColor: "text-blue-700",
    },
  },
  {
    id: "sainsburys",
    name: "Sainsbury's",
    logoComponent: "SainsburysLogo",
    // Sainsbury's runs through Awin. Paste your Awin deep link as the template.
    getUrl: (ingredient) =>
      withTemplate(
        `https://www.sainsburys.co.uk/gol-ui/SearchResults/${encodeURIComponent(ingredient)}`,
        process.env.NEXT_PUBLIC_AFFILIATE_SAINSBURYS
      ),
    buttonStyles: {
      border: "border-orange-200/80",
      hover: "hover:bg-orange-50/80 hover:border-orange-300",
      arrowColor: "text-orange-600",
    },
  },
  {
    id: "ocado",
    name: "Ocado",
    logoComponent: "OcadoLogo",
    // Ocado runs through Awin. Paste your Awin deep link as the template.
    getUrl: (ingredient) =>
      withTemplate(
        `https://www.ocado.com/search?q=${encodeURIComponent(ingredient)}`,
        process.env.NEXT_PUBLIC_AFFILIATE_OCADO
      ),
    buttonStyles: {
      border: "border-purple-200/80",
      hover: "hover:bg-purple-50/80 hover:border-purple-300",
      arrowColor: "text-purple-600",
    },
  },
  {
    id: "amazon-fresh-uk",
    name: "Amazon Grocery",
    logoComponent: "AmazonFreshUKLogo",
    getUrl: (ingredient) =>
      withAmazonTag(
        `https://www.amazon.co.uk/s?k=${encodeURIComponent(ingredient)}&i=grocery`,
        process.env.NEXT_PUBLIC_AMAZON_TAG_UK
      ),
    buttonStyles: {
      border: "border-emerald-200/80",
      hover: "hover:bg-emerald-50/80 hover:border-emerald-300",
      arrowColor: "text-emerald-600",
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Region registry                                                    */
/* ------------------------------------------------------------------ */

export const REGIONS: Record<RegionCode, RegionConfig> = {
  IN: { code: "IN", name: "India", stores: indiaStores },
  US: { code: "US", name: "United States", stores: usStores },
  UK: { code: "UK", name: "United Kingdom", stores: ukStores },
};

export const REGION_LIST: RegionConfig[] = [REGIONS.IN, REGIONS.US, REGIONS.UK];

export const DEFAULT_REGION: RegionCode = "IN";

export function getRegionConfig(code: RegionCode): RegionConfig {
  return REGIONS[code] ?? REGIONS[DEFAULT_REGION];
}

/** Validates whether a string is a valid RegionCode */
export function isValidRegion(value: string | undefined | null): value is RegionCode {
  return value === "IN" || value === "US" || value === "UK";
}
