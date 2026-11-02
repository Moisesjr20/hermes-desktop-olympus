/**
 * Cloud STT/TTS — unificado via OpenRouter (/api/v1/audio/*).
 *
 * Uma única key cobre STT (Whisper/GPT-4o Transcribe/Chirp 3) + TTS
 * (OpenAI/Mistral/Gemini). Billing centralizado, zero markup, mesmas
 * rotas da OpenAI oficial pra portabilidade.
 *
 * Fallback: se `openrouterKey` vazio mas `groqKey`/`openaiKey` preenchidos
 * (users que vieram da v0.7.10), continua funcionando com as APIs antigas.
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

export const OPENROUTER_STT_MODELS = [
  "openai/whisper-large-v3-turbo",
  "openai/whisper-large-v3",
  "openai/whisper-1",
  "openai/gpt-4o-mini-transcribe",
  "openai/gpt-4o-transcribe",
  "google/chirp-3",
] as const;
export type OpenRouterSttModel = (typeof OPENROUTER_STT_MODELS)[number];
export const DEFAULT_STT_MODEL: OpenRouterSttModel =
  "openai/whisper-large-v3-turbo";

export const OPENROUTER_TTS_MODELS = [
  "openai/gpt-4o-mini-tts",
  "openai/gpt-4o-mini-tts-2025-12-15",
  "mistralai/voxtral-mini-tts-2603",
] as const;
export type OpenRouterTtsModel = (typeof OPENROUTER_TTS_MODELS)[number];
export const DEFAULT_TTS_MODEL: OpenRouterTtsModel = "openai/gpt-4o-mini-tts";

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
export type TtsVoice = (typeof TTS_VOICES)[number];
export const DEFAULT_VOICE: TtsVoice = "nova";

export interface CloudVoiceSettings {
  openrouterKey: string;
  sttModel: OpenRouterSttModel;
  ttsModel: OpenRouterTtsModel;
  groqKey: string;
  openaiKey: string;
  autoPlay: boolean;
  voice: TtsVoice;
}

function safeGet(k: string): string {
  try {
    return localStorage.getItem(k) ?? "";
  } catch {
    return "";
  }
}

export function readCloudVoiceSettings(): CloudVoiceSettings {
  const stt = safeGet(LS_KEYS.sttModel) as OpenRouterSttModel;
  const tts = safeGet(LS_KEYS.ttsModel) as OpenRouterTtsModel;
  const voice = safeGet(LS_KEYS.voice) as TtsVoice;
  return {
    openrouterKey: safeGet(LS_KEYS.openrouter),
    sttModel: OPENROUTER_STT_MODELS.includes(stt) ? stt : DEFAULT_STT_MODEL,
    ttsModel: OPENROUTER_TTS_MODELS.includes(tts) ? tts : DEFAULT_TTS_MODEL,
    groqKey: safeGet(LS_KEYS.groq),
    openaiKey: safeGet(LS_KEYS.openai),
    autoPlay: safeGet(LS_KEYS.autoPlay) === "1",
    voice: TTS_VOICES.includes(voice) ? voice : DEFAULT_VOICE,
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

export async function transcribeViaOpenRouter(
  audio: Blob,
  apiKey: string,
  model: OpenRouterSttModel = DEFAULT_STT_MODEL,
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
      "OpenRouter STT falhou (" + res.status + "). " + body.slice(0, 200),
    );
  }
  const data = (await res.json().catch(() => null)) as { text?: string } | null;
  return (data?.text || "").trim();
}

export async function synthesizeViaOpenRouter(
  text: string,
  apiKey: string,
  voice: TtsVoice = DEFAULT_VOICE,
  model: OpenRouterTtsModel = DEFAULT_TTS_MODEL,
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
      "OpenRouter TTS falhou (" + res.status + "). " + body.slice(0, 200),
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
      "Groq STT falhou (" + res.status + "). " + body.slice(0, 200),
    );
  }
  return (await res.text()).trim();
}

/** @deprecated preferir OpenRouter. */
export async function synthesizeViaOpenAi(
  text: string,
  apiKey: string,
  voice: TtsVoice = DEFAULT_VOICE,
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
      "OpenAI TTS falhou (" + res.status + "). " + body.slice(0, 200),
    );
  }
  return await res.blob();
}

/* ---- Legacy exports pra compat de código ---- */
/** @deprecated Use TTS_VOICES. */
export const OPENAI_TTS_VOICES = TTS_VOICES;
/** @deprecated Use TtsVoice. */
export type OpenAiTtsVoice = TtsVoice;
/** @deprecated Use DEFAULT_VOICE. */
export const DEFAULT_OPENAI_VOICE: TtsVoice = DEFAULT_VOICE;
