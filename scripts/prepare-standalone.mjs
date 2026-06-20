const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const standaloneDir = path.join(root, ".next", "standalone");

if (!fs.existsSync(path.join(standaloneDir, "server.js"))) {
  console.error("Execute `npm run build` antes de preparar o standalone.");
  process.exit(1);
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

// Assets estáticos exigidos pelo Next standalone
copyRecursive(
  path.join(root, ".next", "static"),
  path.join(standaloneDir, ".next", "static")
);
copyRecursive(path.join(root, "public"), path.join(standaloneDir, "public"));

// Migrations SQLite
copyRecursive(
  path.join(root, "lib", "db", "migrations"),
  path.join(standaloneDir, "lib", "db", "migrations")
);

console.log("Standalone preparado em .next/standalone");
