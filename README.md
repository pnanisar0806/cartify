# Cartify

Single-page recipe-to-shopping-links app using Next.js 14 App Router, Tailwind CSS, shadcn/ui-style Button and Textarea components, and OpenRouter through the OpenAI Node SDK. No database.

## Run locally

1. Open a terminal in `D:\Cartify` and run `npm install`.
2. Copy `.env.example` to `.env.local` and replace the placeholder with your OpenRouter API key.
3. Run `npm run dev` and open http://localhost:3000.

The API key stays on the server. Restart the server after changing environment variables. Extraction requires an OpenRouter API key. The free endpoint has rate limits and availability can vary.

## Checks

- `npm run typecheck`
- `npm test`
- `npm run build`

`POST /api/convert` accepts `{ "recipeText": "2 cups chopped bok choy" }` and returns `{ "ingredients": ["bok choy"] }`. The route uses `openrouter/free` through OpenRouter (`https://openrouter.ai/api/v1`), JSON object mode (`response_format: { type: "json_object" }`), in-memory IP rate limiting (max 10 requests per minute returning 429 Too Many Requests), and the exact requested system prompt. Shopping links use `encodeURIComponent` and open in new tabs (`https://www.swiggy.com/instamart/search?custom_back=true&query=[encoded]` and `https://blinkit.com/s/?q=[encoded]`).

## Architecture & Features

1. **API Configuration & Secret Management**: OpenRouter API key stored in `.env.local` as `OPENROUTER_API_KEY`. No BYOK UI. The key is strictly accessed server-side.
2. **Frontend UI (`/app/page.tsx`)**: Minimalist, mobile-first interface with `<textarea>` supporting raw ingredients, full recipes, or recipe website links, submit button ("Convert to Shopping Links") with loading spinner, and responsive results list.
3. **URL Recipe Extraction & SSRF Protection (`/lib/url-extractor.ts`)**: Automatically detects web links, blocks private/internal IPs, fetches the webpage, extracts ingredients via Schema.org `Recipe` JSON-LD (`recipeIngredient`) or fallback HTML parsing.
4. **API Route (`POST /api/convert`)**: Configured with OpenAI Node SDK pointing to OpenRouter (`openrouter/free`), ingredient extraction, robust JSON parsing, and IP rate limiting (10 req/min).
5. **Shopping Links**: Direct search links for Swiggy Instamart and Blinkit with `encodeURIComponent` targeting new tabs (`_blank`).
