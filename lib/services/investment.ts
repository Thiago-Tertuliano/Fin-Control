import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { InvestmentWithRelations } from "@/lib/db/schema";

function mapInvestment(
  row: typeof schema.investments.$inferSelect,
  bank: typeof schema.banks.$inferSelect
): InvestmentWithRelations {
  return { ...row, bank };
}

export function listInvestments() {
  const db = getDb();
  const rows = db
    .select({
      investment: schema.investments,
      bank: schema.banks,
    })
    .from(schema.investments)
    .innerJoin(schema.banks, eq(schema.investments.bankId, schema.banks.id))
    .orderBy(desc(schema.investments.purchaseDate), desc(schema.investments.createdAt))
    .all();

  return rows.map((r) => mapInvestment(r.investment, r.bank));
}

export function getInvestmentById(id: string): InvestmentWithRelations | null {
  const db = getDb();
  const row = db
    .select({
      investment: schema.investments,
      bank: schema.banks,
    })
    .from(schema.investments)
    .innerJoin(schema.banks, eq(schema.investments.bankId, schema.banks.id))
    .where(eq(schema.investments.id, id))
    .get();

  if (!row) return null;
  return mapInvestment(row.investment, row.bank);
}

export function createInvestment(data: {
  id: string;
  assetType: string;
  ticker?: string | null;
  description: string;
  amountInvestedCents: number;
  currentValueCents?: number | null;
  quantity?: string | null;
  purchaseDate: string;
  bankId: string;
  notes?: string | null;
  metadata?: string | null;
  createdAt: string;
}) {
  const db = getDb();
  db.insert(schema.investments).values(data).run();
  return getInvestmentById(data.id);
}

export function updateInvestment(
  id: string,
  data: Partial<{
    assetType: string;
    ticker: string | null;
    description: string;
    amountInvestedCents: number;
    currentValueCents: number | null;
    quantity: string | null;
    purchaseDate: string;
    bankId: string;
    notes: string | null;
    metadata: string | null;
  }>
) {
  const db = getDb();
  db.update(schema.investments).set(data).where(eq(schema.investments.id, id)).run();
  return getInvestmentById(id);
}

export function deleteInvestment(id: string) {
  const db = getDb();
  db.delete(schema.investments).where(eq(schema.investments.id, id)).run();
}

export function getInvestmentSummary() {
  const items = listInvestments();
  const totalInvestedCents = items.reduce((s, i) => s + i.amountInvestedCents, 0);
  const totalCurrentCents = items.reduce(
    (s, i) => s + (i.currentValueCents ?? i.amountInvestedCents),
    0
  );
  const profitCents = totalCurrentCents - totalInvestedCents;
  const profitPct =
    totalInvestedCents > 0
      ? ((profitCents / totalInvestedCents) * 100).toFixed(1)
      : "0";

  const byAssetType = Object.values(
    items.reduce<
      Record<
        string,
        {
          assetType: string;
          totalInvestedCents: number;
          totalCurrentCents: number;
          count: number;
        }
      >
    >((acc, i) => {
      if (!acc[i.assetType]) {
        acc[i.assetType] = {
          assetType: i.assetType,
          totalInvestedCents: 0,
          totalCurrentCents: 0,
          count: 0,
        };
      }
      acc[i.assetType].totalInvestedCents += i.amountInvestedCents;
      acc[i.assetType].totalCurrentCents +=
        i.currentValueCents ?? i.amountInvestedCents;
      acc[i.assetType].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.totalCurrentCents - a.totalCurrentCents);

  return {
    totalInvestedCents,
    totalCurrentCents,
    profitCents,
    profitPct,
    count: items.length,
    items,
    byAssetType,
  };
}
