# OLYMPUS Desktop — Changelog

Mudanças notáveis desde o fork do upstream `fathah/hermes-desktop`.
Formato segue [Keep a Changelog](https://keepachangelog.com/).

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
