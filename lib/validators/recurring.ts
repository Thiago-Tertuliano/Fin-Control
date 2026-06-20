import { z } from "zod";
import { paymentMethods } from "./expense";

export const recurringExpenseSchema = z.object({
  description: z.string().min(2, "Descrição deve ter ao menos 2 caracteres"),
  amountCents: z.number().int().positive("Valor deve ser maior que zero"),
  categoryId: z.string().uuid("Categoria inválida"),
  bankId: z.string().uuid("Banco inválido"),
  billingDay: z.number().int().min(1).max(31, "Dia deve ser entre 1 e 31"),
  paymentMethod: z.enum(["credito", "debito", "pix", "dinheiro"]),
  active: z.boolean().optional().default(true),
  notes: z.string().optional().nullable(),
});

export type RecurringExpenseInput = z.infer<typeof recurringExpenseSchema>;

export { paymentMethods };
