"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShoppingBasket,
  ArrowUpRight,
  Check,
  Sparkles,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Film,
  Globe,
  Download,
  Key,
  ExternalLink,
  Loader2,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSwiggyUrl, getBlinkitUrl, getAmazonFreshUrl } from "@/lib/utils";

interface DemoScript {
  id: string;
  title: string;
  badge: string;
  duration: string;
  targetAudience: string;
  input: string;
  isUrl?: boolean;
  ingredients: string[];
  voiceover: {
    hook: string;
    action: string;
    cta: string;
  };
}

const DEMO_SCRIPTS: DemoScript[] = [
  {
    id: "craving-noodles",
    title: "1. 2 AM Viral Chili Oil Noodles",
    badge: "Craving / Viral Recipe",
    duration: "12s",
    targetAudience: "Late-night snackers, college students, noodle fans",
    input:
      "Viral Chili Oil Noodles: 2 packs ramen noodles, 3 cloves minced garlic, 1 tbsp chili flakes, 2 tbsp soy sauce, 1 tbsp black vinegar, 2 green onions, 2 tbsp hot sesame oil",
    ingredients: [
      "ramen noodles",
      "garlic",
      "chili flakes",
      "soy sauce",
      "black vinegar",
      "green onions",
      "sesame oil",
    ],
    voiceover: {
      hook: "Stop spending 15 minutes searching for 10 different ingredients every time you see a recipe!",
      action: "Just paste your recipe into Cartify and hit convert.",
      cta: "Boom! Instant 1-click shopping links for Swiggy, Blinkit, and Amazon Fresh. Link in bio!",
    },
  },
  {
    id: "gourmet-pasta",
    title: "2. Creamy Tuscan Garlic Chicken",
    badge: "Date Night / Foodie Reel",
    duration: "14s",
    targetAudience: "Couples, food reel watchers, home chefs",
    input:
      "Creamy Tuscan Chicken: 500g chicken breasts, 3 cloves garlic, 1 cup heavy cream, 1/2 cup sun-dried tomatoes, 2 cups baby spinach, 1/2 cup grated parmesan cheese, 1 tbsp olive oil",
    ingredients: [
      "chicken breasts",
      "garlic",
      "heavy cream",
      "sun-dried tomatoes",
      "baby spinach",
      "parmesan cheese",
      "olive oil",
    ],
    voiceover: {
      hook: "Saw a 30-second recipe reel you want to cook tonight? Don't write it on paper.",
      action: "Paste the recipe into Cartify. It separates only the groceries you need.",
      cta: "And gives you direct 1-click delivery carts on Amazon Fresh, Blinkit, and Swiggy!",
    },
  },
  {
    id: "sunday-biryani",
    title: "3. Sunday Dum Biryani Feast",
    badge: "Weekend Special",
    duration: "16s",
    targetAudience: "Families, Biryani lovers, Sunday dinner planners",
    input:
      "Hyderabadi Dum Biryani: 1kg basmati rice, 800g fresh chicken, 1 cup curd, 2 tbsp biryani masala, saffron strands, fresh mint leaves, 4 sliced onions for barista",
    ingredients: [
      "basmati rice",
      "fresh chicken",
      "curd",
      "biryani masala",
      "saffron",
      "mint leaves",
      "onions",
    ],
    voiceover: {
      hook: "Biryani grocery shopping used to be a nightmare of missing spices.",
      action: "Not anymore! Paste your biryani recipe into Cartify.",
      cta: "Get all your fresh ingredients ready for 10-minute delivery on Amazon Fresh, Swiggy, and Blinkit!",
    },
  },
  {
    id: "gym-mealprep",
    title: "4. High-Protein Muscle Prep",
    badge: "Fitness & Gym",
    duration: "13s",
    targetAudience: "Gym-goers, high-protein dieters, meal preppers",
    input:
      "High Protein Power Bowl: 250g organic tofu, 1 cup quinoa, 1 cup edamame, 1 ripe avocado, extra virgin olive oil, 2 tbsp chia seeds",
    ingredients: [
      "tofu",
      "quinoa",
      "edamame",
      "avocado",
      "olive oil",
      "chia seeds",
    ],
    voiceover: {
      hook: "Gym bros: stop wasting your post-workout window manually searching grocery apps.",
      action: "Paste your meal prep macro list straight into Cartify.",
      cta: "Instant grocery delivery buttons for Amazon Fresh and Swiggy Instamart before your workout cools down!",
    },
  },
  {
    id: "url-magic",
    title: "5. The Web Link Magic (URL to Cart)",
    badge: "Auto URL Extractor",
    duration: "15s",
    targetAudience: "Food blog readers, Pinterest users, internet cooks",
    input: "https://tastyrecipes.com/best-paneer-butter-masala",
    isUrl: true,
    ingredients: [
      "paneer",
      "butter",
      "heavy cream",
      "kasuri methi",
      "tomato puree",
      "ginger garlic paste",
      "garam masala",
    ],
    voiceover: {
      hook: "Did you know you don't even have to type ingredients into Cartify anymore?",
      action: "Just paste ANY recipe website link. Cartify visits the site and extracts every ingredient automatically.",
      cta: "Turn any recipe link on the internet into 1-click delivery carts right now at Cartify!",
    },
  },
];

