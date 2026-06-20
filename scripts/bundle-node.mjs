const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const nodeSrc = process.execPath;
const nodeDir = path.join(root, "build", "node");

if (!fs.existsSync(nodeSrc)) {
  console.error("Node.js não encontrado.");
  process.exit(1);
}

fs.mkdirSync(nodeDir, { recursive: true });
fs.copyFileSync(nodeSrc, path.join(nodeDir, "node.exe"));

console.log(`Node copiado para ${nodeDir}`);
