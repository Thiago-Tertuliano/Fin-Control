export type AssetType =
  | "acao"
  | "fii"
  | "renda_fixa"
  | "cripto"
  | "fundo"
  | "outros";

export type InvestmentMetadata = {
  quantity?: string;
  avgPriceCents?: number;
  sector?: string;
  monthlyDividendCents?: number;
  productType?: string;
  indexer?: string;
  rate?: string;
  maturityDate?: string;
  issuer?: string;
  network?: string;
  cnpj?: string;
  manager?: string;
  category?: string;
};

export function parseInvestmentMetadata(raw: string | null): InvestmentMetadata {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as InvestmentMetadata;
  } catch {
    return {};
  }
}

export function stringifyInvestmentMetadata(data: InvestmentMetadata): string | null {
  const cleaned = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  return Object.keys(cleaned).length > 0 ? JSON.stringify(cleaned) : null;
}

export const assetTypes = [
  {
    value: "acao" as const,
    label: "Ações",
    description: "Ações listadas na B3",
    color: "#3B82F6",
  },
  {
    value: "fii" as const,
    label: "FIIs",
    description: "Fundos imobiliários",
    color: "#8B5CF6",
  },
  {
    value: "renda_fixa" as const,
    label: "Renda Fixa",
    description: "CDB, Tesouro, LCI, LCA",
    color: "#10B981",
  },
  {
    value: "cripto" as const,
    label: "Cripto",
    description: "Bitcoin, Ethereum e altcoins",
    color: "#F59E0B",
  },
  {
    value: "fundo" as const,
    label: "Fundos",
    description: "Fundos de investimento",
    color: "#06B6D4",
  },
  {
    value: "outros" as const,
    label: "Outros",
    description: "Ouro, COE, previdência etc.",
    color: "#64748B",
  },
];

export const assetLabels = Object.fromEntries(
  assetTypes.map((a) => [a.value, a.label])
);

export const rendaFixaProducts = [
  { value: "cdb", label: "CDB" },
  { value: "lci", label: "LCI" },
  { value: "lca", label: "LCA" },
  { value: "tesouro", label: "Tesouro Direto" },
  { value: "debenture", label: "Debênture" },
  { value: "cri_cra", label: "CRI / CRA" },
  { value: "outro", label: "Outro" },
];

export const indexers = [
  { value: "cdi", label: "% do CDI" },
  { value: "ipca", label: "IPCA +" },
  { value: "prefixado", label: "Prefixado (% a.a.)" },
  { value: "selic", label: "Selic" },
];

export const cryptoNetworks = [
  { value: "bitcoin", label: "Bitcoin" },
  { value: "ethereum", label: "Ethereum" },
  { value: "bnb", label: "BNB Chain" },
  { value: "solana", label: "Solana" },
  { value: "outra", label: "Outra" },
];

export function formatInvestmentDetails(
  assetType: string,
  metadata: InvestmentMetadata,
  quantity: string | null
): string[] {
  const lines: string[] = [];
  const qty = metadata.quantity ?? quantity;

  switch (assetType) {
    case "acao":
      if (qty) lines.push(`${qty} ações`);
      if (metadata.sector) lines.push(metadata.sector);
      if (metadata.avgPriceCents)
        lines.push(`PM: ${(metadata.avgPriceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`);
      break;
    case "fii":
      if (qty) lines.push(`${qty} cotas`);
      if (metadata.monthlyDividendCents)
        lines.push(`DY est.: ${(metadata.monthlyDividendCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/mês`);
      break;
    case "renda_fixa":
      if (metadata.productType) {
        const prod = rendaFixaProducts.find((p) => p.value === metadata.productType);
        if (prod) lines.push(prod.label);
      }
      if (metadata.indexer && metadata.rate) {
        const idx = indexers.find((i) => i.value === metadata.indexer);
        lines.push(`${metadata.rate}${idx ? ` ${idx.label}` : ""}`);
      }
      if (metadata.maturityDate) lines.push(`Venc.: ${metadata.maturityDate.split("-").reverse().join("/")}`);
      if (metadata.issuer) lines.push(metadata.issuer);
      break;
    case "cripto":
      if (qty) lines.push(`${qty} un.`);
      if (metadata.network) {
        const net = cryptoNetworks.find((n) => n.value === metadata.network);
        if (net) lines.push(net.label);
      }
      break;
    case "fundo":
      if (qty) lines.push(`${qty} cotas`);
      if (metadata.manager) lines.push(metadata.manager);
      if (metadata.cnpj) lines.push(`CNPJ: ${metadata.cnpj}`);
      break;
    case "outros":
      if (metadata.category) lines.push(metadata.category);
      break;
  }

  return lines;
}
