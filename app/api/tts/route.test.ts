import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";

describe("/api/tts endpoint", () => {
  const originalEnv = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalEnv) process.env.GEMINI_API_KEY = originalEnv;
    else delete process.env.GEMINI_API_KEY;
  });

  it("returns 400 if text is missing or empty", async () => {
    const req = new Request("http://localhost/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "   " }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Text prompt is required");
  });

  it("returns 400 if no Google AI Studio API key is provided", async () => {
    const req = new Request("http://localhost/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Hello world" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Google AI Studio API key is required");
  });

  it("calls Gemini API with voiceName Achernar and returns audio/wav on success", async () => {
    process.env.GEMINI_API_KEY = "test_key_123";

    const mockPcm = Buffer.alloc(200, 0x01).toString("base64");
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "audio/pcm;rate=24000",
                    data: mockPcm,
                  },
                },
              ],
            },
          },
        ],
      }),
    });

    globalThis.fetch = mockFetch as unknown as typeof fetch;

    const req = new Request("http://localhost/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Stop spending 15 minutes searching for ingredients!",
        voiceName: "Achernar",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("audio/wav");

    const arrayBuf = await res.arrayBuffer();
    expect(arrayBuf.byteLength).toBe(44 + 200); // 44-byte WAV header + 200 bytes PCM

    // Verify correct Gemini payload
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain("key=test_key_123");
    const calledBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(calledBody.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName).toBe("Achernar");
  });
});
