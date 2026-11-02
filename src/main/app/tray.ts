/**
 * System tray icon — OLYMPUS vive no tray mesmo com janela fechada.
 * Click: toggle da janela principal. Right-click: menu (Mostrar / Nova sessão / Sair).
 */
import {
  app,
  Menu,
  Tray,
  nativeImage,
  type BrowserWindow,
  type NativeImage,
} from "electron";
import { join } from "path";

interface TrayDeps {
  getMainWindow: () => BrowserWindow | null;
  showMainWindow: () => void;
  startNewSession: () => void;
}

let trayInstance: Tray | null = null;

function loadTrayIcon(): NativeImage {
  // Tenta várias localizações; usa o ícone 24x24 ideal pro tray.
  const candidates = [
    join(__dirname, "../../resources/icon.png"),
    join(process.resourcesPath || "", "icon.png"),
  ];
  for (const p of candidates) {
    try {
      const img = nativeImage.createFromPath(p);
      if (!img.isEmpty()) {
        // Redimensiona pro tamanho recomendado por plataforma.
        const size = process.platform === "darwin" ? 18 : 24;
        return img.resize({ width: size, height: size });
      }
    } catch {
      // continua tentando
    }
  }
  // Fallback: ícone vazio pra não crashar
  return nativeImage.createEmpty();
}

export function createTray(deps: TrayDeps): Tray | null {
  if (trayInstance) return trayInstance;

  try {
    const icon = loadTrayIcon();
    trayInstance = new Tray(icon);
    trayInstance.setToolTip("OLYMPUS");

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Mostrar OLYMPUS",
        click: () => deps.showMainWindow(),
      },
      {
        label: "Nova sessão",
        click: () => {
          deps.showMainWindow();
          deps.startNewSession();
        },
      },
      { type: "separator" },
      {
        label: "Sair",
        click: () => {
          app.quit();
        },
      },
    ]);
    trayInstance.setContextMenu(contextMenu);

    // Click simples (não right-click) — toggle da janela
    trayInstance.on("click", () => {
      const win = deps.getMainWindow();
      if (!win) {
        deps.showMainWindow();
        return;
      }
      if (win.isVisible() && !win.isMinimized()) {
        win.hide();
      } else {
        deps.showMainWindow();
      }
    });

    return trayInstance;
  } catch (err) {
    console.error("[TRAY] Falha ao criar system tray:", err);
    return null;
  }
}

export function destroyTray(): void {
  if (trayInstance) {
    trayInstance.destroy();
    trayInstance = null;
  }
}
