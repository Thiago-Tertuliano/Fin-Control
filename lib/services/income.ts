import { and, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { IncomeSourceWithRelations } from "@/lib/db/schema";

function mapIncome(
  row: typeof schema.incomeSources.$inferSelect,
  bank: typeof schema.banks.$inferSelect
): IncomeSourceWithRelations {
  return { ...row, bank };
}

export function listIncomeSources(activeOnly = false) {
  const db = getDb();
  const conditions = activeOnly ? [eq(schema.incomeSources.active, 1)] : [];

  const rows = db
    .select({
      income: schema.incomeSources,
      bank: schema.banks,
    })
    .from(schema.incomeSources)
    .innerJoin(schema.banks, eq(schema.incomeSources.bankId, schema.banks.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(schema.incomeSources.payDay, desc(schema.incomeSources.createdAt))
    .all();

  return rows.map((r) => mapIncome(r.income, r.bank));
}

export function getIncomeById(id: string): IncomeSourceWithRelations | null {
  const db = getDb();
  const row = db
    .select({
      income: schema.incomeSources,
      bank: schema.banks,
    })
    .from(schema.incomeSources)
    .innerJoin(schema.banks, eq(schema.incomeSources.bankId, schema.banks.id))
    .where(eq(schema.incomeSources.id, id))
    .get();

  if (!row) return null;
  return mapIncome(row.income, row.bank);
}

export function createIncome(data: {
  id: string;
  description: string;
  amountCents: number;
  incomeType: string;
  bankId: string;
  payDay: number;
  active: number;
  notes?: string | null;
  createdAt: string;
}) {
  const db = getDb();
  db.insert(schema.incomeSources).values(data).run();
  return getIncomeById(data.id);
}

export function updateIncome(
  id: string,
  data: Partial<{
    description: string;
    amountCents: number;
    incomeType: string;
    bankId: string;
    payDay: number;
    active: number;
    notes: string | null;
  }>
) {
  const db = getDb();
  db.update(schema.incomeSources).set(data).where(eq(schema.incomeSources.id, id)).run();
  return getIncomeById(id);
}

export function deleteIncome(id: string) {
  const db = getDb();
  db.delete(schema.incomeSources).where(eq(schema.incomeSources.id, id)).run();
}

export function getIncomeSummary() {
  const items = listIncomeSources(true);
  const totalMonthlyCents = items.reduce((s, i) => s + i.amountCents, 0);
  const count = items.length;

  const byType = Object.values(
    items.reduce<
      Record<
        string,
        { incomeType: string; totalCents: number; count: number }
      >
    >((acc, i) => {
      if (!acc[i.incomeType]) {
        acc[i.incomeType] = {
          incomeType: i.incomeType,
          totalCents: 0,
          count: 0,
        };
      }
      acc[i.incomeType].totalCents += i.amountCents;
      acc[i.incomeType].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.totalCents - a.totalCents);

  const calendar = [...items].sort((a, b) => a.payDay - b.payDay);

  return { totalMonthlyCents, count, items, byType, calendar };
}
