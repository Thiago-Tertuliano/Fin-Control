import { z } from "zod";

export const incomeTypes = [
  { value: "salario", label: "Salário" },
  { value: "freelance", label: "Freelance" },
  { value: "aluguel", label: "Aluguel recebido" },
  { value: "dividendos", label: "Dividendos" },
  { value: "outros", label: "Outros" },
] as const;

export const incomeSchema = z.object({
  description: z.string().min(2, "Descrição deve ter ao menos 2 caracteres"),
  amountCents: z.number().int().positive("Valor deve ser maior que zero"),
  incomeType: z.enum(["salario", "freelance", "aluguel", "dividendos", "outros"]),
  bankId: z.string().uuid("Banco inválido"),
  payDay: z.number().int().min(1).max(31, "Dia deve ser entre 1 e 31"),
  active: z.boolean().optional().default(true),
  notes: z.string().optional().nullable(),
});

export type IncomeInput = z.infer<typeof incomeSchema>;
