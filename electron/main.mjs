import { app, BrowserWindow, shell } from "electron";
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;
const SERVER_PORT = 38472;

let mainWindow = null;
/** @type {import('node:child_process').ChildProcess | null} */
let serverProcess = null;

function getStandaloneDir() {
  if (isDev) {
    return path.join(__dirname, "..", ".next", "standalone");
  }
  return path.join(process.resourcesPath, "standalone");
}

function getNodeBinary() {
  if (isDev) {
    return process.execPath;
  }
  const bundled = path.join(process.resourcesPath, "node", "node.exe");
  if (fs.existsSync(bundled)) return bundled;
  return process.execPath;
}

function getDataDir() {
  return path.join(app.getPath("userData"), "data");
}

function getMigrationsDir() {
  return path.join(getStandaloneDir(), "lib", "db", "migrations");
}

function waitForServer(port, timeoutMs = 120_000) {
  const started = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(`http://127.0.0.1:${port}`, (res) => {
        res.resume();
        resolve(undefined);
      });

      req.on("error", () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error("Servidor não respondeu a tempo"));
          return;
        }
        setTimeout(check, 400);
      });
    };

    check();
  });
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once("error", () => resolve(false))
      .once("listening", () => tester.close(() => resolve(true)))
      .listen(port, "127.0.0.1");
  });
}

async function resolvePort() {
  if (await isPortFree(SERVER_PORT)) return SERVER_PORT;
  return SERVER_PORT + Math.floor(Math.random() * 1000);
}

async function startNextServer(port) {
  const standaloneDir = getStandaloneDir();
  const serverEntry = path.join(standaloneDir, "server.js");

  if (!fs.existsSync(serverEntry)) {
    throw new Error(
      `Build standalone não encontrado. Execute: npm run desktop:prepare`
    );
  }

  const dataDir = getDataDir();
  fs.mkdirSync(dataDir, { recursive: true });

  const nodeBinary = getNodeBinary();
  const useElectronAsNode = isDev && nodeBinary === process.execPath;

  serverProcess = spawn(nodeBinary, [serverEntry], {
    cwd: standaloneDir,
    env: {
      ...process.env,
      ...(useElectronAsNode ? { ELECTRON_RUN_AS_NODE: "1" } : {}),
      NODE_ENV: "production",
      PORT: String(port),
      HOSTNAME: "127.0.0.1",
      FINCONTROL_DATA_DIR: dataDir,
      FINCONTROL_MIGRATIONS_DIR: getMigrationsDir(),
    },
    stdio: isDev ? "inherit" : "pipe",
  });

  serverProcess.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`Servidor encerrado com código ${code}`);
    }
  });

  if (serverProcess.stderr && !isDev) {
    serverProcess.stderr.on("data", (chunk) => {
      console.error(String(chunk));
    });
  }

  await waitForServer(port);
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: "FinControl",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${port}`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function stopServer() {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
  serverProcess = null;
}

app.whenReady().then(async () => {
  try {
    const port = await resolvePort();
    await startNextServer(port);
    createWindow(port);
  } catch (error) {
    console.error(error);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  stopServer();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  stopServer();
});

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    const port = await resolvePort();
    await startNextServer(port);
    createWindow(port);
  }
});
