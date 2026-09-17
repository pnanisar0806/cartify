import { NextResponse } from "next/server";
import { pcmToWav } from "../../../lib/pcm-to-wav";

export const dynamic = "force-dynamic";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const voiceName = typeof body.voiceName === "string" && body.voiceName.trim() ? body.voiceName.trim() : "Achernar";
    const userApiKey = typeof body.apiKey === "string" && body.apiKey.trim() ? body.apiKey.trim() : "";
    const apiKey = userApiKey || process.env.GEMINI_API_KEY;

    if (!text) {
      return NextResponse.json({ error: "Text prompt is required for voiceover generation." }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "A Google AI Studio API key is required to stream the Achernar voiceover. Please enter your API key or set GEMINI_API_KEY in .env.local (Get one free at https://aistudio.google.com/app/apikey).",
        },
        { status: 400 }
      );
    }

    // Google AI Studio speech generation models
    // gemini-2.0-flash is retired by Google in favor of gemini-3.6-flash and gemini-2.5-flash
    const userModel = typeof body.model === "string" && body.model.trim() ? body.model.trim() : null;
    const candidateModels = userModel
      ? [userModel, "gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.5-flash-preview-tts"]
      : ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.5-flash-preview-tts"];
    let lastError: string | null = null;
    let audioBuffer: Buffer | null = null;
    let finalMime = "audio/wav";

    for (const rawModel of candidateModels) {
      const model = rawModel.replace(/^models\//, "");
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `Read the following promotional voiceover script clearly, enthusiastically, and naturally with proper pauses. Do not add any greeting, preamble, or commentary. Only speak the exact script:\n\n${text}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voiceName,
                  },
                },
              },
            },
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          lastError = errData?.error?.message || `Model ${model} returned HTTP ${response.status}`;
          continue;
        }

        const data = await response.json();
        const candidate = data?.candidates?.[0];
        const audioPart = candidate?.content?.parts?.find((p: { inlineData?: { data?: string; mimeType?: string } }) => p.inlineData?.data);

        if (!audioPart?.inlineData?.data) {
          lastError = `No audio track returned from ${model}`;
          continue;
        }

        const rawData = Buffer.from(audioPart.inlineData.data, "base64");
        const mimeType = audioPart.inlineData.mimeType || "audio/pcm;rate=24000";

        if (mimeType.includes("pcm")) {
          // Wrap 24kHz raw PCM into valid WAV audio container
          audioBuffer = pcmToWav(rawData, 24000, 1, 16);
          finalMime = "audio/wav";
        } else {
          audioBuffer = rawData;
          finalMime = mimeType;
        }

        // Successfully generated
        break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Request failed";
      }
    }

    if (!audioBuffer) {
      return NextResponse.json(
        { error: lastError || "Unable to generate speech audio with Achernar voice from Google AI Studio." },
        { status: 502 }
      );
    }

    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": finalMime,
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error generating voiceover." },
      { status: 500 }
    );
  }
}
