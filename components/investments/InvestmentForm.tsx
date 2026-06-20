"use client";

import { useState } from "react";
import { BankLogo } from "@/components/ui/BankLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  FieldError,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/Input";
import {
  assetTypes,
  cryptoNetworks,
  indexers,
  rendaFixaProducts,
  type AssetType,
  type InvestmentMetadata,
} from "@/lib/investments/config";
import { formatCurrency, parseCurrencyToCents } from "@/lib/utils/currency";
import type { Bank } from "@/lib/db/schema";
import { cn } from "@/lib/utils/cn";

type FormState = {
  assetType: AssetType;
  ticker: string;
  description: string;
  investedDisplay: string;
  investedCents: number;
  currentDisplay: string;
  currentCents: number;
  quantity: string;
  purchaseDate: string;
  bankId: string;
  notes: string;
  metadata: InvestmentMetadata;
};

const emptyForm = (): FormState => ({
  assetType: "acao",
  ticker: "",
  description: "",
  investedDisplay: "",
  investedCents: 0,
  currentDisplay: "",
  currentCents: 0,
  quantity: "",
  purchaseDate: new Date().toISOString().slice(0, 10),
  bankId: "",
  notes: "",
  metadata: {},
});

export function InvestmentForm({
  banks,
  onSuccess,
  onCancel,
}: {
  banks: Bank[];
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined, metadata: undefined }));
  }

  function setMeta(partial: Partial<InvestmentMetadata>) {
    setForm((f) => ({ ...f, metadata: { ...f.metadata, ...partial } }));
    setErrors((e) => ({ ...e, metadata: undefined }));
  }

  function handleCurrency(field: "invested" | "current", value: string) {
    const cents = parseCurrencyToCents(value);
    if (field === "invested") {
      setForm((f) => ({
        ...f,
        investedCents: cents,
        investedDisplay: formatCurrency(cents),
      }));
    } else {
      setForm((f) => ({
        ...f,
        currentCents: cents,
        currentDisplay: formatCurrency(cents),
      }));
    }
  }

  function handleMetaCurrency(field: "monthlyDividend" | "avgPrice", value: string) {
    const cents = parseCurrencyToCents(value);
    if (field === "monthlyDividend") setMeta({ monthlyDividendCents: cents || undefined });
    if (field === "avgPrice") setMeta({ avgPriceCents: cents || undefined });
  }

  function switchAssetType(type: AssetType) {
    setForm({ ...emptyForm(), assetType: type, bankId: form.bankId });
    setErrors({});
  }

  function validate(): boolean {
    const e: Record<string, string | undefined> = {};

    if (form.description.trim().length < 2) e.description = "Descrição obrigatória";
    if (form.investedCents <= 0) e.invested = "Valor aplicado inválido";
    if (!form.bankId) e.bankId = "Selecione corretora/banco";

    switch (form.assetType) {
      case "acao":
        if (!form.ticker.trim()) e.ticker = "Ticker obrigatório (ex: PETR4)";
        if (!form.quantity.trim()) e.quantity = "Quantidade de ações obrigatória";
        break;
      case "fii":
        if (!form.ticker.trim()) e.ticker = "Ticker obrigatório (ex: HGLG11)";
        if (!form.quantity.trim()) e.quantity = "Quantidade de cotas obrigatória";
        break;
      case "renda_fixa":
        if (!form.metadata.productType) e.metadata = "Selecione o tipo do produto";
        if (!form.metadata.indexer) e.metadata = "Selecione o indexador";
        if (!form.metadata.rate?.trim()) e.metadata = "Informe a taxa/remuneração";
        if (!form.metadata.maturityDate) e.metadata = "Informe a data de vencimento";
        break;
      case "cripto":
        if (!form.ticker.trim()) e.ticker = "Símbolo obrigatório (ex: BTC)";
        if (!form.quantity.trim()) e.quantity = "Quantidade obrigatória";
        break;
      case "fundo":
        if (!form.quantity.trim()) e.quantity = "Quantidade de cotas obrigatória";
        break;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function buildPayload() {
    const metadata: InvestmentMetadata = { ...form.metadata };

    if (form.assetType === "acao" || form.assetType === "fii" || form.assetType === "cripto" || form.assetType === "fundo") {
      metadata.quantity = form.quantity;
    }

    if (form.assetType === "renda_fixa" && form.metadata.issuer) {
      // issuer stays in metadata
    }

    return {
      assetType: form.assetType,
      ticker: form.ticker.trim() || null,
      description: form.description.trim(),
      amountInvestedCents: form.investedCents,
      currentValueCents: form.currentCents > 0 ? form.currentCents : null,
      quantity:
        form.assetType === "acao" ||
        form.assetType === "fii" ||
        form.assetType === "cripto" ||
        form.assetType === "fundo"
          ? form.quantity
          : null,
      purchaseDate: form.purchaseDate,
      bankId: form.bankId,
      notes: form.notes || null,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Erro ao salvar");
        return;
      }

      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  const brokerLabel =
    form.assetType === "cripto"
      ? "Exchange / carteira"
      : form.assetType === "renda_fixa"
        ? "Banco / emissor"
        : "Corretora";

  return (
    <Card className="mb-6">
      <div className="mb-6">
        <Label className="mb-3">Tipo de investimento</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {assetTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => switchAssetType(type.value)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                form.assetType === type.value
                  ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                  : "border-border hover:border-accent/40 hover:bg-card-hover"
              )}
            >
              <div
                className="mb-2 h-1.5 w-8 rounded-full"
                style={{ backgroundColor: type.color }}
              />
              <p className="text-sm font-semibold">{type.label}</p>
              <p className="mt-0.5 text-[10px] leading-tight text-muted">
                {type.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        {/* AÇÕES */}
        {form.assetType === "acao" && (
          <>
            <div>
              <Label>Ticker</Label>
              <Input
                placeholder="PETR4, VALE3..."
                value={form.ticker}
                onChange={(e) => setField("ticker", e.target.value.toUpperCase())}
              />
              <FieldError message={errors.ticker} />
            </div>
            <div>
              <Label>Empresa</Label>
              <Input
                placeholder="Petrobras PN"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
              <FieldError message={errors.description} />
            </div>
            <div>
              <Label>Quantidade de ações</Label>
              <Input
                placeholder="100"
                inputMode="decimal"
                value={form.quantity}
                onChange={(e) => setField("quantity", e.target.value)}
              />
              <FieldError message={errors.quantity} />
            </div>
            <div>
              <Label>Preço médio (opcional)</Label>
              <Input
                placeholder="R$ 0,00"
                onChange={(e) => handleMetaCurrency("avgPrice", e.target.value)}
              />
            </div>
            <div>
              <Label>Setor (opcional)</Label>
              <Input
                placeholder="Petróleo, Bancos..."
                value={form.metadata.sector ?? ""}
                onChange={(e) => setMeta({ sector: e.target.value })}
              />
            </div>
          </>
        )}

        {/* FIIs */}
        {form.assetType === "fii" && (
          <>
            <div>
              <Label>Ticker</Label>
              <Input
                placeholder="HGLG11, MXRF11..."
                value={form.ticker}
                onChange={(e) => setField("ticker", e.target.value.toUpperCase())}
              />
              <FieldError message={errors.ticker} />
            </div>
            <div>
              <Label>Nome do fundo</Label>
              <Input
                placeholder="CSHG Logística"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
              <FieldError message={errors.description} />
            </div>
            <div>
              <Label>Quantidade de cotas</Label>
              <Input
                placeholder="15"
                inputMode="decimal"
                value={form.quantity}
                onChange={(e) => setField("quantity", e.target.value)}
              />
              <FieldError message={errors.quantity} />
            </div>
            <div>
              <Label>Dividendo mensal estimado (opcional)</Label>
              <Input
                placeholder="R$ 0,00"
                onChange={(e) => handleMetaCurrency("monthlyDividend", e.target.value)}
              />
            </div>
          </>
        )}

        {/* RENDA FIXA */}
        {form.assetType === "renda_fixa" && (
          <>
            <div>
              <Label>Tipo do produto</Label>
              <Select
                value={form.metadata.productType ?? ""}
                onChange={(e) => setMeta({ productType: e.target.value })}
              >
                <option value="">Selecione...</option>
                {rendaFixaProducts.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Nome / emissor</Label>
              <Input
                placeholder="CDB Banco Inter, Tesouro IPCA+..."
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
              <FieldError message={errors.description} />
            </div>
            <div>
              <Label>Indexador</Label>
              <Select
                value={form.metadata.indexer ?? ""}
                onChange={(e) => setMeta({ indexer: e.target.value })}
              >
                <option value="">Selecione...</option>
                {indexers.map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Taxa / remuneração</Label>
              <Input
                placeholder="110% CDI, IPCA + 6%, 12,5% a.a."
                value={form.metadata.rate ?? ""}
                onChange={(e) => setMeta({ rate: e.target.value })}
              />
            </div>
            <div>
              <Label>Data da aplicação</Label>
              <Input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setField("purchaseDate", e.target.value)}
              />
            </div>
            <div>
              <Label>Data de vencimento</Label>
              <Input
                type="date"
                value={form.metadata.maturityDate ?? ""}
                onChange={(e) => setMeta({ maturityDate: e.target.value })}
              />
            </div>
            <FieldError message={errors.metadata} />
          </>
        )}

        {/* CRIPTO */}
        {form.assetType === "cripto" && (
          <>
            <div>
              <Label>Símbolo</Label>
              <Input
                placeholder="BTC, ETH, SOL..."
                value={form.ticker}
                onChange={(e) => setField("ticker", e.target.value.toUpperCase())}
              />
              <FieldError message={errors.ticker} />
            </div>
            <div>
              <Label>Nome do ativo</Label>
              <Input
                placeholder="Bitcoin, Ethereum..."
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
              <FieldError message={errors.description} />
            </div>
            <div>
              <Label>Quantidade</Label>
              <Input
                placeholder="0,05"
                inputMode="decimal"
                value={form.quantity}
                onChange={(e) => setField("quantity", e.target.value)}
              />
              <FieldError message={errors.quantity} />
            </div>
            <div>
              <Label>Rede / blockchain</Label>
              <Select
                value={form.metadata.network ?? ""}
                onChange={(e) => setMeta({ network: e.target.value })}
              >
                <option value="">Selecione...</option>
                {cryptoNetworks.map((n) => (
                  <option key={n.value} value={n.value}>
                    {n.label}
                  </option>
                ))}
              </Select>
            </div>
          </>
        )}

        {/* FUNDOS */}
        {form.assetType === "fundo" && (
          <>
            <div className="md:col-span-2">
              <Label>Nome do fundo</Label>
              <Input
                placeholder="Trend DI Simples, XP Macro..."
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
              <FieldError message={errors.description} />
            </div>
            <div>
              <Label>CNPJ (opcional)</Label>
              <Input
                placeholder="00.000.000/0001-00"
                value={form.metadata.cnpj ?? ""}
                onChange={(e) => setMeta({ cnpj: e.target.value })}
              />
            </div>
            <div>
              <Label>Gestora (opcional)</Label>
              <Input
                placeholder="XP, BTG, Itaú Asset..."
                value={form.metadata.manager ?? ""}
                onChange={(e) => setMeta({ manager: e.target.value })}
              />
            </div>
            <div>
              <Label>Quantidade de cotas</Label>
              <Input
                placeholder="1000"
                inputMode="decimal"
                value={form.quantity}
                onChange={(e) => setField("quantity", e.target.value)}
              />
              <FieldError message={errors.quantity} />
            </div>
            <div>
              <Label>Código / ticker (opcional)</Label>
              <Input
                placeholder="Código do fundo"
                value={form.ticker}
                onChange={(e) => setField("ticker", e.target.value.toUpperCase())}
              />
            </div>
          </>
        )}

        {/* OUTROS */}
        {form.assetType === "outros" && (
          <>
            <div>
              <Label>Nome do investimento</Label>
              <Input
                placeholder="Ouro, COE, Previdência..."
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
              <FieldError message={errors.description} />
            </div>
            <div>
              <Label>Categoria</Label>
              <Input
                placeholder="Previdência, COE, Ouro..."
                value={form.metadata.category ?? ""}
                onChange={(e) => setMeta({ category: e.target.value })}
              />
            </div>
            <div>
              <Label>Identificador (opcional)</Label>
              <Input
                placeholder="Código ou referência"
                value={form.ticker}
                onChange={(e) => setField("ticker", e.target.value)}
              />
            </div>
          </>
        )}

        {/* Campos comuns (exceto renda fixa que tem datas próprias) */}
        {form.assetType !== "renda_fixa" && (
          <div>
            <Label>Data da {form.assetType === "cripto" ? "compra" : "aplicação"}</Label>
            <Input
              type="date"
              value={form.purchaseDate}
              onChange={(e) => setField("purchaseDate", e.target.value)}
            />
          </div>
        )}

        <div>
          <Label>Valor {form.assetType === "renda_fixa" ? "aplicado" : "investido"}</Label>
          <Input
            placeholder="R$ 0,00"
            value={form.investedDisplay}
            onChange={(e) => handleCurrency("invested", e.target.value)}
          />
          <FieldError message={errors.invested} />
        </div>

        <div>
          <Label>
            Valor atual
            {form.assetType === "renda_fixa" ? " / resgate" : ""} (opcional)
          </Label>
          <Input
            placeholder="R$ 0,00"
            value={form.currentDisplay}
            onChange={(e) => handleCurrency("current", e.target.value)}
          />
        </div>

        <div>
          <Label>{brokerLabel}</Label>
          <Select
            value={form.bankId}
            onChange={(e) => setField("bankId", e.target.value)}
          >
            <option value="">Selecione...</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
          <FieldError message={errors.bankId} />
          {form.bankId && (
            <div className="mt-2">
              <BankLogo
                slug={banks.find((b) => b.id === form.bankId)!.slug}
                name={banks.find((b) => b.id === form.bankId)!.name}
                color={banks.find((b) => b.id === form.bankId)!.color}
                size="sm"
                showName
              />
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <Label>Observações</Label>
          <Textarea
            placeholder="Anotações adicionais..."
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </div>

        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar investimento"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
