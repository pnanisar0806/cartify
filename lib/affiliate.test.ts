import { afterEach, describe, expect, it } from "vitest";
import { withAmazonTag, withTemplate, unmonetised } from "./affiliate";

const AWIN = "https://www.awin1.com/cread.php?awinmid=1234&awinaffid=5678&ued={URL}";
const TARGET = "https://www.tesco.com/groceries/en-GB/search?query=milk";

afterEach(() => {
  delete process.env.NEXT_PUBLIC_AFFILIATE_TEMPLATE;
});

describe("withTemplate", () => {
  it("returns the direct URL when nothing is configured", () => {
    expect(withTemplate(TARGET)).toBe(TARGET);
    expect(withTemplate(TARGET, undefined)).toBe(TARGET);
    expect(withTemplate(TARGET, "   ")).toBe(TARGET);
  });

  it("substitutes the encoded destination into a network deep link", () => {
    const url = withTemplate(TARGET, AWIN);
    expect(url).toBe(
      "https://www.awin1.com/cread.php?awinmid=1234&awinaffid=5678&ued=" + encodeURIComponent(TARGET)
    );
    expect(url).not.toContain("{URL}");
  });

  it("ignores a template missing the {URL} placeholder, rather than linking somewhere wrong", () => {
    expect(withTemplate(TARGET, "https://www.awin1.com/cread.php?awinaffid=5678")).toBe(TARGET);
  });

  it("falls back to the global template when a store has none of its own", () => {
    process.env.NEXT_PUBLIC_AFFILIATE_TEMPLATE = "https://redirect.example/?u={URL}";
    expect(withTemplate(TARGET)).toBe("https://redirect.example/?u=" + encodeURIComponent(TARGET));
  });

  it("prefers a store's own template over the global one", () => {
    process.env.NEXT_PUBLIC_AFFILIATE_TEMPLATE = "https://redirect.example/?u={URL}";
    expect(withTemplate(TARGET, AWIN)).toContain("awin1.com");
  });
});

describe("withAmazonTag", () => {
  it("appends the tag with & when the URL already has a query string", () => {
    expect(withAmazonTag("https://www.amazon.co.uk/s?k=milk", "cartify-21")).toBe(
      "https://www.amazon.co.uk/s?k=milk&tag=cartify-21"
    );
  });

  it("appends the tag with ? when the URL has no query string", () => {
    expect(withAmazonTag("https://www.amazon.com/dp/B000", "cartify-20")).toBe(
      "https://www.amazon.com/dp/B000?tag=cartify-20"
    );
  });

  it("leaves the URL untouched when no tag is set", () => {
    expect(withAmazonTag("https://www.amazon.com/s?k=milk")).toBe("https://www.amazon.com/s?k=milk");
    expect(withAmazonTag("https://www.amazon.com/s?k=milk", "  ")).toBe("https://www.amazon.com/s?k=milk");
  });

  it("falls back to a configured template when no tag is set", () => {
    process.env.NEXT_PUBLIC_AFFILIATE_TEMPLATE = "https://redirect.example/?u={URL}";
    expect(withAmazonTag("https://www.amazon.com/s?k=milk")).toBe(
      "https://redirect.example/?u=" + encodeURIComponent("https://www.amazon.com/s?k=milk")
    );
  });
});

describe("unmonetised", () => {
  it("leaves the link clean when no global template is configured", () => {
    expect(unmonetised("https://blinkit.com/s/?q=onion")).toBe("https://blinkit.com/s/?q=onion");
  });

  it("still honours a global cashback template if the operator has one", () => {
    process.env.NEXT_PUBLIC_AFFILIATE_TEMPLATE = "https://linksredirect.com/?cid=1&url={URL}";
    expect(unmonetised("https://blinkit.com/s/?q=onion")).toContain("linksredirect.com");
  });
});
