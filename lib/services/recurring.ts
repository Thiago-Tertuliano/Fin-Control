import { and, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { RecurringExpenseWithRelations } from "@/lib/db/schema";

function mapRecurring(
  row: typeof schema.recurringExpenses.$inferSelect,
  category: typeof schema.categories.$inferSelect,
  bank: typeof schema.banks.$inferSelect
): RecurringExpenseWithRelations {
  return { ...row, category, bank };
}

export function listRecurringExpenses(activeOnly = false) {
  const db = getDb();
  const conditions = activeOnly
    ? [eq(schema.recurringExpenses.active, 1)]
    : [];

  const rows = db
    .select({
      recurring: schema.recurringExpenses,
      category: schema.categories,
      bank: schema.banks,
    })
    .from(schema.recurringExpenses)
    .innerJoin(
      schema.categories,
      eq(schema.recurringExpenses.categoryId, schema.categories.id)
    )
    .innerJoin(schema.banks, eq(schema.recurringExpenses.bankId, schema.banks.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(schema.recurringExpenses.billingDay, desc(schema.recurringExpenses.createdAt))
    .all();

  return rows.map((r) => mapRecurring(r.recurring, r.category, r.bank));
}

export function getRecurringById(id: string): RecurringExpenseWithRelations | null {
  const db = getDb();
  const row = db
    .select({
      recurring: schema.recurringExpenses,
      category: schema.categories,
      bank: schema.banks,
    })
    .from(schema.recurringExpenses)
    .innerJoin(
      schema.categories,
      eq(schema.recurringExpenses.categoryId, schema.categories.id)
    )
    .innerJoin(schema.banks, eq(schema.recurringExpenses.bankId, schema.banks.id))
    .where(eq(schema.recurringExpenses.id, id))
    .get();

  if (!row) return null;
  return mapRecurring(row.recurring, row.category, row.bank);
}

export function createRecurring(data: {
  id: string;
  description: string;
  amountCents: number;
  categoryId: string;
  bankId: string;
  billingDay: number;
  paymentMethod: string;
  active: number;
  notes?: string | null;
  createdAt: string;
}) {
  const db = getDb();
  db.insert(schema.recurringExpenses).values(data).run();
  return getRecurringById(data.id);
}

export function updateRecurring(
  id: string,
  data: Partial<{
    description: string;
    amountCents: number;
    categoryId: string;
    bankId: string;
    billingDay: number;
    paymentMethod: string;
    active: number;
    notes: string | null;
  }>
) {
  const db = getDb();
  db.update(schema.recurringExpenses).set(data).where(eq(schema.recurringExpenses.id, id)).run();
  return getRecurringById(id);
}

export function deleteRecurring(id: string) {
  const db = getDb();
  db.delete(schema.recurringExpenses).where(eq(schema.recurringExpenses.id, id)).run();
}

export function getRecurringSummary() {
  const items = listRecurringExpenses(true);
  const totalMonthlyCents = items.reduce((s, i) => s + i.amountCents, 0);
  const count = items.length;

  const upcoming = [...items]
    .sort((a, b) => a.billingDay - b.billingDay)
    .slice(0, 5);

  return { totalMonthlyCents, count, items, upcoming };
}
