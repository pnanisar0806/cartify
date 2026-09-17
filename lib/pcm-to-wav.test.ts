import { describe, expect, it } from "vitest";
import { pcmToWav } from "./pcm-to-wav";

describe("pcmToWav converter", () => {
  it("prepends standard 44-byte WAV header to raw PCM buffer", () => {
    const rawPcm = Buffer.alloc(100, 0x12);
    const wav = pcmToWav(rawPcm, 24000, 1, 16);

    expect(wav.length).toBe(144);
    expect(wav.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(wav.readUInt32LE(4)).toBe(36 + 100);
    expect(wav.subarray(8, 12).toString("ascii")).toBe("WAVE");
    expect(wav.subarray(12, 16).toString("ascii")).toBe("fmt ");
    expect(wav.readUInt32LE(16)).toBe(16); // PCM header size
    expect(wav.readUInt16LE(20)).toBe(1); // Linear PCM format
    expect(wav.readUInt16LE(22)).toBe(1); // Mono channel
    expect(wav.readUInt32LE(24)).toBe(24000); // 24kHz sample rate
    expect(wav.readUInt32LE(28)).toBe(48000); // Byte rate
    expect(wav.readUInt16LE(32)).toBe(2); // Block align
    expect(wav.readUInt16LE(34)).toBe(16); // 16 bits per sample
    expect(wav.subarray(36, 40).toString("ascii")).toBe("data");
    expect(wav.readUInt32LE(40)).toBe(100);
    expect(wav.subarray(44)).toEqual(rawPcm);
  });
});
