import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getClientIp, isRateLimited } from "../../../lib/rate-limiter";
import { extractUrlFromText, fetchRecipeFromUrl } from "../../../lib/url-extractor";

const SYSTEM_PROMPT =
  "You are an ingredient extractor. The user will provide a raw recipe. Your job is to extract only the core grocery ingredients needed. Strip away measurements, prep instructions (like 'chopped' or 'diced'), and adjectives. Return a JSON object with a single key 'ingredients' containing an array of strings. Example: '2 cups of roughly chopped fresh bok choy' becomes 'bok choy'.";

function parseIngredients(rawContent: string | null | undefined): string[] | null {
  if (!rawContent) return null;
  const cleaned = rawContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    let list: unknown[] | null = null;
    if (Array.isArray(parsed)) {
      list = parsed;
    } else if (parsed && typeof parsed === "object") {
      if (Array.isArray(parsed.ingredients)) {
        list = parsed.ingredients;
      } else if (Array.isArray(parsed.items)) {
        list = parsed.items;
      } else {
        const firstArray = Object.values(parsed).find((val) => Array.isArray(val));
        if (firstArray) list = firstArray as unknown[];
      }
    }
    if (!list) return null;
    if (!list.every((item) => typeof item === "string" && item.trim().length > 0)) {
      if (list.length > 0) return null;
    }
    return list as string[];
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too Many Requests: Rate limit of 10 requests per minute exceeded. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
  }

  const rawInput = (body as { recipeText?: unknown } | null)?.recipeText;
  if (typeof rawInput !== "string" || !rawInput.trim()) {
    return NextResponse.json({ error: "Paste a recipe, ingredient list, or recipe URL first." }, { status: 400 });
  }

  if (rawInput.length > 20000) {
    return NextResponse.json({ error: "Please keep your recipe or link under 20,000 characters." }, { status: 400 });
  }

  let recipeText = rawInput;
  const detectedUrl = extractUrlFromText(rawInput);
  if (detectedUrl) {
    try {
      recipeText = await fetchRecipeFromUrl(detectedUrl);
    } catch (urlError: unknown) {
      const msg =
        urlError instanceof Error
          ? urlError.message
          : "Could not fetch recipe from the provided URL. Please check the link or paste the ingredients directly.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "Ingredient extraction is not configured yet. Add the OpenRouter API key on the server." },
      { status: 503 }
    );
  }

  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "openrouter/free",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: recipeText },
      ],
    });

    const content = completion.choices[0]?.message.content;
    const ingredients = parseIngredients(content);
    if (!ingredients) {
      return NextResponse.json({ error: "Could not read the ingredient list. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ ingredients });
  } catch (error) {
    const status = error && typeof error === "object" && "status" in error ? error.status : undefined;
    if (status === 429) {
      return NextResponse.json(
        { error: "Free AI capacity is currently rate-limited. Please wait a minute and try again." },
        { status: 429 }
      );
    }
    if (status === 401 || status === 403) {
      return NextResponse.json(
        { error: "OpenRouter could not authorize this request. Check the server API key and your OpenRouter account settings." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Could not extract ingredients. Please try again shortly." }, { status: 502 });
  }
}

