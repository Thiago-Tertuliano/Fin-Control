import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";
import { seedDatabase } from "./seed";

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
  sqlite: Database.Database | undefined;
};

function resolveDataDir(): string {
  if (process.env.FINCONTROL_DATA_DIR) {
    return process.env.FINCONTROL_DATA_DIR;
  }
  return path.join(process.cwd(), "data");
}

function resolveDbPath(): string {
  const dataDir = resolveDataDir();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return process.env.DATABASE_URL ?? path.join(dataDir, "fin-control.db");
}

function resolveMigrationsFolder(): string {
  if (process.env.FINCONTROL_MIGRATIONS_DIR) {
    return process.env.FINCONTROL_MIGRATIONS_DIR;
  }
  return path.join(process.cwd(), "lib/db/migrations");
}

function createDb() {
  const dbPath = resolveDbPath();
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });

  const migrationsFolder = resolveMigrationsFolder();
  if (fs.existsSync(migrationsFolder)) {
    migrate(db, { migrationsFolder });
  }

  seedDatabase(db);

  return { db, sqlite };
}

export function getDb() {
  if (!globalForDb.db) {
    const { db, sqlite } = createDb();
    globalForDb.db = db;
    globalForDb.sqlite = sqlite;
  }
  return globalForDb.db;
}

export { schema };
