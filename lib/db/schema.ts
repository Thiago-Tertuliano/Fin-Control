import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const banks = sqliteTable("banks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  color: text("color").notNull(),
  createdAt: text("created_at").notNull(),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: text("created_at").notNull(),
});

export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  bankId: text("bank_id")
    .notNull()
    .references(() => banks.id),
  date: text("date").notNull(),
  paymentMethod: text("payment_method").notNull(),
  installments: integer("installments"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const recurringExpenses = sqliteTable("recurring_expenses", {
  id: text("id").primaryKey(),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  bankId: text("bank_id")
    .notNull()
    .references(() => banks.id),
  billingDay: integer("billing_day").notNull(),
  paymentMethod: text("payment_method").notNull(),
  active: integer("active").notNull().default(1),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const investments = sqliteTable("investments", {
  id: text("id").primaryKey(),
  assetType: text("asset_type").notNull(),
  ticker: text("ticker"),
  description: text("description").notNull(),
  amountInvestedCents: integer("amount_invested_cents").notNull(),
  currentValueCents: integer("current_value_cents"),
  quantity: text("quantity"),
  purchaseDate: text("purchase_date").notNull(),
  bankId: text("bank_id")
    .notNull()
    .references(() => banks.id),
  notes: text("notes"),
  metadata: text("metadata"),
  createdAt: text("created_at").notNull(),
});

export const incomeSources = sqliteTable("income_sources", {
  id: text("id").primaryKey(),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  incomeType: text("income_type").notNull(),
  bankId: text("bank_id")
    .notNull()
    .references(() => banks.id),
  payDay: integer("pay_day").notNull(),
  active: integer("active").notNull().default(1),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export type Bank = typeof banks.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type RecurringExpense = typeof recurringExpenses.$inferSelect;
export type Investment = typeof investments.$inferSelect;
export type IncomeSource = typeof incomeSources.$inferSelect;

export type ExpenseWithRelations = Expense & {
  category: Category;
  bank: Bank;
};

export type RecurringExpenseWithRelations = RecurringExpense & {
  category: Category;
  bank: Bank;
};

export type InvestmentWithRelations = Investment & {
  bank: Bank;
};

export type IncomeSourceWithRelations = IncomeSource & {
  bank: Bank;
};
