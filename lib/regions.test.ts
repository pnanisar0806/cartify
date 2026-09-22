import { afterEach, describe, expect, it } from "vitest";
import { REGIONS, REGION_LIST, getRegionConfig, isValidRegion, DEFAULT_REGION } from "./regions";

const AFFILIATE_VARS = [
  "NEXT_PUBLIC_AFFILIATE_TEMPLATE",
  "NEXT_PUBLIC_AFFILIATE_INSTACART",
  "NEXT_PUBLIC_AFFILIATE_WALMART",
  "NEXT_PUBLIC_AFFILIATE_TARGET",
  "NEXT_PUBLIC_AFFILIATE_TESCO",
  "NEXT_PUBLIC_AFFILIATE_SAINSBURYS",
  "NEXT_PUBLIC_AFFILIATE_OCADO",
  "NEXT_PUBLIC_AMAZON_TAG",
  "NEXT_PUBLIC_AMAZON_TAG_IN",
  "NEXT_PUBLIC_AMAZON_TAG_US",
  "NEXT_PUBLIC_AMAZON_TAG_UK",
];

afterEach(() => {
  for (const key of AFFILIATE_VARS) delete process.env[key];
});

function store(region: "IN" | "US" | "UK", id: string) {
  const found = REGIONS[region].stores.find((s) => s.id === id);
  if (!found) throw new Error(`store ${id} missing from ${region}`);
  return found;
}

describe("region registry", () => {
  it("exposes three regions, each with stores", () => {
    expect(REGION_LIST).toHaveLength(3);
    for (const region of REGION_LIST) {
      expect(region.stores.length).toBeGreaterThan(0);
    }
  });

  it("validates region codes", () => {
    expect(isValidRegion("US")).toBe(true);
    expect(isValidRegion("FR")).toBe(false);
    expect(isValidRegion(undefined)).toBe(false);
  });

  it("falls back to the default region for an unknown code", () => {
    expect(getRegionConfig("ZZ" as never).code).toBe(DEFAULT_REGION);
  });

  it("gives every store a unique id within its region", () => {
    for (const region of REGION_LIST) {
      const ids = region.stores.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe("store URLs are well formed", () => {
  it("encodes the search term for every store in every region", () => {
    for (const region of REGION_LIST) {
      for (const s of region.stores) {
        const url = s.getUrl("olive oil & garlic");
        expect(() => new URL(url)).not.toThrow();
        expect(url).not.toContain("olive oil & garlic");
        expect(url).toContain("olive%20oil%20%26%20garlic");
      }
    }
  });
});

describe("stores without an affiliate programme", () => {
  it("sends Swiggy and Blinkit traffic out clean", () => {
    expect(store("IN", "swiggy").getUrl("garlic")).toBe(
      "https://www.swiggy.com/instamart/search?custom_back=true&query=garlic"
    );
    expect(store("IN", "blinkit").getUrl("onion")).toBe("https://blinkit.com/s/?q=onion");
  });

  it("carries no tracking parameter of any kind", () => {
    for (const id of ["swiggy", "blinkit"]) {
      const url = store("IN", id).getUrl("milk");
      expect(url).not.toMatch(/affiliate|tag=|partner|aff_id/i);
    }
  });
});

describe("network-backed stores", () => {
  it("returns a clean URL until a deep link template is configured", () => {
    expect(store("UK", "tesco").getUrl("milk")).toBe(
      "https://www.tesco.com/groceries/en-GB/search?query=milk"
    );
    expect(store("US", "instacart").getUrl("milk")).toBe(
      "https://www.instacart.com/store/search/milk"
    );
  });

  it("routes through the operator's own network deep link once set", () => {
    process.env.NEXT_PUBLIC_AFFILIATE_TESCO =
      "https://www.awin1.com/cread.php?awinmid=1234&awinaffid=5678&ued={URL}";
    const url = store("UK", "tesco").getUrl("milk");
    expect(url).toContain("awin1.com/cread.php");
    expect(url).toContain(
      encodeURIComponent("https://www.tesco.com/groceries/en-GB/search?query=milk")
    );
  });

  it("keeps each retailer on its own template", () => {
    process.env.NEXT_PUBLIC_AFFILIATE_INSTACART = "https://instacart.example/c/1?u={URL}";
    process.env.NEXT_PUBLIC_AFFILIATE_WALMART = "https://walmart.example/c/2?u={URL}";
    expect(store("US", "instacart").getUrl("milk")).toContain("instacart.example");
    expect(store("US", "walmart").getUrl("milk")).toContain("walmart.example");
  });
});

describe("Amazon tags are per region", () => {
  it("appends the matching regional tag", () => {
    process.env.NEXT_PUBLIC_AMAZON_TAG_IN = "cartify-21";
    process.env.NEXT_PUBLIC_AMAZON_TAG_US = "cartify-20";
    process.env.NEXT_PUBLIC_AMAZON_TAG_UK = "cartifyuk-21";

    expect(store("IN", "amazon-fresh-in").getUrl("paneer")).toContain("&tag=cartify-21");
    expect(store("US", "amazon-fresh-us").getUrl("bread")).toContain("&tag=cartify-20");
    expect(store("UK", "amazon-fresh-uk").getUrl("bread")).toContain("&tag=cartifyuk-21");
  });

  it("does not leak an India tag onto amazon.com or amazon.co.uk", () => {
    process.env.NEXT_PUBLIC_AMAZON_TAG_IN = "cartify-21";
    expect(store("US", "amazon-fresh-us").getUrl("bread")).not.toContain("cartify-21");
    expect(store("UK", "amazon-fresh-uk").getUrl("bread")).not.toContain("cartify-21");
  });

  it("still accepts the legacy NEXT_PUBLIC_AMAZON_TAG for India", () => {
    process.env.NEXT_PUBLIC_AMAZON_TAG = "legacy-21";
    expect(store("IN", "amazon-fresh-in").getUrl("paneer")).toContain("&tag=legacy-21");
    expect(store("IN", "amazon-now").getUrl("coffee")).toContain("&tag=legacy-21");
  });
});
