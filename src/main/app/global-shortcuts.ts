/**
 * Global shortcuts (teclas de atalho que funcionam mesmo com o app em background).
 *
 * - Cmd/Ctrl+Shift+O → toggle da janela OLYMPUS (abre se escondida, esconde se visível).
 *                      Escolhemos Shift+O pra não conflitar com Cmd/Ctrl+Space (Spotlight / IME).
 * - Cmd/Ctrl+Shift+N → mostra janela + envia IPC pra criar nova sessão.
 *
 * Hotkeys são opcionais: se o registro falhar (outro app já reservou), apenas loga.
 */
import { app, globalShortcut, type BrowserWindow } from "electron";

interface ShortcutDeps {
  getMainWindow: () => BrowserWindow | null;
  showMainWindow: () => void;
  startNewSession: () => void;
}

const TOGGLE_WINDOW = process.platform === "darwin"
  ? "Cmd+Shift+O"
  : "Ctrl+Shift+O";

const NEW_SESSION = process.platform === "darwin"
  ? "Cmd+Shift+N"
  : "Ctrl+Shift+N";

export function registerGlobalShortcuts(deps: ShortcutDeps): void {
  const toggleOk = globalShortcut.register(TOGGLE_WINDOW, () => {
    const win = deps.getMainWindow();
    if (!win) {
      deps.showMainWindow();
      return;
    }
    if (win.isVisible() && !win.isMinimized() && win.isFocused()) {
      win.hide();
    } else {
      deps.showMainWindow();
    }
  });

  if (!toggleOk) {
    console.warn(`[SHORTCUT] Não registrou ${TOGGLE_WINDOW} (outro app reservou).`);
  }

  const newOk = globalShortcut.register(NEW_SESSION, () => {
    deps.showMainWindow();
    deps.startNewSession();
  });

  if (!newOk) {
    console.warn(`[SHORTCUT] Não registrou ${NEW_SESSION} (outro app reservou).`);
  }

  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
  });
}
