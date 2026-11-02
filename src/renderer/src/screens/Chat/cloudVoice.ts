/**
 * Cloud STT/TTS — unificado via OpenRouter (/api/v1/audio/*).
 *
 * - 29 STT models + 38 TTS models suportados (lista fallback expandida)
 * - Lista dinâmica carregada via /api/v1/models em runtime (TTL 5min)
 * - Fallback: legacy Groq/OpenAI direto (users v0.7.10) se OpenRouter vazio
 */

const LS_KEYS = {
  openrouter: "olympus.voice.openrouterKey",
  sttModel: "olympus.voice.sttModel",
  ttsModel: "olympus.voice.ttsModel",
  groq: "olympus.voice.groqKey",
  openai: "olympus.voice.openaiKey",
  autoPlay: "olympus.voice.autoPlay",
  voice: "olympus.voice.ttsVoice",
} as const;

/**
 * Fallback hardcoded — snapshot de 2026-11-02 dos modelos OpenRouter.
 * A UI tenta carregar a lista dinâmica; se falhar, usa estes.
 */
export const OPENROUTER_STT_MODELS = [
  // NVIDIA (open-weight)
  "nvidia/nemotron-3.5-transcribe",
  "nvidia/nemotron-3.5-asr-streaming-multilingual-0.6b",
  "nvidia/parakeet-tdt-0.6b-v3",
  // OpenAI
  "openai/whisper-large-v3-turbo",
  "openai/whisper-large-v3",
  "openai/whisper-1",
  "openai/gpt-4o-mini-transcribe",
  "openai/gpt-4o-transcribe",
  "openai/gpt-transcribe",
  // Google
  "google/chirp-3",
  "google/gemini-3.5-transcribe",
  // Mistral
  "mistralai/voxtral-small-transcribe-3-0",
  "mistralai/voxtral-mini-transcribe-3-0",
  "mistralai/voxtral-mini-transcribe",
  "mistralai/voxtral-small-24b-2507-stt",
  "mistralai/voxtral-mini-3b-2507",
  // ElevenLabs
  "elevenlabs/scribe-v2",
  "elevenlabs/scribe-v2-medical",
  // AssemblyAI
  "assemblyai/universal-3-6-pro",
  "assemblyai/universal-3-5-pro",
  // Deepgram
  "deepgram/nova-3",
  // Microsoft
  "microsoft/mai-transcribe-2",
  "microsoft/mai-transcribe-1.5",
  // Qwen
  "qwen/qwen3-asr-1.7b",
  "qwen/qwen3-asr-0.6b",
  // xAI
  "x-ai/grok-stt-1.0",
  // Fish Audio
  "fish-audio/transcribe-1-pro",
  "fish-audio/transcribe-1",
  // Meta
  "meta/muse-voice-transcribe-1.0",
] as const;
export type OpenRouterSttModel = string;
export const DEFAULT_STT_MODEL = "openai/whisper-large-v3-turbo";

export const OPENROUTER_TTS_MODELS = [
  // OpenAI
  "openai/gpt-4o-mini-tts",
  "openai/gpt-4o-mini-tts-2025-12-15",
  // Mistral
  "mistralai/voxtral-mini-tts-2603",
  "mistralai/voxtral-mini-tts-3-0",
  // ElevenLabs
  "elevenlabs/eleven-v4",
  "elevenlabs/eleven-v4-turbo",
  "elevenlabs/eleven-v3",
  "elevenlabs/eleven-v3-conversational",
  "elevenlabs/eleven-flash-v2.5",
  "elevenlabs/eleven-turbo-v2.5",
  "elevenlabs/eleven-multilingual-v2",
  "elevenlabs/eleven-turbo-v2",
  "elevenlabs/eleven-flash-v2",
  // Google
  "google/gemini-3.8-flash-tts",
  "google/gemini-3.8-flash-lite-tts",
  "google/gemini-3.1-flash-tts-preview",
  // Microsoft
  "microsoft/mai-voice-2.1",
  "microsoft/mai-voice-2.1-flash",
  "microsoft/mai-voice-2",
  "microsoft/mai-voice-2-flash",
  // Deepgram
  "deepgram/aura-2",
  "deepgram/flux-tts",
  // MiniMax
  "minimax/speech-2.8-hd",
  "minimax/speech-2.8-turbo",
  // Fish Audio
  "fish-audio/drama-3",
  "fish-audio/s1",
  "fish-audio/s2-pro",
  "fish-audio/s2.1-pro",
  "fish-audio/s2.1-pro-free:free",
  // HeyGen
  "heygen/heygen-voice-1",
  "heygen/heygen-voice-1-turbo",
  "heygen/heygen-voice-1-turbo:free",
  // Qwen
  "qwen/qwen-audio-3.0-tts-plus",
  "qwen/qwen-audio-3.0-tts-flash",
  // xAI
  "x-ai/grok-voice-tts-1.0",
  // Outros
  "assemblyai/assemblyai-tts-1",
  "bytedance-seed/seed-audio-1-0",
  "canopylabs/orpheus-3b-0.1-ft",
  "sesame/csm-1b",
  "hexgrad/kokoro-82m",
] as const;
export type OpenRouterTtsModel = string;
export const DEFAULT_TTS_MODEL = "openai/gpt-4o-mini-tts";

