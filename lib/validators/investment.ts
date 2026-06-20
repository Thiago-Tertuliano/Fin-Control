import { z } from "zod";
import { assetTypes } from "@/lib/investments/config";

export { assetTypes };

const metadataSchema = z.object({
  quantity: z.string().optional(),
  avgPriceCents: z.number().int().positive().optional(),
  sector: z.string().optional(),
  monthlyDividendCents: z.number().int().positive().optional(),
  productType: z.string().optional(),
  indexer: z.string().optional(),
  rate: z.string().optional(),
  maturityDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  issuer: z.string().optional(),
  network: z.string().optional(),
  cnpj: z.string().optional(),
  manager: z.string().optional(),
  category: z.string().optional(),
});

const baseSchema = z.object({
  description: z.string().min(2),
  amountInvestedCents: z.number().int().positive(),
  currentValueCents: z.number().int().positive().optional().nullable(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bankId: z.string().uuid(),
  notes: z.string().optional().nullable(),
  metadata: metadataSchema.optional(),
});

export const investmentSchema = z.discriminatedUnion("assetType", [
  baseSchema.extend({
    assetType: z.literal("acao"),
    ticker: z.string().min(1, "Ticker obrigatório"),
    quantity: z.string().min(1, "Quantidade obrigatória"),
    metadata: metadataSchema.optional(),
  }),
  baseSchema.extend({
    assetType: z.literal("fii"),
    ticker: z.string().min(1, "Ticker obrigatório"),
    quantity: z.string().min(1, "Quantidade de cotas obrigatória"),
    metadata: metadataSchema.optional(),
  }),
  baseSchema.extend({
    assetType: z.literal("renda_fixa"),
    ticker: z.string().optional().nullable(),
    quantity: z.string().optional().nullable(),
    metadata: metadataSchema
      .extend({
        productType: z.string().min(1, "Tipo do produto obrigatório"),
        indexer: z.string().min(1, "Indexador obrigatório"),
        rate: z.string().min(1, "Taxa/remuneração obrigatória"),
        maturityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Vencimento obrigatório"),
      })
      .optional(),
  }).refine((d) => d.metadata?.productType && d.metadata?.indexer && d.metadata?.rate && d.metadata?.maturityDate, {
    message: "Preencha tipo, indexador, taxa e vencimento",
    path: ["metadata"],
  }),
  baseSchema.extend({
    assetType: z.literal("cripto"),
    ticker: z.string().min(1, "Símbolo obrigatório (BTC, ETH...)"),
    quantity: z.string().min(1, "Quantidade obrigatória"),
    metadata: metadataSchema.optional(),
  }),
  baseSchema.extend({
    assetType: z.literal("fundo"),
    ticker: z.string().optional().nullable(),
    quantity: z.string().min(1, "Quantidade de cotas obrigatória"),
    metadata: metadataSchema.optional(),
  }),
  baseSchema.extend({
    assetType: z.literal("outros"),
    ticker: z.string().optional().nullable(),
    quantity: z.string().optional().nullable(),
    metadata: metadataSchema.optional(),
  }),
]);

export type InvestmentInput = z.infer<typeof investmentSchema>;

export const investmentUpdateSchema = z.object({
  assetType: z.enum(["acao", "fii", "renda_fixa", "cripto", "fundo", "outros"]).optional(),
  ticker: z.string().optional().nullable(),
  description: z.string().min(2).optional(),
  amountInvestedCents: z.number().int().positive().optional(),
  currentValueCents: z.number().int().positive().optional().nullable(),
  quantity: z.string().optional().nullable(),
  purchaseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  bankId: z.string().uuid().optional(),
  notes: z.string().optional().nullable(),
  metadata: metadataSchema.optional(),
});

export function validateInvestmentPayload(data: unknown) {
  return investmentSchema.safeParse(data);
}
