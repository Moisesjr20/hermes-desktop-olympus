/**
 * Testes de identidade do brand OLYMPUS pós-rename.
 *
 * Garantem que:
 *   - package.json / electron-builder.yml têm as identidades OLYMPUS corretas
 *   - index.html tem o title correto
 *   - CSS main.css define as variáveis --olympus-*
 *   - APP_NAME em start.ts e register.ts é OLYMPUS
 *   - i18n locales não contêm mais "Hermes One" nas strings visíveis
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");

function read(rel: string): string {
  return readFileSync(resolve(ROOT, rel), "utf-8");
}

describe("OLYMPUS brand identity", () => {
  describe("package.json", () => {
    it("has olympus-desktop as package name", () => {
      const pkg = JSON.parse(read("package.json"));
      expect(pkg.name).toBe("olympus-desktop");
    });

    it("mentions OLYMPUS in description", () => {
      const pkg = JSON.parse(read("package.json"));
      expect(pkg.description).toMatch(/OLYMPUS/);
    });
  });

  describe("electron-builder.yml", () => {
    const yml = read("electron-builder.yml");
    it("uses com.kyrius.olympus appId", () => {
      expect(yml).toMatch(/appId:\s*com\.kyrius\.olympus/);
    });
    it("uses OLYMPUS as productName", () => {
      expect(yml).toMatch(/productName:\s*OLYMPUS/);
    });
  });

  describe("renderer index.html", () => {
    it("has OLYMPUS title", () => {
      const html = read("src/renderer/index.html");
      expect(html).toMatch(/<title>OLYMPUS<\/title>/);
    });
  });

  describe("main process APP_NAME", () => {
    it("start.ts defaults to OLYMPUS", () => {
      const src = read("src/main/app/start.ts");
      expect(src).toMatch(/APP_NAME\s*=\s*[^;]+\|\|\s*"OLYMPUS"/);
    });
    it("ipc/register.ts defaults to OLYMPUS", () => {
      const src = read("src/main/ipc/register.ts");
      expect(src).toMatch(/APP_NAME\s*=\s*[^;]+\|\|\s*"OLYMPUS"/);
    });
  });

  describe("design system CSS", () => {
    const css = read("src/renderer/src/assets/main.css");
    it("declares --olympus-navy-900 brand token", () => {
      expect(css).toMatch(/--olympus-navy-900:\s*#0a1628/);
    });
    it("declares --olympus-orange brand token", () => {
      expect(css).toMatch(/--olympus-orange:\s*#f59e0b/);
    });
    it("declares --olympus-display font family", () => {
      expect(css).toMatch(/--olympus-display:\s*"Orbitron"/);
    });
    it("binds dark theme accent to olympus-orange", () => {
      expect(css).toMatch(/accent:\s*var\(--olympus-orange\)/);
    });
    it("imports Orbitron from Google Fonts", () => {
      expect(css).toMatch(/fonts\.googleapis\.com[^"]*Orbitron/);
    });
    it("provides .olympus-glass utility class", () => {
      expect(css).toMatch(/\.olympus-glass\s*\{/);
    });
    it("provides .olympus-cta utility class", () => {
      expect(css).toMatch(/\.olympus-cta/);
    });
  });

  describe("i18n locales visible strings", () => {
    const locales = [
      "en", "pt-BR", "pt-PT", "es", "ar", "he", "id", "ja",
      "pl", "tr", "zh-CN", "zh-TW",
    ];
    for (const loc of locales) {
      it(`${loc}: desktopTitle references OLYMPUS not Hermes One`, () => {
        const src = read(`src/shared/i18n/locales/${loc}/settings.ts`);
        // Pode haver tradução — mas "Hermes One" ou "Hermes One Desktop"
        // literal não deve aparecer (foi todo substituído).
        expect(src).not.toMatch(/Hermes One Desktop/);
        expect(src).not.toMatch(/"Hermes One"/);
        expect(src).not.toMatch(/'Hermes One'/);
      });
    }
  });
});
