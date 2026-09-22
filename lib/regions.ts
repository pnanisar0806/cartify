/**
 * Region-based store configuration for Cartify.
 * Defines grocery stores, search URLs, affiliate logic, and UI styles per region.
 */

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
  flag: string;
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
    getUrl: (ingredient) =>
      `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(ingredient)}`,
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
    getUrl: (ingredient) =>
      `https://blinkit.com/s/?q=${encodeURIComponent(ingredient)}`,
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
    getUrl: (ingredient) => {
      const base = `https://www.amazon.in/s?k=${encodeURIComponent(ingredient)}&i=nowstore`;
      const tag = process.env.NEXT_PUBLIC_AMAZON_TAG;
      return tag?.trim() ? `${base}&tag=${encodeURIComponent(tag.trim())}` : base;
    },
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
    getUrl: (ingredient) => {
      const base = `https://www.amazon.in/tez/browse/search?searchKeyword=${encodeURIComponent(ingredient)}`;
      const tag = process.env.NEXT_PUBLIC_AMAZON_TAG;
      return tag?.trim() ? `${base}&tag=${encodeURIComponent(tag.trim())}` : base;
    },
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
    getUrl: (ingredient) => {
      const base = `https://www.instacart.com/store/search/${encodeURIComponent(ingredient)}`;
      const affId = process.env.NEXT_PUBLIC_INSTACART_AFFILIATE_ID;
      return affId?.trim() ? `${base}?affiliate_id=${encodeURIComponent(affId.trim())}` : base;
    },
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
    getUrl: (ingredient) => {
      const base = `https://www.walmart.com/search?q=${encodeURIComponent(ingredient)}&cat_id=976759`;
      const impactId = process.env.NEXT_PUBLIC_WALMART_IMPACT_ID;
      return impactId?.trim() ? `${base}&wmlspartner=${encodeURIComponent(impactId.trim())}` : base;
    },
    buttonStyles: {
      border: "border-blue-200/80",
      hover: "hover:bg-blue-50/80 hover:border-blue-300",
      arrowColor: "text-blue-600",
    },
  },
  {
    id: "amazon-fresh-us",
    name: "Amazon Fresh",
    logoComponent: "AmazonFreshUSLogo",
    getUrl: (ingredient) => {
      const base = `https://www.amazon.com/s?k=${encodeURIComponent(ingredient)}&i=amazonfresh`;
      const tag = process.env.NEXT_PUBLIC_AMAZON_TAG_US;
      return tag?.trim() ? `${base}&tag=${encodeURIComponent(tag.trim())}` : base;
    },
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
    getUrl: (ingredient) =>
      `https://www.target.com/s?searchTerm=${encodeURIComponent(ingredient)}&category=5xt1a`,
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
    getUrl: (ingredient) => {
      const base = `https://www.tesco.com/groceries/en-GB/search?query=${encodeURIComponent(ingredient)}`;
      const affId = process.env.NEXT_PUBLIC_TESCO_AFFILIATE_ID;
      return affId?.trim() ? `${base}&affiliate=${encodeURIComponent(affId.trim())}` : base;
    },
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
    getUrl: (ingredient) =>
      `https://www.sainsburys.co.uk/gol-ui/SearchResults/${encodeURIComponent(ingredient)}`,
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
    getUrl: (ingredient) => {
      const base = `https://www.ocado.com/search?entry=${encodeURIComponent(ingredient)}`;
      const affId = process.env.NEXT_PUBLIC_OCADO_AFFILIATE_ID;
      return affId?.trim() ? `${base}&affiliate=${encodeURIComponent(affId.trim())}` : base;
    },
    buttonStyles: {
      border: "border-purple-200/80",
      hover: "hover:bg-purple-50/80 hover:border-purple-300",
      arrowColor: "text-purple-600",
    },
  },
  {
    id: "amazon-fresh-uk",
    name: "Amazon Fresh",
    logoComponent: "AmazonFreshUKLogo",
    getUrl: (ingredient) => {
      const base = `https://www.amazon.co.uk/s?k=${encodeURIComponent(ingredient)}&i=amazonfresh`;
      const tag = process.env.NEXT_PUBLIC_AMAZON_TAG_UK;
      return tag?.trim() ? `${base}&tag=${encodeURIComponent(tag.trim())}` : base;
    },
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
  IN: { code: "IN", name: "India", flag: "🇮🇳", stores: indiaStores },
  US: { code: "US", name: "United States", flag: "🇺🇸", stores: usStores },
  UK: { code: "UK", name: "United Kingdom", flag: "🇬🇧", stores: ukStores },
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