export const TTS_VOICES = [
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "nova",
  "onyx",
  "sage",
  "shimmer",
] as const;
export type TtsVoice = string;
export const DEFAULT_VOICE: TtsVoice = "nova";

export interface CloudVoiceSettings {
  openrouterKey: string;
  sttModel: string;
  ttsModel: string;
  groqKey: string;
  openaiKey: string;
  autoPlay: boolean;
  voice: string;
}

function safeGet(k: string): string {
  try {
    return localStorage.getItem(k) ?? "";
  } catch {
    return "";
  }
}

export function readCloudVoiceSettings(): CloudVoiceSettings {
  return {
    openrouterKey: safeGet(LS_KEYS.openrouter),
    sttModel: safeGet(LS_KEYS.sttModel) || DEFAULT_STT_MODEL,
    ttsModel: safeGet(LS_KEYS.ttsModel) || DEFAULT_TTS_MODEL,
    groqKey: safeGet(LS_KEYS.groq),
    openaiKey: safeGet(LS_KEYS.openai),
    autoPlay: safeGet(LS_KEYS.autoPlay) === "1",
    voice: safeGet(LS_KEYS.voice) || DEFAULT_VOICE,
  };
}

export function writeCloudVoiceSettings(
  patch: Partial<CloudVoiceSettings>,
): void {
  try {
    if (patch.openrouterKey !== undefined)
      localStorage.setItem(LS_KEYS.openrouter, patch.openrouterKey.trim());
    if (patch.sttModel !== undefined)
      localStorage.setItem(LS_KEYS.sttModel, patch.sttModel);
    if (patch.ttsModel !== undefined)
      localStorage.setItem(LS_KEYS.ttsModel, patch.ttsModel);
    if (patch.groqKey !== undefined)
      localStorage.setItem(LS_KEYS.groq, patch.groqKey.trim());
    if (patch.openaiKey !== undefined)
      localStorage.setItem(LS_KEYS.openai, patch.openaiKey.trim());
    if (patch.autoPlay !== undefined)
      localStorage.setItem(LS_KEYS.autoPlay, patch.autoPlay ? "1" : "0");
    if (patch.voice !== undefined)
      localStorage.setItem(LS_KEYS.voice, patch.voice);
  } catch {
    /* storage cheio/privado */
  }
}

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

function openrouterHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: "Bearer " + apiKey,
    "HTTP-Referer": "https://github.com/Moisesjr20/hermes-desktop-olympus",
    "X-Title": "OLYMPUS Desktop",
  };
}

/**
 * Carrega lista dinâmica de modelos OpenRouter (cached 5min).
 * Fallback = lista hardcoded.
 */
