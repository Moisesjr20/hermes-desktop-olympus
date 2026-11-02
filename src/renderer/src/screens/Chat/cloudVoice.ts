/**
 * Cloud STT/TTS direto do renderer — destrava voz em modo remoto onde o
 * backend (:8642) não expõe /api/audio/*.
 *
 * Config via localStorage pra zero setup de secret-store nesta onda; keys
 * ficam só no renderer e são enviadas HTTPS direto pros providers.
 *
 * Groq Whisper (STT): ~$0.03/hora de áudio, excelente PT-BR.
 * OpenAI TTS (6 vozes): ~$15/milhão caracteres.
 */

const LS_KEYS = {
  groq: "olympus.voice.groqKey",
  openai: "olympus.voice.openaiKey",
  autoPlay: "olympus.voice.autoPlay",
  voice: "olympus.voice.ttsVoice",
} as const;

export const OPENAI_TTS_VOICES = [
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
export type OpenAiTtsVoice = (typeof OPENAI_TTS_VOICES)[number];
export const DEFAULT_OPENAI_VOICE: OpenAiTtsVoice = "nova";

export interface CloudVoiceSettings {
  groqKey: string;
  openaiKey: string;
  autoPlay: boolean;
  voice: OpenAiTtsVoice;
}

function safeGet(k: string): string {
  try {
    return localStorage.getItem(k) ?? "";
  } catch {
    return "";
  }
}

export function readCloudVoiceSettings(): CloudVoiceSettings {
  const voice = safeGet(LS_KEYS.voice) as OpenAiTtsVoice;
  return {
    groqKey: safeGet(LS_KEYS.groq),
    openaiKey: safeGet(LS_KEYS.openai),
    autoPlay: safeGet(LS_KEYS.autoPlay) === "1",
    voice: OPENAI_TTS_VOICES.includes(voice) ? voice : DEFAULT_OPENAI_VOICE,
  };
}

export function writeCloudVoiceSettings(patch: Partial<CloudVoiceSettings>): void {
  try {
    if (patch.groqKey !== undefined) localStorage.setItem(LS_KEYS.groq, patch.groqKey.trim());
    if (patch.openaiKey !== undefined) localStorage.setItem(LS_KEYS.openai, patch.openaiKey.trim());
    if (patch.autoPlay !== undefined) localStorage.setItem(LS_KEYS.autoPlay, patch.autoPlay ? "1" : "0");
    if (patch.voice !== undefined) localStorage.setItem(LS_KEYS.voice, patch.voice);
  } catch {
    // storage cheio / privado — ignora
  }
}

/**
 * STT via Groq Whisper. Lança se falhar; retorna texto limpo.
 * Groq aceita até ~25MB por chamada, OK pra PTT curto (<10min).
 */
export async function transcribeViaGroq(
  audio: Blob,
  apiKey: string,
  model: string = "whisper-large-v3-turbo",
  language?: string,
): Promise<string> {
  const form = new FormData();
  form.append("file", audio, audio.type.startsWith("audio/") ? "clip.webm" : "clip");
  form.append("model", model);
  form.append("response_format", "text");
  if (language) form.append("language", language);

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Groq STT falhou (${res.status}). ${body.slice(0, 200)}`.trim(),
    );
  }
  // response_format=text → corpo é string pura
  const text = await res.text();
  return text.trim();
}

/**
 * TTS via OpenAI. Retorna Blob audio/mpeg pronto pra tocar.
 */
export async function synthesizeViaOpenAi(
  text: string,
  apiKey: string,
  voice: OpenAiTtsVoice = DEFAULT_OPENAI_VOICE,
  model: string = "gpt-4o-mini-tts",
): Promise<Blob> {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice,
      input: text.slice(0, 4000), // OpenAI limita a 4096 chars/call
      format: "mp3",
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `OpenAI TTS falhou (${res.status}). ${body.slice(0, 200)}`.trim(),
    );
  }
  return await res.blob();
}
