import { describe, it, expect } from "vitest";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";

const envPath = "D:/Cartify/.env.local";
let apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey && fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("OPENROUTER_API_KEY=")) {
      apiKey = trimmed.replace("OPENROUTER_API_KEY=", "").trim();
      break;
    }
  }
}
console.log("envPath:", envPath, "exists:", fs.existsSync(envPath), "key found:", !!apiKey);

describe.skip("Live Local Server API test", () => {
  it("tests http://localhost:3000/api/convert live conversion speed", async () => {
    const startTime = Date.now();
    const res = await fetch("http://localhost:3000/api/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipeText: "Spicy Garlic Bok Choy: 2 heads of fresh bok choy chopped, 3 cloves minced garlic, 1 tbsp soy sauce, 1 tsp sesame oil, 1 pinch chili flakes",
      }),
    });
    const elapsed = Date.now() - startTime;
    const json = await res.json();
    console.log(`Local server responded in ${elapsed}ms (${(elapsed / 1000).toFixed(1)}s):`, json);
    expect(res.status).toBe(200);
    expect(json.ingredients).toBeDefined();
  }, 30000);
});
