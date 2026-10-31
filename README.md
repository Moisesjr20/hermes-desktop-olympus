<div align="center">

<img src="build/icon.png" alt="OLYMPUS" width="128" />

# OLYMPUS Desktop

**Painel desktop pra conversar com o seu agente Hermes auto-hospedado — rebranded, assinado, publicado por Kyrius.**

Navy + laranja. Monte Olimpo + raio de Zeus. Zero HERMES ONE em lugar nenhum.

[![Latest release](https://img.shields.io/github/v/release/Moisesjr20/hermes-desktop-olympus?label=release&color=F59E0B&style=for-the-badge)](https://github.com/Moisesjr20/hermes-desktop-olympus/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen?style=for-the-badge)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-44-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://electronjs.org)

</div>

---

## O que é

OLYMPUS Desktop é um **client Electron** pra se conectar em instâncias [hermes-webui](https://github.com/nesquena/hermes-webui) auto-hospedadas. Rebrand completo (visual + strings + ícones + splash animado) do upstream [`fathah/hermes-desktop`](https://github.com/fathah/hermes-desktop) sob a identidade OLYMPUS.

- 🎨 **Logo oficial**: Monte Olimpo + raio de Zeus (navy #0A1628 + laranja #F59E0B)
- 🖥️ **Splash animado 5s** 100% CSS/SVG (nenhum vídeo externo)
- 🌍 **18 locales i18n** limpos — zero menção a "Hermes One"
- 🔒 **Zero CVEs** (`npm audit` limpo)
- ⚙️ **AppId** `com.kyrius.olympus` · **product name** `OLYMPUS`

## Downloads

Baixa o instalador da [última release](https://github.com/Moisesjr20/hermes-desktop-olympus/releases/latest):

| Plataforma | Formato |
|---|---|
| 🪟 Windows | `olympus-desktop-X.Y.Z-setup.exe` (installer) ou `-portable.exe` |
| 🐧 Linux (qualquer distro) | `olympus-desktop-X.Y.Z-x86_64.AppImage` |
| 🐧 Debian/Ubuntu | `olympus-desktop_X.Y.Z_amd64.deb` |
| 🐧 Fedora/RHEL | `olympus-desktop-X.Y.Z.rpm` |
| 🐧 Linux ARM64 | `olympus-desktop-X.Y.Z-arm64.AppImage` |
| 🍎 macOS | Desativado no CI (sem signing Apple). Build local: `npm run build:mac` |

> **Primeira execução no Windows:** SmartScreen pode pedir "Mais informações → Executar assim mesmo". Normal pra binários sem code-signing EV cert.

## Conectar no seu Hermes

1. Abre o app → **Settings** → **Connection**
2. Cola a URL HTTPS da sua instância hermes-webui (ex: `https://meu-server.ts.net`)
3. Cola a senha configurada em `HERMES_WEBUI_PASSWORD`
4. (Opcional) Headers extras pra Cloudflare Access etc

Se ainda não tem um hermes-webui rodando, instala em qualquer VPS com Python 3.14+:
```bash
git clone https://github.com/nesquena/hermes-webui.git
cd hermes-webui
HERMES_WEBUI_PASSWORD=sua_senha python3 bootstrap.py
```

## Build local (dev)

```bash
git clone https://github.com/Moisesjr20/hermes-desktop-olympus.git
cd hermes-desktop-olympus
npm install
npm run dev          # desenvolvimento com hot-reload
npm run build        # build de produção
npm run typecheck    # TypeScript check
npm test             # vitest (~3400 testes)
```

## Attribution

Este projeto é um **fork rebrandeado** sob licença MIT de:

- **Upstream base:** [`fathah/hermes-desktop`](https://github.com/fathah/hermes-desktop) por Fathah (© 2024-2026, MIT)
- **Agent backend:** [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) (Nous Research)
- **WebUI backend:** [`nesquena/hermes-webui`](https://github.com/nesquena/hermes-webui) (nesquena)

Rebrand OLYMPUS (visual, logo, strings, splash, locales, build pipeline) por **Moises Kyrius** sob Kyrius. Changes documentadas em `CHANGELOG.md`. Original README preservado em [`README.upstream.md`](README.upstream.md).

## License

MIT — ver [`LICENSE`](LICENSE). Preserva todos os termos do upstream.

---

<div align="center">

**OLYMPUS** · parte do stack multi-agente da Kyrius
Painel web: [olympus.kyrius.com.br](https://olympus.kyrius.com.br)

</div>
