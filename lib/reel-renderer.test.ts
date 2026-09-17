import { describe, expect, it } from "vitest";
import { wrapText, drawRoundRect, renderReelFrame } from "./reel-renderer";

describe("reel-renderer", () => {
  it("wraps text correctly according to width", () => {
    const mockCtx = {
      measureText: (text: string) => ({ width: text.length * 10 }),
    } as unknown as CanvasRenderingContext2D;

    const lines = wrapText(mockCtx, "Hello world this is a test recipe text", 120);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join(" ")).toBe("Hello world this is a test recipe text");
  });

  it("draws round rect without errors", () => {
    const mockCalls: string[] = [];
    const mockCtx = {
      beginPath: () => mockCalls.push("beginPath"),
      moveTo: () => mockCalls.push("moveTo"),
      lineTo: () => mockCalls.push("lineTo"),
      quadraticCurveTo: () => mockCalls.push("quadraticCurveTo"),
      closePath: () => mockCalls.push("closePath"),
      fill: () => mockCalls.push("fill"),
      stroke: () => mockCalls.push("stroke"),
    } as unknown as CanvasRenderingContext2D;

    drawRoundRect(mockCtx, 10, 10, 100, 50, 10, true, true);
    expect(mockCalls).toContain("beginPath");
    expect(mockCalls).toContain("fill");
    expect(mockCalls).toContain("stroke");
  });

  it("renders a full frame in idle and results states", () => {
    const mockCtx = {
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      closePath: () => {},
      fill: () => {},
      stroke: () => {},
      fillText: () => {},
      measureText: (t: string) => ({ width: t.length * 8 }),
      arc: () => {},
      setLineDash: () => {},
    } as unknown as CanvasRenderingContext2D;

    expect(() =>
      renderReelFrame(mockCtx, {
        width: 720,
        height: 1280,
        step: "results",
        title: "Test Recipe",
        input: "Noodles, garlic, soy sauce",
        displayText: "Noodles, garlic, soy sauce",
        ingredients: ["Noodles", "Garlic", "Soy Sauce"],
        caption: "Boom! Instant 1-click carts",
      })
    ).not.toThrow();
  });
});
