import { useEffect, useState } from "react";
import { Mic, Volume2, ExternalLink, Router } from "lucide-react";
import {
  readCloudVoiceSettings,
  writeCloudVoiceSettings,
  TTS_VOICES,
  OPENROUTER_STT_MODELS,
  OPENROUTER_TTS_MODELS,
  type TtsVoice,
  type OpenRouterSttModel,
  type OpenRouterTtsModel,
} from "../../screens/Chat/cloudVoice";

/**
 * Settings de voz cloud via OpenRouter (default) com fallback pra chaves
 * legadas Groq+OpenAI (v0.7.10). Keys ficam só no renderer (localStorage).
 */
export default function VoiceCloudPane(): React.JSX.Element {
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [sttModel, setSttModel] = useState<OpenRouterSttModel>(
    "openai/whisper-large-v3-turbo",
  );
  const [ttsModel, setTtsModel] = useState<OpenRouterTtsModel>(
    "openai/gpt-4o-mini-tts",
  );
  const [voice, setVoice] = useState<TtsVoice>("nova");
  const [autoPlay, setAutoPlay] = useState(false);
  const [showOR, setShowOR] = useState(false);

  const [groqKey, setGroqKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [showGroq, setShowGroq] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);

  const [saved, setSaved] = useState<"idle" | "ok">("idle");

  useEffect(() => {
    const cfg = readCloudVoiceSettings();
    setOpenrouterKey(cfg.openrouterKey);
    setSttModel(cfg.sttModel);
    setTtsModel(cfg.ttsModel);
    setVoice(cfg.voice);
    setAutoPlay(cfg.autoPlay);
    setGroqKey(cfg.groqKey);
    setOpenaiKey(cfg.openaiKey);
    if (cfg.groqKey || cfg.openaiKey) setShowLegacy(true);
  }, []);

  const save = (): void => {
    writeCloudVoiceSettings({
      openrouterKey,
      sttModel,
      ttsModel,
      voice,
      autoPlay,
      groqKey,
      openaiKey,
    });
    setSaved("ok");
    window.setTimeout(() => setSaved("idle"), 1500);
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid var(--border, #333)",
    background: "transparent",
    color: "inherit",
    fontFamily: "monospace",
    fontSize: 13,
  };

  const toggleBtnStyle: React.CSSProperties = {
    padding: "6px 12px",
    borderRadius: 6,
    border: "1px solid var(--border, #333)",
    background: "transparent",
    color: "inherit",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxWidth: 760,
      }}
    >
      <header>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
          Voz Cloud (STT + TTS)
        </h2>
        <p style={{ opacity: 0.7, fontSize: 13, marginTop: 6 }}>
          Uma chave OpenRouter cobre entrada por voz (Whisper, GPT-4o
          Transcribe, Chirp 3) e leitura das respostas (OpenAI TTS, Mistral
          Voxtral, Gemini TTS). Billing centralizado, zero markup. As chaves
          ficam só neste computador.
        </p>
      </header>

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 14,
          border: "1px solid var(--accent, #f59e0b)",
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
          <Router size={16} /> OpenRouter API Key (recomendado — uma só pra STT + TTS)
          <a
            href="https://openrouter.ai/keys"
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
            openrouter.ai/keys <ExternalLink size={12} />
          </a>
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type={showOR ? "text" : "password"}
            value={openrouterKey}
            onChange={(e) => setOpenrouterKey(e.target.value)}
            placeholder="sk-or-v1-..."
            style={inputStyle}
          />
          <button type="button" onClick={() => setShowOR((v) => !v)} style={toggleBtnStyle}>
            {showOR ? "ocultar" : "mostrar"}
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 4,
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
            <strong>
              <Mic size={12} style={{ marginRight: 4, verticalAlign: "middle" }} /> Modelo STT
            </strong>
            <select
              value={sttModel}
              onChange={(e) => setSttModel(e.target.value as OpenRouterSttModel)}
              style={{
                padding: "6px 8px",
                borderRadius: 6,
                border: "1px solid var(--border, #333)",
                background: "transparent",
                color: "inherit",
              }}
            >
              {OPENROUTER_STT_MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
            <strong>
              <Volume2 size={12} style={{ marginRight: 4, verticalAlign: "middle" }} /> Modelo TTS
            </strong>
            <select
              value={ttsModel}
              onChange={(e) => setTtsModel(e.target.value as OpenRouterTtsModel)}
              style={{
                padding: "6px 8px",
                borderRadius: 6,
                border: "1px solid var(--border, #333)",
                background: "transparent",
                color: "inherit",
              }}
            >
              {OPENROUTER_TTS_MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            marginTop: 2,
          }}
        >
          Voz:
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value as TtsVoice)}
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid var(--border, #333)",
              background: "transparent",
              color: "inherit",
            }}
          >
            {TTS_VOICES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <span style={{ opacity: 0.5, fontSize: 12 }}>
            (nova/shimmer são boas pra PT-BR feminino; onyx pra masculino grave)
          </span>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={(e) => setAutoPlay(e.target.checked)}
          />
          Tocar automaticamente respostas do agente (auto-play TTS)
        </label>

        <p style={{ fontSize: 12, opacity: 0.6, margin: 0 }}>
          Custo típico OpenRouter: STT ~$0.0001/sec (Whisper turbo), TTS ~$0.015/1k chars.
        </p>
      </section>

      <section>
        <button
          type="button"
          onClick={() => setShowLegacy((v) => !v)}
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            fontSize: 12,
            opacity: 0.7,
            cursor: "pointer",
            padding: 0,
          }}
        >
          {showLegacy ? "▼" : "▶"} Fallback: chaves Groq + OpenAI (legacy v0.7.10)
        </button>
        {showLegacy && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: 14,
              marginTop: 8,
              border: "1px dashed var(--border, #333)",
              borderRadius: 10,
            }}
          >
            <p style={{ fontSize: 12, opacity: 0.6, margin: 0 }}>
              Usadas só se OpenRouter key estiver vazia. Mantidas pra
              retrocompatibilidade — recomendamos migrar pra OpenRouter.
            </p>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Groq (STT)</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type={showGroq ? "text" : "password"}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                style={inputStyle}
              />
              <button type="button" onClick={() => setShowGroq((v) => !v)} style={toggleBtnStyle}>
                {showGroq ? "ocultar" : "mostrar"}
              </button>
            </div>
            <label style={{ fontWeight: 600, fontSize: 13, marginTop: 6 }}>
              OpenAI (TTS)
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type={showOpenai ? "text" : "password"}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                style={inputStyle}
              />
              <button type="button" onClick={() => setShowOpenai((v) => !v)} style={toggleBtnStyle}>
                {showOpenai ? "ocultar" : "mostrar"}
              </button>
            </div>
          </div>
        )}
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
          <span style={{ fontSize: 13, color: "var(--accent, #f59e0b)" }}>✓ Salvo</span>
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
            Hotkey <code>Ctrl+Shift+V</code> (ou botão mic) grava, OpenRouter
            transcreve com o modelo escolhido, texto cai no composer.
          </li>
          <li>
            Botão 🔊 em cada resposta usa OpenRouter TTS com voz escolhida
            (fallback: OpenAI direto → MiniMax backend em modo Local).
          </li>
          <li>
            Com OpenRouter configurado, você pode trocar entre Whisper
            (barato/rápido), GPT-4o Transcribe (melhor accuracy) e Chirp 3
            (Google) sem mexer em código.
          </li>
        </ul>
      </aside>
    </div>
  );
}
