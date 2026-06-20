import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { ExpenseWithRelations } from "@/lib/db/schema";

function mapExpense(
  row: typeof schema.expenses.$inferSelect,
  category: typeof schema.categories.$inferSelect,
  bank: typeof schema.banks.$inferSelect
): ExpenseWithRelations {
  return { ...row, category, bank };
}

export function listExpenses(filters?: {
  start?: string;
  end?: string;
  categoryId?: string;
  bankId?: string;
  paymentMethod?: string;
  search?: string;
}) {
  const db = getDb();
  const conditions = [];

  if (filters?.start) conditions.push(gte(schema.expenses.date, filters.start));
  if (filters?.end) conditions.push(lte(schema.expenses.date, filters.end));
  if (filters?.categoryId)
    conditions.push(eq(schema.expenses.categoryId, filters.categoryId));
  if (filters?.bankId)
    conditions.push(eq(schema.expenses.bankId, filters.bankId));
  if (filters?.paymentMethod)
    conditions.push(eq(schema.expenses.paymentMethod, filters.paymentMethod));
  if (filters?.search) {
    conditions.push(
      sql`lower(${schema.expenses.description}) like ${`%${filters.search.toLowerCase()}%`}`
    );
  }

  const rows = db
    .select({
      expense: schema.expenses,
      category: schema.categories,
      bank: schema.banks,
    })
    .from(schema.expenses)
    .innerJoin(
      schema.categories,
      eq(schema.expenses.categoryId, schema.categories.id)
    )
    .innerJoin(schema.banks, eq(schema.expenses.bankId, schema.banks.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.expenses.date), desc(schema.expenses.createdAt))
    .all();

  return rows.map((r) => mapExpense(r.expense, r.category, r.bank));
}

export function getExpenseById(id: string): ExpenseWithRelations | null {
  const db = getDb();
  const row = db
    .select({
      expense: schema.expenses,
      category: schema.categories,
      bank: schema.banks,
    })
    .from(schema.expenses)
    .innerJoin(
      schema.categories,
      eq(schema.expenses.categoryId, schema.categories.id)
    )
    .innerJoin(schema.banks, eq(schema.expenses.bankId, schema.banks.id))
    .where(eq(schema.expenses.id, id))
    .get();

  if (!row) return null;
  return mapExpense(row.expense, row.category, row.bank);
}

export function createExpense(data: {
  id: string;
  description: string;
  amountCents: number;
  categoryId: string;
  bankId: string;
  date: string;
  paymentMethod: string;
  installments?: number | null;
  notes?: string | null;
  createdAt: string;
}) {
  const db = getDb();
  db.insert(schema.expenses).values(data).run();
  return getExpenseById(data.id);
}

export function updateExpense(
  id: string,
  data: Partial<{
    description: string;
    amountCents: number;
    categoryId: string;
    bankId: string;
    date: string;
    paymentMethod: string;
    installments: number | null;
    notes: string | null;
  }>
) {
  const db = getDb();
  db.update(schema.expenses).set(data).where(eq(schema.expenses.id, id)).run();
  return getExpenseById(id);
}

export function deleteExpense(id: string) {
  const db = getDb();
  db.delete(schema.expenses).where(eq(schema.expenses.id, id)).run();
}

export function getDashboardData(start: string, end: string) {
  const expenses = listExpenses({ start, end });
  const totalCents = expenses.reduce((sum, e) => sum + e.amountCents, 0);
  const count = expenses.length;
  const avgCents = count > 0 ? Math.round(totalCents / count) : 0;

  const byCategory = Object.values(
    expenses.reduce<
      Record<
        string,
        {
          categoryId: string;
          name: string;
          color: string;
          icon: string;
          totalCents: number;
          count: number;
        }
      >
    >((acc, e) => {
      const key = e.categoryId;
      if (!acc[key]) {
        acc[key] = {
          categoryId: e.categoryId,
          name: e.category.name,
          color: e.category.color,
          icon: e.category.icon,
          totalCents: 0,
          count: 0,
        };
      }
      acc[key].totalCents += e.amountCents;
      acc[key].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.totalCents - a.totalCents);

  const byBank = Object.values(
    expenses.reduce<
      Record<
        string,
        {
          bankId: string;
          name: string;
          slug: string;
          color: string;
          totalCents: number;
          count: number;
        }
      >
    >((acc, e) => {
      const key = e.bankId;
      if (!acc[key]) {
        acc[key] = {
          bankId: e.bankId,
          name: e.bank.name,
          slug: e.bank.slug,
          color: e.bank.color,
          totalCents: 0,
          count: 0,
        };
      }
      acc[key].totalCents += e.amountCents;
      acc[key].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.totalCents - a.totalCents);

  const byDay = Object.values(
    expenses.reduce<
      Record<string, { date: string; totalCents: number; count: number }>
    >((acc, e) => {
      if (!acc[e.date]) {
        acc[e.date] = { date: e.date, totalCents: 0, count: 0 };
      }
      acc[e.date].totalCents += e.amountCents;
      acc[e.date].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => a.date.localeCompare(b.date));

  const byPayment = Object.values(
    expenses.reduce<
      Record<string, { method: string; totalCents: number; count: number }>
    >((acc, e) => {
      if (!acc[e.paymentMethod]) {
        acc[e.paymentMethod] = {
          method: e.paymentMethod,
          totalCents: 0,
          count: 0,
        };
      }
      acc[e.paymentMethod].totalCents += e.amountCents;
      acc[e.paymentMethod].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.totalCents - a.totalCents);

  return {
    totalCents,
    count,
    avgCents,
    byCategory,
    byBank,
    byDay,
    byPayment,
    recent: expenses.slice(0, 8),
  };
}

export function listBanks() {
  const db = getDb();
  return db.select().from(schema.banks).orderBy(schema.banks.name).all();
}

export function listCategories() {
  const db = getDb();
  return db.select().from(schema.categories).orderBy(schema.categories.name).all();
}
