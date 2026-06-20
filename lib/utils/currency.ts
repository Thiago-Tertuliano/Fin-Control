export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function parseCurrencyToCents(value: string): number {
  const digits = value.replace(/\D/g, "");
  return Number.parseInt(digits || "0", 10);
}

export function maskCurrencyInput(value: string): string {
  const cents = parseCurrencyToCents(value);
  return formatCurrency(cents);
}
