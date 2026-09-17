import { describe, expect, it } from "vitest";
import { getSwiggyUrl, getBlinkitUrl } from "./utils";

describe("Shopping link URL generators", () => {
  it("formats Swiggy Instamart URL with encoded query parameter", () => {
    expect(getSwiggyUrl("bok choy")).toBe("https://www.swiggy.com/instamart/search?custom_back=true&query=bok%20choy");
    expect(getSwiggyUrl("extra-virgin olive oil & garlic")).toBe(
      "https://www.swiggy.com/instamart/search?custom_back=true&query=extra-virgin%20olive%20oil%20%26%20garlic"
    );
  });

  it("formats Blinkit URL with encoded query parameter", () => {
    expect(getBlinkitUrl("bok choy")).toBe("https://blinkit.com/s/?q=bok%20choy");
    expect(getBlinkitUrl("soy sauce / tamari")).toBe(
      "https://blinkit.com/s/?q=soy%20sauce%20%2F%20tamari"
    );
  });
});