interface ModelsCache {
  stt: string[];
  tts: string[];
  at: number;
}
let modelsCache: ModelsCache | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function fetchOpenRouterModels(): Promise<{
  stt: string[];
  tts: string[];
}> {
  if (modelsCache && Date.now() - modelsCache.at < CACHE_TTL_MS) {
    return { stt: modelsCache.stt, tts: modelsCache.tts };
  }
  try {
    const [sttRes, ttsRes] = await Promise.all([
      fetch(OPENROUTER_BASE + "/models?output_modalities=transcription"),
      fetch(OPENROUTER_BASE + "/models?output_modalities=speech"),
    ]);
    if (!sttRes.ok || !ttsRes.ok) throw new Error("models API");
    const sttJson = (await sttRes.json()) as { data?: Array<{ id?: string }> };
    const ttsJson = (await ttsRes.json()) as { data?: Array<{ id?: string }> };
    const stt = (sttJson.data || [])
      .map((m) => m.id || "")
      .filter(Boolean)
      .sort();
    const tts = (ttsJson.data || [])
      .map((m) => m.id || "")
      .filter(Boolean)
      .sort();
    modelsCache = { stt, tts, at: Date.now() };
    return { stt, tts };
  } catch {
    return {
      stt: [...OPENROUTER_STT_MODELS],
      tts: [...OPENROUTER_TTS_MODELS],
    };
  }
}

export async function transcribeViaOpenRouter(
  audio: Blob,
  apiKey: string,
  model: string = DEFAULT_STT_MODEL,
  language?: string,
): Promise<string> {
  const form = new FormData();
  const filename = audio.type.includes("webm")
    ? "clip.webm"
    : audio.type.includes("wav")
      ? "clip.wav"
      : "clip.mp3";
  form.append("file", audio, filename);
  form.append("model", model);
  if (language) form.append("language", language);

  const res = await fetch(OPENROUTER_BASE + "/audio/transcriptions", {
    method: "POST",
    headers: openrouterHeaders(apiKey),
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      "OpenRouter STT (" + model + ") falhou (" + res.status + "): " +
        body.slice(0, 300),
    );
  }
  const data = (await res.json().catch(() => null)) as { text?: string } | null;
  return (data?.text || "").trim();
}

export async function synthesizeViaOpenRouter(
  text: string,
  apiKey: string,
  voice: string = DEFAULT_VOICE,
  model: string = DEFAULT_TTS_MODEL,
): Promise<Blob> {
  const res = await fetch(OPENROUTER_BASE + "/audio/speech", {
    method: "POST",
    headers: {
      ...openrouterHeaders(apiKey),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: text.slice(0, 4000),
      voice,
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      "OpenRouter TTS (" + model + ") falhou (" + res.status + "): " +
        body.slice(0, 300),
    );
  }
  return await res.blob();
}

/* ---- Legacy fallback (v0.7.10 users) ---- */

/** @deprecated preferir OpenRouter. */
export async function transcribeViaGroq(
  audio: Blob,
  apiKey: string,
  model: string = "whisper-large-v3-turbo",
  language?: string,
): Promise<string> {
  const form = new FormData();
  form.append(
    "file",
    audio,
    audio.type.startsWith("audio/") ? "clip.webm" : "clip",
  );
  form.append("model", model);
  form.append("response_format", "text");
  if (language) form.append("language", language);
  const res = await fetch(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    { method: "POST", headers: { Authorization: "Bearer " + apiKey }, body: form },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      "Groq STT falhou (" + res.status + "): " + body.slice(0, 300),
    );
  }
  return (await res.text()).trim();
}

/** @deprecated preferir OpenRouter. */
export async function synthesizeViaOpenAi(
  text: string,
  apiKey: string,
  voice: string = DEFAULT_VOICE,
  model: string = "gpt-4o-mini-tts",
): Promise<Blob> {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice,
      input: text.slice(0, 4000),
      format: "mp3",
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      "OpenAI TTS falhou (" + res.status + "): " + body.slice(0, 300),
    );
  }
  return await res.blob();
}

/* ---- Legacy exports pra compat ---- */
/** @deprecated Use TTS_VOICES. */
export const OPENAI_TTS_VOICES = TTS_VOICES;
/** @deprecated Use TtsVoice. */
export type OpenAiTtsVoice = string;
/** @deprecated Use DEFAULT_VOICE. */
export const DEFAULT_OPENAI_VOICE: string = DEFAULT_VOICE;
