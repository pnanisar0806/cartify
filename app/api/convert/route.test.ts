import { beforeEach, describe, expect, it, vi } from "vitest";

const { create, configure } = vi.hoisted(() => ({ create: vi.fn(), configure: vi.fn() }));
vi.mock("openai", () => ({ default: class { constructor(options: unknown) { configure(options); } chat = { completions: { create } }; } }));
import { POST } from "./route";
import { resetRateLimit } from "../../../lib/rate-limiter";

const request = (body: unknown, headers?: HeadersInit) =>
  new Request("http://localhost/api/convert", { method: "POST", body: JSON.stringify(body), headers });

beforeEach(() => {
  vi.stubEnv("OPENROUTER_API_KEY", "test-key");
  create.mockReset();
  configure.mockReset();
  resetRateLimit();
});

describe("POST /api/convert", () => {
  it.each([null, {}, { recipeText: 12 }, { recipeText: "   " }])("rejects invalid input %j without calling OpenAI", async body => {
    expect((await POST(request(body))).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
  it("rejects malformed JSON and oversized recipes", async () => {
    expect((await POST(new Request("http://localhost/api/convert", { method: "POST", body: "{" }))).status).toBe(400);
    expect((await POST(request({ recipeText: "a".repeat(20001) }))).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
  it("reports a missing API key", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    expect((await POST(request({ recipeText: "bok choy" }))).status).toBe(503);
  });
  it("uses the exact prompt, model and JSON mode and returns extracted ingredients", async () => {
    create.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ ingredients: ["bok choy", "soy sauce", "chicken breast"] }) } }] });
    const response = await POST(request({ recipeText: "2 cups of roughly chopped fresh bok choy" }));
    expect(response.status).toBe(200);
    expect(configure).toHaveBeenCalledWith(expect.objectContaining({ apiKey: "test-key", baseURL: "https://openrouter.ai/api/v1" }));
    expect(await response.json()).toEqual({ ingredients: ["bok choy", "soy sauce", "chicken breast"] });
    expect(create).toHaveBeenCalledWith({
      model: "openrouter/free",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are an ingredient extractor. The user will provide a raw recipe. Your job is to extract only the core grocery ingredients needed. Strip away measurements, prep instructions (like 'chopped' or 'diced'), and adjectives. Return a JSON object with a single key 'ingredients' containing an array of strings. Example: '2 cups of roughly chopped fresh bok choy' becomes 'bok choy'." },
        { role: "user", content: "2 cups of roughly chopped fresh bok choy" },
      ],
    });
  });
  it.each(["not json", '{"ingredients":[12]}', '{"ingredients":[""]}', '{}'])("rejects unusable model output %s", async content => {
    create.mockResolvedValue({ choices: [{ message: { content } }] });
    expect((await POST(request({ recipeText: "recipe" }))).status).toBe(502);
  });
  it("accepts an empty ingredient list", async () => {
    create.mockResolvedValue({ choices: [{ message: { content: '{"ingredients":[]}' } }] });
    expect(await (await POST(request({ recipeText: "No ingredients" }))).json()).toEqual({ ingredients: [] });
  });
  it("does not expose upstream errors", async () => {
    create.mockRejectedValue(new Error("secret upstream detail"));
    const response = await POST(request({ recipeText: "recipe" }));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("secret upstream detail");
  });
  it("explains rate limits when upstream rate limit is encountered", async () => {
    create.mockRejectedValue({ status: 429, message: "private provider details" });
    const response = await POST(request({ recipeText: "recipe" }));
    expect(response.status).toBe(429);
    expect((await response.json()).error).toContain("rate-limited");
  });
  it.each([401, 403])("explains account authorization errors (%s)", async status => {
    create.mockRejectedValue({ status });
    const response = await POST(request({ recipeText: "recipe" }));
    expect(response.status).toBe(503);
    expect((await response.json()).error).toContain("account settings");
  });
  it("enforces in-memory rate limiting at 10 requests per minute per IP", async () => {
    create.mockResolvedValue({ choices: [{ message: { content: '{"ingredients":["salt"]}' } }] });
    const testIp = "192.168.1.100";
    const headers = { "x-forwarded-for": testIp };

    // Send 10 successful requests
    for (let i = 0; i < 10; i++) {
      const res = await POST(request({ recipeText: "salt" }, headers));
      expect(res.status).toBe(200);
    }
    expect(create).toHaveBeenCalledTimes(10);

    // 11th request from the same IP must be rate limited with 429
    const limitedRes = await POST(request({ recipeText: "salt" }, headers));
    expect(limitedRes.status).toBe(429);
    expect((await limitedRes.json()).error).toContain("Rate limit");
    // Should not call OpenAI when rate limited
    expect(create).toHaveBeenCalledTimes(10);

    // A different IP address should still succeed
    const differentIpRes = await POST(request({ recipeText: "salt" }, { "x-forwarded-for": "192.168.1.101" }));
    expect(differentIpRes.status).toBe(200);
    expect(create).toHaveBeenCalledTimes(11);
  });

  it("fetches and extracts ingredients when user provides a recipe website URL", async () => {
    const mockHtml = `
      <html>
        <head>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "recipeIngredient": ["2 cups chopped kale", "1 lemon juiced", "olive oil"]
            }
          </script>
        </head>
      </html>
    `;

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/html" }),
      text: async () => mockHtml,
    } as unknown as Response);

    create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ ingredients: ["kale", "lemon", "olive oil"] }) } }],
    });

    try {
      const res = await POST(request({ recipeText: "https://www.example.com/recipes/kale-salad" }));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ingredients).toEqual(["kale", "lemon", "olive oil"]);
      expect(create).toHaveBeenCalled();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("rejects unreachable or invalid recipe URLs with a clear 400 error", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers({ "content-type": "text/html" }),
      text: async () => "Not Found",
    } as unknown as Response);

    try {
      const res = await POST(request({ recipeText: "https://www.example.com/non-existent-recipe" }));
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Could not access webpage");
    } finally {
      global.fetch = originalFetch;
    }
  });
});
