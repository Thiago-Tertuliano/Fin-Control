import { z } from "zod";

/** Opções exibidas no formulário (quando banco ≠ dinheiro) */
export const cardPaymentMethods = [
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "pix", label: "PIX" },
] as const;

/** Todas as formas persistidas (inclui dinheiro automático) */
export const paymentMethods = [
  ...cardPaymentMethods,
  { value: "dinheiro", label: "Dinheiro" },
] as const;

export const paymentMethodLabels = Object.fromEntries(
  paymentMethods.map((m) => [m.value, m.label])
) as Record<string, string>;

export type CardPaymentMethod = (typeof cardPaymentMethods)[number]["value"];
export type PaymentMethod = (typeof paymentMethods)[number]["value"];

const expenseBaseSchema = z.object({
  description: z.string().min(2, "Descrição deve ter ao menos 2 caracteres"),
  amountCents: z.number().int().positive("Valor deve ser maior que zero"),
  categoryId: z.string().uuid("Categoria inválida"),
  bankId: z.string().uuid("Banco inválido"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  paymentMethod: z.enum(["credito", "debito", "pix", "dinheiro"]),
  installments: z.number().int().min(1).max(48).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const expenseSchema = expenseBaseSchema.superRefine((data, ctx) => {
  if (data.paymentMethod === "credito" && !data.installments) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe o número de parcelas",
      path: ["installments"],
    });
  }
  if (data.paymentMethod !== "credito" && data.installments) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Parcelas só se aplicam a crédito",
      path: ["installments"],
    });
  }
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

export const expenseUpdateSchema = expenseBaseSchema.partial();

export function formatPaymentLabel(
  method: string,
  installments?: number | null
): string {
  const base = paymentMethodLabels[method] ?? method;
  if (method === "credito" && installments) {
    return `${base} · ${installments}x`;
  }
  return base;
}
