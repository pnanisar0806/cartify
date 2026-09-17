import { describe, expect, it } from "vitest";
import { extractRecipeFromHtml, extractUrlFromText, isPublicUrl } from "./url-extractor";

describe("URL Extractor & SSRF Guard", () => {
  it("detects valid http/https URLs from input text", () => {
    expect(extractUrlFromText("https://allrecipes.com/recipe/123/pasta")).toBe(
      "https://allrecipes.com/recipe/123/pasta"
    );
    expect(extractUrlFromText("Cook this tonight: http://myrecipes.com/soup")).toBe(
      "http://myrecipes.com/soup"
    );
    expect(extractUrlFromText("2 cups flour, 1 egg, 1 cup milk")).toBeNull();
    expect(extractUrlFromText("ftp://ftp.example.com/file")).toBeNull();
  });

  it("blocks private/internal IP addresses and localhost (SSRF protection)", () => {
    expect(isPublicUrl("http://localhost:3000")).toBe(false);
    expect(isPublicUrl("http://127.0.0.1:8000")).toBe(false);
    expect(isPublicUrl("http://0.0.0.0:3000")).toBe(false);
    expect(isPublicUrl("http://192.168.1.1/secret")).toBe(false);
    expect(isPublicUrl("http://10.0.0.5/admin")).toBe(false);
    expect(isPublicUrl("http://169.254.169.254/latest/meta-data")).toBe(false);
    expect(isPublicUrl("https://www.allrecipes.com/recipe/123")).toBe(true);
    expect(isPublicUrl("https://cooking.nytimes.com/recipes/456")).toBe(true);
  });

  it("extracts ingredients from JSON-LD Schema.org Recipe", () => {
    const htmlWithJsonLd = `
      <!DOCTYPE html>
      <html>
        <head>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Garlic Bok Choy",
              "recipeIngredient": [
                "2 heads fresh bok choy",
                "3 cloves garlic",
                "1 tbsp soy sauce"
              ]
            }
          </script>
        </head>
        <body>
          <h1>Garlic Bok Choy</h1>
        </body>
      </html>
    `;

    const extracted = extractRecipeFromHtml(htmlWithJsonLd);
    expect(extracted).toContain("2 heads fresh bok choy");
    expect(extracted).toContain("3 cloves garlic");
    expect(extracted).toContain("1 tbsp soy sauce");
  });

  it("extracts ingredients from JSON-LD with @graph hierarchy", () => {
    const htmlWithGraph = `
      <html>
        <head>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@graph": [
                { "@type": "WebSite", "name": "CookingBlog" },
                {
                  "@type": "Recipe",
                  "recipeIngredient": ["400g tofu", "2 tbsp sesame oil"]
                }
              ]
            }
          </script>
        </head>
      </html>
    `;

    const extracted = extractRecipeFromHtml(htmlWithGraph);
    expect(extracted).toContain("400g tofu");
    expect(extracted).toContain("2 tbsp sesame oil");
  });

  it("falls back to cleaned HTML text when JSON-LD is absent", () => {
    const htmlNoJsonLd = `
      <html>
        <head><style>.ad { color: red; }</style></head>
        <body>
          <header><nav>Home | About</nav></header>
          <main>
            <h1>Simple Pasta</h1>
            <p>Ingredients: 200g spaghetti, 2 cloves garlic, olive oil.</p>
          </main>
          <footer>Copyright 2026</footer>
        </body>
      </html>
    `;

    const extracted = extractRecipeFromHtml(htmlNoJsonLd);
    expect(extracted).toContain("Simple Pasta");
    expect(extracted).toContain("200g spaghetti");
    expect(extracted).not.toContain(".ad { color: red; }");
    expect(extracted).not.toContain("Copyright 2026");
  });
});
