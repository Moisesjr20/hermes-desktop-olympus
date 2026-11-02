import { useEffect, useState } from "react";
import { Mic, Volume2, ExternalLink, Router, RefreshCw } from "lucide-react";
import {
  readCloudVoiceSettings,
  writeCloudVoiceSettings,
  TTS_VOICES,
  OPENROUTER_STT_MODELS,
  OPENROUTER_TTS_MODELS,
  fetchOpenRouterModels,
} from "../../screens/Chat/cloudVoice";

/**
 * Settings de voz cloud via OpenRouter (default) com fallback pra chaves
 * legadas Groq+OpenAI (v0.7.10). Carrega lista dinâmica de modelos quando abre.
 */
export default function VoiceCloudPane(): React.JSX.Element {
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [sttModel, setSttModel] = useState("openai/whisper-large-v3-turbo");
  const [ttsModel, setTtsModel] = useState("openai/gpt-4o-mini-tts");
  const [voice, setVoice] = useState("nova");
  const [autoPlay, setAutoPlay] = useState(false);
  const [showOR, setShowOR] = useState(false);

  const [groqKey, setGroqKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [showGroq, setShowGroq] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);

  const [saved, setSaved] = useState<"idle" | "ok">("idle");

  const [sttModels, setSttModels] = useState<string[]>([
    ...OPENROUTER_STT_MODELS,
  ]);
  const [ttsModels, setTtsModels] = useState<string[]>([
    ...OPENROUTER_TTS_MODELS,
  ]);
  const [loadingModels, setLoadingModels] = useState(false);

  const loadModels = async (): Promise<void> => {
    setLoadingModels(true);
    try {
      const { stt, tts } = await fetchOpenRouterModels();
      if (stt.length > 0) setSttModels(stt);
      if (tts.length > 0) setTtsModels(tts);
    } finally {
      setLoadingModels(false);
    }
  };

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
    void loadModels();
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

  const testKey = async (): Promise<void> => {
    if (!openrouterKey.trim()) {
      alert("Cole a chave OpenRouter primeiro.");
      return;
    }
    try {
      const r = await fetch(
        "https://openrouter.ai/api/v1/key",
        {
          headers: {
            Authorization: "Bearer " + openrouterKey.trim(),
          },
        },
      );
      if (r.ok) {
        const data = (await r.json()) as {
          data?: { limit?: number; usage?: number; label?: string };
        };
        const d = data.data || {};
        const limit = d.limit != null ? "$" + d.limit : "sem limite";
        const used = d.usage != null ? "$" + d.usage.toFixed(4) : "?";
        alert(
          "✓ Key válida\n\nLabel: " +
            (d.label || "(sem label)") +
            "\nLimite: " +
            limit +
            "\nUsado: " +
            used,
        );
      } else {
        const body = await r.text().catch(() => "");
        alert("✗ Key inválida (" + r.status + "): " + body.slice(0, 200));
      }
    } catch (e) {
      alert("Falha de rede: " + (e instanceof Error ? e.message : String(e)));
    }
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
          Uma chave OpenRouter cobre {sttModels.length} modelos STT (incluindo
          NVIDIA Nemotron/Parakeet, Whisper, GPT-4o Transcribe, Chirp, Nova-3) e{" "}
          {ttsModels.length} modelos TTS. As chaves ficam só neste computador.
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
          <Router size={16} /> OpenRouter API Key
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
          <button
            type="button"
            onClick={() => setShowOR((v) => !v)}
            style={toggleBtnStyle}
          >
            {showOR ? "ocultar" : "mostrar"}
          </button>
          <button
            type="button"
            onClick={testKey}
            style={{
              ...toggleBtnStyle,
              borderColor: "var(--accent, #f59e0b)",
            }}
          >
            Testar key
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            opacity: 0.7,
          }}
        >
          <span>
            {loadingModels
              ? "Carregando modelos..."
              : `${sttModels.length} STT + ${ttsModels.length} TTS disponíveis`}
          </span>
          <button
            type="button"
            onClick={loadModels}
            disabled={loadingModels}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
            title="Recarregar lista de modelos do OpenRouter"
          >
            <RefreshCw size={12} /> atualizar
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
          <label
            style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}
          >
            <strong>
              <Mic
                size={12}
                style={{ marginRight: 4, verticalAlign: "middle" }}
              />{" "}
              Modelo STT
            </strong>
            <select
              value={sttModel}
              onChange={(e) => setSttModel(e.target.value)}
              style={{
                padding: "6px 8px",
                borderRadius: 6,
                border: "1px solid var(--border, #333)",
                background: "transparent",
                color: "inherit",
                fontFamily: "monospace",
                fontSize: 12,
              }}
            >
              {sttModels.map((m) => (
                <option
                  key={m}
                  value={m}
                  style={{ background: "var(--card, #0a1628)", color: "inherit" }}
                >
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label
            style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}
          >
            <strong>
              <Volume2
                size={12}
                style={{ marginRight: 4, verticalAlign: "middle" }}
              />{" "}
              Modelo TTS
            </strong>
            <select
              value={ttsModel}
              onChange={(e) => setTtsModel(e.target.value)}
              style={{
                padding: "6px 8px",
                borderRadius: 6,
                border: "1px solid var(--border, #333)",
                background: "transparent",
                color: "inherit",
                fontFamily: "monospace",
                fontSize: 12,
              }}
            >
              {ttsModels.map((m) => (
                <option
                  key={m}
                  value={m}
                  style={{ background: "var(--card, #0a1628)", color: "inherit" }}
                >
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
            onChange={(e) => setVoice(e.target.value)}
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid var(--border, #333)",
              background: "transparent",
              color: "inherit",
            }}
          >
            {TTS_VOICES.map((v) => (
              <option
                key={v}
                value={v}
                style={{ background: "var(--card, #0a1628)", color: "inherit" }}
              >
                {v}
              </option>
            ))}
          </select>
          <span style={{ opacity: 0.5, fontSize: 12 }}>
            (nova/shimmer bons pra PT-BR fem.; onyx masculino. Vozes variam por
            modelo TTS)
          </span>
        </label>

        <label
          style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}
        >
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={(e) => setAutoPlay(e.target.checked)}
          />
          Tocar automaticamente respostas do agente (auto-play TTS — Onda 1c)
        </label>
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
          {showLegacy ? "▼" : "▶"} Fallback: chaves Groq + OpenAI (legacy
          v0.7.10)
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
              retrocompatibilidade.
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
              <button
                type="button"
                onClick={() => setShowGroq((v) => !v)}
                style={toggleBtnStyle}
              >
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
              <button
                type="button"
                onClick={() => setShowOpenai((v) => !v)}
                style={toggleBtnStyle}
              >
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
        <strong>Dicas:</strong>
        <ul style={{ marginTop: 6, paddingLeft: 20 }}>
          <li>
            <strong>NVIDIA Parakeet TDT 0.6b</strong> ou{" "}
            <strong>Nemotron 3.5 ASR Streaming</strong> dão ótimo PT-BR a custo
            baixo.
          </li>
          <li>
            <strong>Deepgram Nova-3</strong> é referência pra latência (ASR em
            tempo real).
          </li>
          <li>
            <strong>Mistral Voxtral Small Transcribe</strong> é bom pra áudios
            longos.
          </li>
          <li>
            TTS: <strong>Mistral Voxtral Mini TTS</strong> e{" "}
            <strong>ElevenLabs Flash v2.5</strong> têm latência &lt; 500ms.
          </li>
          <li>Hotkey PTT: <code>Ctrl+Shift+V</code> em qualquer app.</li>
        </ul>
      </aside>
    </div>
  );
}
