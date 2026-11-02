import { useEffect, useState } from "react";
import { Mic, Volume2, ExternalLink } from "lucide-react";
import {
  readCloudVoiceSettings,
  writeCloudVoiceSettings,
  OPENAI_TTS_VOICES,
  type OpenAiTtsVoice,
} from "../../screens/Chat/cloudVoice";

/**
 * Settings de voz cloud (Groq STT + OpenAI TTS) — destrava voz em modo remoto
 * onde o backend não expõe /api/audio/*. Keys ficam só no renderer (localStorage).
 */
export default function VoiceCloudPane(): React.JSX.Element {
  const [groqKey, setGroqKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [autoPlay, setAutoPlay] = useState(false);
  const [voice, setVoice] = useState<OpenAiTtsVoice>("nova");
  const [showGroq, setShowGroq] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [saved, setSaved] = useState<"idle" | "ok">("idle");

  useEffect(() => {
    const cfg = readCloudVoiceSettings();
    setGroqKey(cfg.groqKey);
    setOpenaiKey(cfg.openaiKey);
    setAutoPlay(cfg.autoPlay);
    setVoice(cfg.voice);
  }, []);

  const save = (): void => {
    writeCloudVoiceSettings({ groqKey, openaiKey, autoPlay, voice });
    setSaved("ok");
    window.setTimeout(() => setSaved("idle"), 1500);
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}
    >
      <header>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
          Voz Cloud (STT + TTS)
        </h2>
        <p style={{ opacity: 0.7, fontSize: 13, marginTop: 6 }}>
          Preencha as chaves de API pra habilitar entrada por voz (Groq Whisper) e
          leitura das respostas (OpenAI TTS) em{" "}
          <strong>modo remoto</strong>. As chaves ficam só neste computador.
        </p>
      </header>

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: 14,
          border: "1px solid var(--border, #333)",
          borderRadius: 10,
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 600,
          }}
        >
          <Mic size={16} /> Groq API Key — STT (Whisper)
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noreferrer"
            style={{
              marginLeft: "auto",
              fontSize: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              textDecoration: "none",
            }}
          >
            console.groq.com/keys <ExternalLink size={12} />
          </a>
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type={showGroq ? "text" : "password"}
            value={groqKey}
            onChange={(e) => setGroqKey(e.target.value)}
            placeholder="gsk_..."
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid var(--border, #333)",
              background: "transparent",
              color: "inherit",
              fontFamily: "monospace",
              fontSize: 13,
            }}
          />
          <button
            type="button"
            onClick={() => setShowGroq((v) => !v)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid var(--border, #333)",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            {showGroq ? "ocultar" : "mostrar"}
          </button>
        </div>
        <p style={{ fontSize: 12, opacity: 0.6, margin: 0 }}>
          Whisper-large-v3-turbo. Custo: ~$0.03/hora de áudio. Excelente PT-BR.
        </p>
      </section>

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: 14,
          border: "1px solid var(--border, #333)",
          borderRadius: 10,
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 600,
          }}
        >
          <Volume2 size={16} /> OpenAI API Key — TTS
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noreferrer"
            style={{
              marginLeft: "auto",
              fontSize: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              textDecoration: "none",
            }}
          >
            platform.openai.com/api-keys <ExternalLink size={12} />
          </a>
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type={showOpenai ? "text" : "password"}
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid var(--border, #333)",
              background: "transparent",
              color: "inherit",
              fontFamily: "monospace",
              fontSize: 13,
            }}
          />
          <button
            type="button"
            onClick={() => setShowOpenai((v) => !v)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid var(--border, #333)",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            {showOpenai ? "ocultar" : "mostrar"}
          </button>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
          }}
        >
          Voz:
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value as OpenAiTtsVoice)}
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid var(--border, #333)",
              background: "transparent",
              color: "inherit",
            }}
          >
            {OPENAI_TTS_VOICES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
          }}
        >
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={(e) => setAutoPlay(e.target.checked)}
          />
          Tocar automaticamente respostas do agente (auto-play TTS)
        </label>
        <p style={{ fontSize: 12, opacity: 0.6, margin: 0 }}>
          Modelo: gpt-4o-mini-tts. Custo: ~$0.015/1k caracteres. 10 vozes
          disponíveis.
        </p>
      </section>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          onClick={save}
          style={{
            padding: "10px 20px",
            borderRadius: 6,
            border: "none",
            background: "var(--accent, #f59e0b)",
            color: "#0a1628",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Salvar
        </button>
        {saved === "ok" && (
          <span style={{ fontSize: 13, color: "var(--accent, #f59e0b)" }}>
            ✓ Salvo
          </span>
        )}
      </div>

      <aside
        style={{
          fontSize: 12,
          opacity: 0.6,
          borderTop: "1px solid var(--border, #333)",
          paddingTop: 12,
        }}
      >
        <strong>Como funciona:</strong>
        <ul style={{ marginTop: 6, paddingLeft: 20 }}>
          <li>
            Hotkey <code>Ctrl+Shift+V</code> (ou botão mic) grava, Groq
            transcreve, texto cai no composer.
          </li>
          <li>
            Botão 🔊 em cada resposta usa OpenAI TTS quando a key está
            preenchida (fallback: MiniMax backend em modo Local).
          </li>
          <li>
            Auto-play dispara TTS no fim de cada resposta do agente — útil pra
            UX voice-first.
          </li>
        </ul>
      </aside>
    </div>
  );
}
