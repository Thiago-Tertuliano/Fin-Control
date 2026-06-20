/** Mapeia slug interno → nome na lib @edusites/bancos-brasil */
export const BANK_SLUG_TO_BRAND: Record<string, string> = {
  nubank: "nubank",
  inter: "inter",
  itau: "itau",
  bradesco: "bradesco",
  santander: "santander",
  c6: "c6",
  xp: "xp",
  picpay: "picpay",
  caixa: "caixa",
  bb: "bancodobrasil",
  mercadopago: "mercadopago",
};

export function resolveBankBrand(slug: string): string | null {
  return BANK_SLUG_TO_BRAND[slug] ?? null;
}

export const BANK_ICON_SIZES = {
  sm: 32,
  md: 40,
  lg: 48,
} as const;
