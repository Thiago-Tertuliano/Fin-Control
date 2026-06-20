const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const root = path.join(__dirname, "..");
const standaloneDir = path.join(root, ".next", "standalone");
const nodeExe = path.join(root, "build", "node", "node.exe");
const sqliteDest = path.join(standaloneDir, "node_modules", "better-sqlite3");

if (!fs.existsSync(nodeExe)) {
  console.error("Node empacotado ausente. Execute bundle-node.cjs primeiro.");
  process.exit(1);
}

if (!fs.existsSync(path.join(standaloneDir, "server.js"))) {
  console.error("Standalone ausente. Execute next build primeiro.");
  process.exit(1);
}

console.log("Recompilando better-sqlite3 para o Node do instalador...");

execSync("npm rebuild better-sqlite3", {
  cwd: standaloneDir,
  stdio: "inherit",
  env: {
    ...process.env,
    PATH: `${path.dirname(nodeExe)}${path.delimiter}${process.env.PATH}`,
  },
});

const nativeBinary = path.join(sqliteDest, "build", "Release", "better_sqlite3.node");
if (!fs.existsSync(nativeBinary)) {
  console.error("Falha ao gerar better_sqlite3.node no standalone.");
  process.exit(1);
}

console.log("Native module OK:", nativeBinary);
