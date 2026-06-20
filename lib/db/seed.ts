import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import * as schema from "./schema";

const BANKS = [
  { slug: "nubank", name: "Nubank", color: "#820AD1" },
  { slug: "inter", name: "Inter", color: "#FF7A00" },
  { slug: "itau", name: "Itaú", color: "#EC7000" },
  { slug: "bradesco", name: "Bradesco", color: "#CC092F" },
  { slug: "santander", name: "Santander", color: "#EC0000" },
  { slug: "c6", name: "C6 Bank", color: "#242424" },
  { slug: "xp", name: "XP", color: "#FFD100" },
  { slug: "picpay", name: "PicPay", color: "#21C25E" },
  { slug: "caixa", name: "Caixa", color: "#005CA9" },
  { slug: "bb", name: "Banco do Brasil", color: "#FDF429" },
  { slug: "mercadopago", name: "Mercado Pago", color: "#009EE3" },
  { slug: "dinheiro", name: "Dinheiro", color: "#10B981" },
] as const;

const CATEGORIES = [
  { slug: "alimentacao", name: "Alimentação", icon: "utensils", color: "#F97316" },
  { slug: "transporte", name: "Transporte", icon: "car", color: "#3B82F6" },
  { slug: "moradia", name: "Moradia", icon: "home", color: "#8B5CF6" },
  { slug: "saude", name: "Saúde", icon: "heart-pulse", color: "#EF4444" },
  { slug: "lazer", name: "Lazer", icon: "gamepad-2", color: "#EC4899" },
  { slug: "educacao", name: "Educação", icon: "graduation-cap", color: "#06B6D4" },
  { slug: "compras", name: "Compras", icon: "shopping-bag", color: "#A855F7" },
  { slug: "assinaturas", name: "Assinaturas", icon: "repeat", color: "#6366F1" },
  { slug: "servicos", name: "Serviços", icon: "wrench", color: "#64748B" },
  { slug: "outros", name: "Outros", icon: "more-horizontal", color: "#94A3B8" },
] as const;

/** Catálogo inicial (bancos e categorias). Sem dados de exemplo. */
export function seedDatabase(db: BetterSQLite3Database<typeof schema>) {
  const now = new Date().toISOString();

  const existingBanks = db.select().from(schema.banks).all();
  if (existingBanks.length === 0) {
    for (const bank of BANKS) {
      db.insert(schema.banks)
        .values({
          id: uuidv4(),
          name: bank.name,
          slug: bank.slug,
          color: bank.color,
          createdAt: now,
        })
        .run();
    }
  }

  const existingCategories = db.select().from(schema.categories).all();
  if (existingCategories.length === 0) {
    for (const category of CATEGORIES) {
      db.insert(schema.categories)
        .values({
          id: uuidv4(),
          name: category.name,
          slug: category.slug,
          icon: category.icon,
          color: category.color,
          createdAt: now,
        })
        .run();
    }
  }
}

export { BANKS, CATEGORIES };
