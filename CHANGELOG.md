# OLYMPUS Desktop — Changelog

Mudanças notáveis desde o fork do upstream `fathah/hermes-desktop`.
Formato segue [Keep a Changelog](https://keepachangelog.com/).

## v0.7.11-olympus.0 (2026-11-02) — Onda 1b.2: voz via OpenRouter (uma key só)

Unifica STT + TTS em uma única chave OpenRouter. Users da v0.7.10
(com Groq + OpenAI configurados) continuam funcionando sem mexer em nada.

### Added
- **OpenRouter como provedor cloud default** (`cloudVoice.ts`):
  - STT via `/api/v1/audio/transcriptions` — 6 modelos (`whisper-large-v3-turbo`
    default, `whisper-large-v3`, `whisper-1`, `gpt-4o-mini-transcribe`,
    `gpt-4o-transcribe`, `google/chirp-3`)
  - TTS via `/api/v1/audio/speech` — 3 modelos (`gpt-4o-mini-tts` default,
    `gpt-4o-mini-tts-2025-12-15`, `mistralai/voxtral-mini-tts-2603`)
  - 10 vozes OpenAI compatíveis
  - Headers `HTTP-Referer` + `X-Title` identificam a app no dashboard OpenRouter
- **Settings pane "Voz" redesign**:
  - OpenRouter key em destaque (border laranja), model pickers STT + TTS
  - Seção legacy Groq/OpenAI colapsada (abre só se v0.7.10 settings existir)
  - Dica inline de voz PT-BR (nova/shimmer feminino, onyx masculino)
- **PT language hint** passado automático no STT request (melhora accuracy
  PT-BR em accentos brasileiros)

### Changed
- `useVoiceInput.ts`: precedência de STT agora é OpenRouter → Groq legacy →
  backend. Antes era Groq → backend.
- `speech-playback.ts`: precedência de TTS agora é OpenRouter → OpenAI legacy →
  backend MiniMax. Antes era OpenAI → backend.
- Mensagem de erro remota agora menciona OpenRouter em vez de OpenAI.

### Deprecated
- `transcribeViaGroq`, `synthesizeViaOpenAi`, `OPENAI_TTS_VOICES`,
  `DEFAULT_OPENAI_VOICE`, `OpenAiTtsVoice` — mantidos pra retrocompat, mas
  OpenRouter cobre tudo com uma key.

### Nota
Settings legacy (Groq key + OpenAI key da v0.7.10) continuam salvos e
funcionam como fallback — nada quebra pra quem configurou antes. Se preencher
OpenRouter key, ela tem precedência.

## v0.7.10-olympus.0 (2026-11-02) — Onda 1b: voz cloud (STT + TTS)

Destrava voz em modo remoto (API server :8642 sem endpoints `/api/audio/*`).

### Added
- **STT via Groq Whisper** (cliente-side, modelo `whisper-large-v3-turbo`):
  - `src/renderer/src/screens/Chat/cloudVoice.ts` — helpers `transcribeViaGroq` + `synthesizeViaOpenAi`
  - `useVoiceInput.ts` tenta cloud primeiro se key configurada; fallback backend em caso de erro no final
  - Custo: ~$0.03/hora de áudio, excelente PT-BR
- **TTS via OpenAI** (10 vozes `alloy..shimmer`, modelo `gpt-4o-mini-tts`):
  - `speech-playback.ts` branch cloud quando OpenAI key configurada (precede o backend MiniMax local-only)
  - Custo: ~$0.015/1k caracteres
- **Settings pane "Voz Cloud"** (`VoiceCloudPane.tsx`):
  - Campos pra Groq key + OpenAI key (ambos ocultáveis, salvos em localStorage)
  - Picker de voz OpenAI
  - Toggle "auto-play respostas" (hook de disparo fica pra 1c)
  - Links diretos pra consoles Groq / OpenAI pra pegar as keys

### Changed
- `speech-playback.ts`: mensagem de erro quando TTS tenta rodar em modo remoto sem cloud key agora é humana ("Configure OpenAI key em Settings → Voz Cloud").

### Nota
Auto-playback TTS (toggle do settings) ainda não dispara automaticamente ao fim de resposta — fica pra Onda 1c (precisa instrumentar `useDashboardChatTransport` no evento `stream-complete`). Botão 🔊 em cada bolha já funciona com cloud.

## v0.7.9-olympus.1 (2026-11-02) — Onda 1a: voz hotkey

### Added
- **Push-to-talk global** `Cmd/Ctrl+Shift+V` — toggle do mic de qualquer app, mesmo com janela escondida (bring-to-front + ativa gravação).
  - Preload: `window.hermesAPI.onToggleVoice(callback)` + canal IPC `olympus:toggle-voice`
  - `ChatInput.tsx`: listener chama o mesmo `voice.toggle()` do botão mic
- **Mensagem de erro clara em modo remoto** — antes aparecia "Transcription failed (404)". Agora: "Entrada por voz ainda não funciona neste modo remoto: o API server (:8642) não expõe /api/audio/transcribe. Use o modo Local, ou aguarde a Onda 1b."

### Nota de arquitetura
Infra de voz já existia parcialmente (SpeechButton, useVoiceInput, speech-playback,
minimax-speech) mas acopla modo local. Para destravar voz em modo remoto é
necessário:
  - (1b.i) Fallback cliente-side via Web Speech API nativa
  - (1b.ii) Settings pra Groq/OpenAI API key cloud (STT) + MiniMax key (TTS)
  - (1b.iii) Auto-playback TTS no fim de resposta (toggle em settings)
  - (1b.iv) Visual orb pulsando (thinking-orbs já instalado)
  - (1b.v) Barge-in (interromper TTS enquanto fala)

Essas 5 subondas ficam pra v0.7.10-olympus.0.

## v0.7.9-olympus.0 (2026-11-02) — Onda 0: presença ambiente

### Added
- **Global hotkeys** (`src/main/app/global-shortcuts.ts`):
  - `Cmd/Ctrl+Shift+O` → toggle janela OLYMPUS (abre se escondida, esconde se visível/focada)
  - `Cmd/Ctrl+Shift+N` → mostra janela + nova sessão
- **System tray** (`src/main/app/tray.ts`):
  - Ícone OLYMPUS persistente no tray
  - Click simples → toggle janela
  - Right-click → menu (Mostrar / Nova sessão / Sair)
  - Funciona com janela fechada (app continua residente)
- **Extração de .docx client-side** via `mammoth` — arrasta Word no modo remoto, vira text-file inline
- **Extração de .xlsx client-side** via `xlsx` (SheetJS) — cada sheet vira seção CSV no text-file
- `src/renderer/src/screens/Chat/officeExtract.ts` — util com dynamic import (bundle inicial não cresce)

### Changed
- **Updater (electron-builder.yml):** `publish.owner/repo` apontam para o fork `Moisesjr20/hermes-desktop-olympus` — OTA do fork fica funcional (releases publicadas aqui serão detectadas pelo auto-updater).
- `attachmentUtils.ts`: pipeline de modo remoto agora cobre PDF + DOCX + XLSX antes de bloquear binários.

### Deps
- `+ mammoth ^1.11.0`
- `+ xlsx ^0.18.5`

## v0.7.8-olympus.6 (2026-11-02)

### Added
- **Upload de PDFs no modo remoto** — PDFs textuais (extratos, contratos, docs) são
  extraídos client-side via `pdfjs-dist` e enviados inline como `text-file`.
  Zero config nova, zero mudança no backend.
  - `src/renderer/src/screens/Chat/pdfTextExtract.ts` — util com dynamic import
    (bundle inicial não cresce)
  - `attachmentUtils.ts`: antes de retornar `remote-mode-binary`, tenta extração.
    Sucesso (`charCount > 0`) → vira text-file com header `[PDF extraído client-side …]`.
    Falha / scan só-imagem → cai no erro original.
- Dependência runtime: `pdfjs-dist@^6.5.438` (Mozilla, estável).

## v0.7.8-olympus.5 (2026-11-02)

### Fixed
- **Sidebar "Chats" vazia** quando desktop conecta no API server OpenAI-compatible (:8642).
  `sessionsFromResponse` e `remoteGetSessionMessages` só reconheciam o shape do Dashboard
  (`{sessions:[...]}` / `{messages:[...]}`); agora aceitam também o shape OpenAI
  (`{object:"list",data:[...]}`) via `?? record.data`.
- Teste de regressão `tests/sessions-shape-compat.test.ts` (5 asserts) trava os dois shapes.

## v0.7.8-olympus.4 (2026-11-02)

### Build
- Release build Linux (AppImage + deb + rpm, x64 + arm64) + Windows (NSIS + portable x64).
- Testes de identidade OLYMPUS: 26/26 passam.

## v0.7.8-olympus.3 (2026-10-31)

### Added
- **Splash animado 5s** 100% CSS + SVG inline (SplashScreen.tsx reescrito)
  - 14 agentes-partículas convergindo pro centro
  - Monte Olimpo emergindo
  - Raio de Zeus com flash + wordmark letter-by-letter
  - Zero asset externo (removido `startvid.mp4` 1.8 MB)

### Changed
- 3 SVGs legados substituídos: `title-line.svg`, `hermes-one.svg`, `one-chat.svg`
- Alt text do splash: "Hermes One" → "OLYMPUS"

## v0.7.8-olympus.2 (2026-10-31)

### Changed
- 31 arquivos i18n (todos locales) — "Hermes One" → "OLYMPUS"
- 10 strings UI inline em TypeScript:
  - `main.tsx`: window title fallback
  - `HermesLogo.tsx`: alt text (screen readers)
  - `ChatEmptyState.tsx`: aria-label
  - `transcriptUtils.ts`: speaker name no export
  - `chatMessages.ts`: fallback de error
  - `dashboardGatewayClient.ts`: 4 msgs WebSocket error
  - `commandCatalog.ts`: categoria slash + descrição
  - `desktopCommands.ts`: "Show Hermes version"
  - `ClarifyCard.tsx`: sentinel "let Hermes decide"
- `hermes-icon.svg` substituído por Monte Olimpo + raio
- CI: jobs macOS desativados (`if: false`) até configurar signing Apple

## v0.7.7-olympus (2026-10-31)

### Added
- Logo oficial OLYMPUS (Monte Olimpo + raio de Zeus)
- Ícones nativos em `build/`: `icon.png` (1024), `icon.ico` (multi-res), `icon.icns`
- Assets runtime: `splash.png`, `icon.png`, `iconv2.png`, `resources/icon.png`

### Changed
- 18 locales strings.xml — "Hermex/Hermes" → "OLYMPUS"
- Theme Material3 — paleta navy #0A1628 + laranja #F59E0B
- `electron-builder.yml`: appId `com.kyrius.olympus`, productName `OLYMPUS`
- `package.json`: name `olympus-desktop`

### Preserved
- Bundle identifiers técnicos (preservam assinaturas e compatibilidade)
- Nomes de componentes TypeScript (HermesLogo, HermesAvatar, etc)
- Provider "Hermes Agent" no catálogo de LLMs (identidade real da Nous Research)
- Infra `src/main/*` (preload, dashboard, hermes-agent-compat)

### Security
- 10 vulnerabilidades npm resolvidas:
  - `@vitest/mocker <=4.1.11` path traversal + code injection
  - `vitest 4.1.8 → ^5.0.5`
  - `undici <=6.29.0`, `vite 7.0.0-7.3.6`, `zod <4.6.6`
  - `brace-expansion`, `fast-uri`, `source-map-js` ReDoS
- `npm audit`: **found 0 vulnerabilities**

### Build
- CI workflows: `release.yml`, `beta-release.yml`, `ci.yml`
- Artifacts: Linux (AppImage x64/ARM64, deb, rpm), Windows (setup + portable)
- 3434/3441 testes vitest green

---

Para histórico anterior ao fork, ver [upstream CHANGELOG](https://github.com/fathah/hermes-desktop/blob/main/CHANGELOG.md).