export default function DemoPage() {
  const [selectedScriptIndex, setSelectedScriptIndex] = useState(0);
  const [step, setStep] = useState<"idle" | "hook" | "typing" | "converting" | "results">("idle");
  const [displayText, setDisplayText] = useState("");
  const [currentCaption, setCurrentCaption] = useState("");
  const [copiedScript, setCopiedScript] = useState(false);

  // Google AI Studio Achernar voice state
  const [voiceMode, setVoiceMode] = useState<"achernar" | "browser">("achernar");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [achernarAudioUrl, setAchernarAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Browser voice fallback state
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");

  const currentScript = DEMO_SCRIPTS[selectedScriptIndex];
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved Gemini API key from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("cartify_gemini_key") || "";
      if (savedKey) setGeminiApiKey(savedKey);
    }
  }, []);

  // Save API key when changed
  function handleApiKeyChange(key: string) {
    setGeminiApiKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("cartify_gemini_key", key);
    }
    // Invalidate previously cached audio when key changes
    setAchernarAudioUrl(null);
  }

  // Load browser voices for fallback
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    function populateVoices() {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        const preferred =
          voices.find((v) => v.name.includes("Natural") && v.lang.startsWith("en")) ||
          voices.find((v) => v.name.includes("Google") && v.lang.startsWith("en")) ||
          voices.find((v) => v.lang.startsWith("en-US") || v.lang.startsWith("en-IN") || v.lang.startsWith("en-GB")) ||
          voices[0];
        if (preferred && !selectedVoiceName) {
          setSelectedVoiceName(preferred.name);
        }
      }
    }

    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedVoiceName]);

  // Clean timers and stop audio
  function clearAllTimers() {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  // Fetch Achernar Audio from /api/tts
  async function fetchAchernarAudio(script: DemoScript): Promise<string | null> {
    setAudioError(null);
    setIsGeneratingVoice(true);

    try {
      const fullText = `${script.voiceover.hook} ${script.voiceover.action} ${script.voiceover.cta}`;
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: fullText,
          voiceName: "Achernar",
          apiKey: geminiApiKey,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(
          errJson.error || "Failed to generate Achernar voice. Please verify your Google AI Studio API key."
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAchernarAudioUrl(url);
      return url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error generating voiceover.";
      setAudioError(msg);
      return null;
    } finally {
      setIsGeneratingVoice(false);
    }
  }

  // Speak via browser fallback
  function speakBrowserText(text: string, onEnd?: () => void) {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onEnd) setTimeout(onEnd, 2000);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    const voice = availableVoices.find((v) => v.name === selectedVoiceName);
    if (voice) utterance.voice = voice;

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
  }

  // Start Reel with synchronized Google AI Studio Achernar voice
  async function startReel() {
    clearAllTimers();
    setDisplayText("");
    setStep("hook");
    setCurrentCaption(currentScript.voiceover.hook);

    if (voiceMode === "achernar") {
      let audioUrl = achernarAudioUrl;
      if (!audioUrl) {
        audioUrl = await fetchAchernarAudio(currentScript);
      }

      if (!audioUrl) {
        // If Achernar failed or no key, guide the user and stop
        return;
      }

      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;

      audio.onloadedmetadata = () => {
        const totalDuration = audio.duration || 14;
        const hookEnd = totalDuration * 0.32;
        const typingEnd = totalDuration * 0.72;
        const convertEnd = totalDuration * 0.84;

        audio.ontimeupdate = () => {
          const t = audio.currentTime;

          if (t < hookEnd) {
            setStep("hook");
            setCurrentCaption(currentScript.voiceover.hook);
          } else if (t >= hookEnd && t < typingEnd) {
            setStep("typing");
            setCurrentCaption(currentScript.voiceover.action);

            // Synchronize typed text to action phase
            const typingProgress = (t - hookEnd) / (typingEnd - hookEnd);
            const textToType = currentScript.input;
            const sliceIndex = Math.min(
              textToType.length,
              Math.floor(typingProgress * textToType.length)
            );
            setDisplayText(textToType.slice(0, sliceIndex));
          } else if (t >= typingEnd && t < convertEnd) {
            setStep("converting");
            setDisplayText(currentScript.input);
            setCurrentCaption("Extracting grocery items & finding direct store carts...");
          } else if (t >= convertEnd) {
            setStep("results");
            setCurrentCaption(currentScript.voiceover.cta);
          }
        };

        audio.onended = () => {
          setStep("results");
        };

        audio.play();
      };

      // In case metadata doesn't fire immediately, play directly
      audio.play().catch(() => {});
    } else {
      // Browser Speech Synthesis fallback mode
      speakBrowserText(currentScript.voiceover.hook, () => {
        setStep("typing");
        setCurrentCaption(currentScript.voiceover.action);
        speakBrowserText(currentScript.voiceover.action, () => {
          setStep("converting");
          setCurrentCaption("Extracting ingredients & generating instant carts...");

          stepTimerRef.current = setTimeout(() => {
            setStep("results");
            setCurrentCaption(currentScript.voiceover.cta);
            speakBrowserText(currentScript.voiceover.cta);
          }, 1200);
        });

        const textToType = currentScript.input;
        let i = 0;
        const stepIncrement = currentScript.isUrl ? 2 : 4;
        typingTimerRef.current = setInterval(() => {
          i += stepIncrement;
          if (i <= textToType.length) {
            setDisplayText(textToType.slice(0, i));
          } else {
            setDisplayText(textToType);
            if (typingTimerRef.current) clearInterval(typingTimerRef.current);
          }
        }, 35);
      });
    }
  }

  function reset() {
    clearAllTimers();
    setStep("idle");
    setDisplayText("");
    setCurrentCaption("");
  }

  function copyVoiceoverScript() {
    const fullText = `[HOOK - 0:00 to 0:04]\n${currentScript.voiceover.hook}\n\n[ACTION - 0:04 to 0:09]\n${currentScript.voiceover.action}\n\n[CTA - 0:09 to 0:15]\n${currentScript.voiceover.cta}`;
    navigator.clipboard.writeText(fullText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-slate-950 p-4 font-sans text-slate-100 lg:py-8">
      {/* Studio Banner */}
      <div className="mb-6 flex max-w-4xl flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
          <Film className="h-3.5 w-3.5" /> Cartify 9:16 Viral Reel Studio with Google AI Studio Voice
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl text-white">
          Achernar AI Voiceover & 9:16 Video Studio
        </h1>
        <p className="mt-1 max-w-xl text-xs sm:text-sm text-slate-400">
          Featuring Google AI Studio&apos;s natural <strong>Achernar</strong> voiceover. Exact lip-sync typing, live ingredient extraction, and 1-click Swiggy, Blinkit, and Amazon Fresh shopping carts!
        </p>
      </div>

      <div className="flex w-full max-w-5xl flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
        {/* Phone Mockup Frame (9:16 aspect ratio: 370px x 780px) */}
        <div className="relative flex h-[780px] w-[370px] shrink-0 flex-col overflow-hidden rounded-[44px] border-[5px] border-slate-700/80 bg-[#f6f9f7] shadow-[0_25px_60px_rgba(0,0,0,0.6)] text-slate-900">
          {/* Dynamic Island / Notch */}
          <div className="flex h-11 items-center justify-between px-6 pt-2">
            <span className="text-[11px] font-bold text-slate-500">9:41</span>
            <div className="h-4 w-20 rounded-full bg-slate-900"></div>
            <span className="text-[11px] font-bold text-slate-500">5G</span>
          </div>

          {/* App Header */}
          <div className="flex items-center justify-between border-b border-green-900/10 bg-white px-4 py-2.5">
            <div className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900">
              <ShoppingBasket className="h-5 w-5 text-emerald-700" />
              Cartify<span className="text-emerald-700">.</span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              Instant Groceries
            </span>
          </div>

          {/* Content Area */}
          <div className="flex flex-1 flex-col overflow-y-auto px-4 py-3">
            <div className="mb-3 text-center">
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                {currentScript.isUrl ? "Recipe Link to Grocery Cart" : "Recipe to Grocery Cart"}
              </h2>
              <p className="text-[10px] text-slate-500">
                1-click grocery search on Swiggy, Blinkit & Amazon Fresh
              </p>
            </div>

            {/* Input Box */}
            <div className="rounded-xl border border-green-900/10 bg-white p-3 shadow-xs">
              <div className="mb-1 flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-700">
                  {currentScript.isUrl ? "Recipe Web Link" : "What are you cooking?"}
                </label>
                {currentScript.isUrl && (
                  <span className="flex items-center gap-1 text-[9px] font-medium text-emerald-700">
                    <Globe className="h-2.5 w-2.5" /> Auto-extract
                  </span>
                )}
              </div>

              <div className="h-24 w-full rounded-lg border border-slate-200 bg-[#fbfcfb] p-2.5 text-[11px] leading-4 text-slate-800 overflow-hidden font-mono break-all">
                {step === "idle" || step === "hook" ? (
                  <span className="text-slate-400">
                    {currentScript.isUrl ? "https://..." : "Paste recipe or ingredients..."}
                  </span>
                ) : (
                  <span>
                    {displayText}
                    {step === "typing" && <span className="inline-block w-1.5 h-3 bg-emerald-600 animate-pulse ml-0.5" />}
                  </span>
                )}
              </div>

              <button
                type="button"
                className={`mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white transition-all shadow-xs ${
                  step === "converting"
                    ? "bg-emerald-700 animate-pulse"
                    : "bg-emerald-700 hover:bg-emerald-800"
                }`}
              >
                <Sparkles className="h-3 w-3" />
                {step === "converting" ? "Extracting Groceries..." : "Convert to Shopping Links"}
              </button>
            </div>

            {/* Results */}
            <div className="mt-3 flex-1">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700">Instant Shopping List</span>
                {step === "results" && (
                  <span className="text-[10px] font-medium text-emerald-700">
                    {currentScript.ingredients.length} items ready
                  </span>
                )}
              </div>

              {step !== "results" ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-green-900/20 p-4 text-center text-xs text-slate-400">
                  <ShoppingBasket className="mb-1.5 h-5 w-5 text-slate-300" />
                  <span className="text-[11px]">Store links will appear here</span>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto pb-20 max-h-[360px] pr-0.5">
                  {currentScript.ingredients.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-1.5 rounded-lg border border-green-900/10 bg-white p-2 shadow-xs transition-all hover:border-emerald-200"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-100">
                          <Check className="h-2 w-2 text-emerald-700" />
                        </div>
                        <span className="text-xs font-semibold capitalize text-slate-800">
                          {item}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 pt-0.5">
                        <a
                          href={getSwiggyUrl(item)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-0.5 rounded border border-orange-200 bg-orange-50 px-1 py-1 text-[10px] font-semibold text-orange-900 hover:bg-orange-100"
                        >
                          Swiggy
                          <ArrowUpRight className="h-2.5 w-2.5" />
                        </a>
                        <a
                          href={getBlinkitUrl(item)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-0.5 rounded border border-yellow-200 bg-yellow-50 px-1 py-1 text-[10px] font-semibold text-green-900 hover:bg-yellow-100"
                        >
                          Blinkit
                          <ArrowUpRight className="h-2.5 w-2.5" />
                        </a>
                        <a
                          href={getAmazonFreshUrl(item)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-0.5 rounded border border-emerald-200 bg-emerald-50 px-1 py-1 text-[10px] font-semibold text-emerald-900 hover:bg-emerald-100"
                        >
                          Amazon
                          <ArrowUpRight className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Viral Caption / Subtitle Overlay (TikTok/Reels style) */}
          {currentCaption && (
            <div className="absolute bottom-4 left-3 right-3 z-30 flex flex-col items-center">
              <div className="rounded-2xl border border-white/20 bg-black/90 px-3.5 py-2 text-center shadow-xl backdrop-blur-md">
                <span className="text-[11px] font-extrabold tracking-wide text-yellow-300 drop-shadow">
                  🎙️ {currentCaption}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Studio Controls */}
        <div className="flex w-full max-w-md flex-col gap-5">
          {/* Main Action Bar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
            <h2 className="text-base font-bold text-white mb-3 flex items-center justify-between">
              <span>Reel Studio Controls</span>
              <span className="text-xs text-emerald-400 font-medium">9:16 Ready</span>
            </h2>

            <div className="flex flex-wrap gap-2.5 mb-4">
              <Button
                onClick={startReel}
                disabled={isGeneratingVoice || step === "hook" || step === "typing" || step === "converting"}
                className="flex-1 gap-2 bg-emerald-600 font-semibold hover:bg-emerald-500 text-white"
              >
                {isGeneratingVoice ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Achernar Voice...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    Start Reel ({currentScript.duration})
                  </>
                )}
              </Button>
              <Button onClick={reset} variant="outline" className="gap-1.5 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>

            {/* Voice Provider Switcher */}
            <div className="mb-4 flex rounded-lg border border-slate-800 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => {
                  setVoiceMode("achernar");
                  reset();
                }}
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                  voiceMode === "achernar"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ✨ Achernar (Google AI Studio)
              </button>
              <button
                type="button"
                onClick={() => {
                  setVoiceMode("browser");
                  reset();
                }}
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                  voiceMode === "browser"
                    ? "bg-slate-700 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🔊 Browser TTS (Fallback)
              </button>
            </div>

            {/* Achernar Voice Settings */}
            {voiceMode === "achernar" ? (
              <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-emerald-400" />
                    Google AI Studio: Voice &ldquo;Achernar&rdquo;
                  </span>
                  <span className="rounded bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    Soft / Natural
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-medium text-slate-300 flex items-center gap-1">
                      <Key className="h-3 w-3 text-emerald-400" /> Google AI Studio API Key (Free)
                    </label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      Get Key <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="Paste AIzaSy... key or set GEMINI_API_KEY in .env.local"
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">
                    Keys are stored securely in your local browser only.
                  </p>
                </div>

                {audioError && (
                  <div className="rounded-lg bg-red-950/60 border border-red-800/60 p-2.5 text-[11px] text-red-300 leading-snug">
                    {audioError}
                  </div>
                )}

                {/* Audio Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fetchAchernarAudio(currentScript)}
                    disabled={isGeneratingVoice}
                    className="flex-1 rounded-lg border border-emerald-700/60 bg-emerald-900/30 px-3 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-900/60 transition-all flex items-center justify-center gap-1.5"
                  >
                    {isGeneratingVoice ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5 text-emerald-400" /> Generate / Test Audio
                      </>
                    )}
                  </button>

                  {achernarAudioUrl && (
                    <a
                      href={achernarAudioUrl}
                      download={`cartify-reel-${currentScript.id}-achernar.wav`}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-all flex items-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" /> Download .WAV
                    </a>
                  )}
                </div>
              </div>
            ) : (
              /* Fallback Browser Speech Settings */
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    {voiceEnabled ? <Volume2 className="h-3.5 w-3.5 text-emerald-400" /> : <VolumeX className="h-3.5 w-3.5 text-slate-500" />}
                    Browser TTS Narration
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (voiceEnabled) window.speechSynthesis?.cancel();
                      setVoiceEnabled(!voiceEnabled);
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      voiceEnabled ? "bg-emerald-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        voiceEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {voiceEnabled && (
                  <div className="space-y-2 pt-1 border-t border-slate-800/60">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        Browser Voice
                      </label>
                      <select
                        value={selectedVoiceName}
                        onChange={(e) => setSelectedVoiceName(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                      >
                        {availableVoices
                          .filter((v) => v.lang.startsWith("en"))
                          .map((v, i) => (
                            <option key={i} value={v.name}>
                              {v.name} ({v.lang})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">Speech Speed: {speechRate}x</span>
                      <div className="flex gap-1.5">
                        {[1.0, 1.1, 1.2].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => setSpeechRate(rate)}
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                              speechRate === rate
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5 Video Concept Templates */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Select Viral Reel Concept</h3>
              <span className="text-[10px] rounded-full bg-emerald-950 px-2 py-0.5 text-emerald-400 border border-emerald-800/60">
                5 Scripts
              </span>
            </div>

            <div className="space-y-2">
              {DEMO_SCRIPTS.map((script, idx) => (
                <button
                  key={script.id}
                  type="button"
                  onClick={() => {
                    setSelectedScriptIndex(idx);
                    setAchernarAudioUrl(null);
                    reset();
                  }}
                  className={`w-full text-left rounded-xl p-3 transition-all border ${
                    selectedScriptIndex === idx
                      ? "border-emerald-500 bg-emerald-950/30 text-white shadow-sm"
                      : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">{script.title}</span>
                    <span className="text-[10px] font-semibold text-emerald-400">{script.duration}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">{script.voiceover.hook}</p>
                </button>
              ))}
            </div>

            {/* Voiceover Script Card with 1-Click Copy */}
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">Voiceover Script (Achernar)</span>
                <button
                  type="button"
                  onClick={copyVoiceoverScript}
                  className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  {copiedScript ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copiedScript ? "Copied!" : "Copy Script"}
                </button>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed font-mono">
                <p><span className="text-yellow-400 font-semibold">[0:00]</span> {currentScript.voiceover.hook}</p>
                <p><span className="text-emerald-400 font-semibold">[0:04]</span> {currentScript.voiceover.action}</p>
                <p><span className="text-cyan-400 font-semibold">[0:09]</span> {currentScript.voiceover.cta}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Prefer Google AI Studio directly?</span>
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-emerald-400 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  Open AI Studio Voice Library <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
