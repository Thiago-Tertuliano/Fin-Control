const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "..", "data", "fin-control.db");

if (!fs.existsSync(dbPath)) {
  console.log("Banco não encontrado — será criado vazio na próxima execução.");
  process.exit(0);
}

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

const tables = [
  "expenses",
  "recurring_expenses",
  "investments",
  "income_sources",
];

for (const table of tables) {
  const result = db.prepare(`DELETE FROM ${table}`).run();
  console.log(`${table}: ${result.changes} registro(s) removido(s)`);
}

db.close();
console.log("Dados mock removidos. Bancos e categorias mantidos.");
