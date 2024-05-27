import { app, protocol, BrowserWindow, shell } from "electron";
import * as remoteMain from "@electron/remote/main";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import contextMenu from "electron-context-menu";
import windowStateKeeper from "electron-window-state";
import path from "path";
import registerIpc from "@/libraries/ipc";
import BeatsaverLinkOpener from "@/libraries/ipc/BeatsaverLinkOpener";

remoteMain.initialize();

class Background {
  private win: BrowserWindow | null = null;

  private isDevelopment: boolean = process.env.NODE_ENV !== "production";

  public Initiate() {
    Background.Setup();
    this.SetUpOnReady();
    this.ForceSingleInstance();
    this.OnDevMode();
  }

  private static Setup(): void {
    protocol.registerSchemesAsPrivileged([
      { scheme: "app", privileges: { secure: true, standard: true } },
    ]);

    // app.allowRendererProcessReuse = false;
  }

  private async InitiateWindow(): Promise<void> {
    const windowState = windowStateKeeper({
      defaultWidth: 1280,
      defaultHeight: 800,
    });

    this.win = new BrowserWindow({
      x: windowState.x,
      y: windowState.y,
      width: windowState.width,
      height: windowState.height,
      minWidth: 1000,
      minHeight: 750,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION === "true",
        contextIsolation: false,
      },
      icon: path.join(__dirname, "../public/icon_bold_64.png"),
      backgroundColor: "#303030",
    });

    windowState.manage(this.win);

    this.win.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: "deny" };
    });

    remoteMain.enable(this.win.webContents);

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      await this.win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
      if (!process.env.IS_TEST) {
        this.win.webContents.openDevTools();
      }
    } else {
      createProtocol("app");
      await this.win.loadURL("app://./index.html");
    }

    this.win.on("closed", () => {
      this.win = null;
    });
  }

  private SetUpOnReady() {
    app.on("ready", async () => {
      if (this.isDevelopment && !process.env.IS_TEST) {
        try {
          // await installVueDevtools();
          await installExtension(VUEJS_DEVTOOLS);
        } catch (e) {
          console.error("Vue Devtools failed to install:", e);
        }
      }

      await this.InitiateWindow();
      Background.SetUpServices();
      this.bypassCORS();
    });
  }

  private static SetUpServices() {
    registerIpc();
  }

  private OnDevMode() {
    if (this.isDevelopment) {
      if (process.platform === "win32") {
        process.on("message", (data) => {
          if (data === "graceful-exit") {
            app.quit();
          }
        });
      } else {
        process.on("SIGTERM", () => {
          app.quit();
        });
      }
    }
  }

  private ForceSingleInstance() {
    // force single instance
    const primaryInstance = app.requestSingleInstanceLock();

    if (!primaryInstance) {
      app.quit();
    } else {
      app.on("second-instance", (event, commandLine) => {
        if (this.win) {
          if (this.win.isMinimized()) {
            this.win.restore();
          }

          this.win.focus();
          BeatsaverLinkOpener.SendArgvSecondInstance(commandLine);
        }
      });
    }
  }

  private bypassCORS() {
    if (!this.win) {
      return;
    }

    this.win.webContents.session.webRequest.onHeadersReceived(
      { urls: ["*://*.bsaber.com/*", "*://*.beatsaver.com/*"] },
      (details, callback) => {
        if (details.responseHeaders) {
          details.responseHeaders["access-control-allow-origin"] = ["*"];
          details.responseHeaders["Access-Control-Expose-Headers"] = [
            "rate-limit-remaining, rate-limit-total, rate-limit-reset",
          ];
        }

        callback({ responseHeaders: details.responseHeaders });
      }
    );
  }
}

new Background().Initiate();

contextMenu({
  showLearnSpelling: false,
  showLookUpSelection: false,
  showSearchWithGoogle: false,
  showSelectAll: false,
  showCopyLink: false,
});
