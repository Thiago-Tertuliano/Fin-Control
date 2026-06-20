"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { InvestmentForm } from "@/components/investments/InvestmentForm";
import { BankLogo } from "@/components/ui/BankLogo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardValue } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateBR } from "@/lib/utils/date";
import {
  assetLabels,
  assetTypes,
  formatInvestmentDetails,
  parseInvestmentMetadata,
} from "@/lib/investments/config";
import type { Bank, InvestmentWithRelations } from "@/lib/db/schema";

export function InvestmentManager({
  initialItems,
  banks,
}: {
  initialItems: InvestmentWithRelations[];
  banks: Bank[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [showForm, setShowForm] = useState(false);

  const totalInvested = items.reduce((s, i) => s + i.amountInvestedCents, 0);
  const totalCurrent = items.reduce(
    (s, i) => s + (i.currentValueCents ?? i.amountInvestedCents),
    0
  );
  const profit = totalCurrent - totalInvested;

  async function refreshItems() {
    const updated = await fetch("/api/investments").then((r) => r.json());
    setItems(updated);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este investimento?")) return;
    await fetch(`/api/investments/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total investido</CardTitle>
          </CardHeader>
          <CardValue>{formatCurrency(totalInvested)}</CardValue>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Valor atual</CardTitle>
          </CardHeader>
          <CardValue className="text-amber-400">{formatCurrency(totalCurrent)}</CardValue>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rentabilidade</CardTitle>
            {profit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-accent" />
            ) : (
              <TrendingDown className="h-4 w-4 text-danger" />
            )}
          </CardHeader>
          <CardValue className={profit >= 0 ? "text-accent" : "text-danger"}>
            {profit >= 0 ? "+" : ""}
            {formatCurrency(profit)}
          </CardValue>
        </Card>
      </div>

      <div className="mb-6 flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Novo investimento
        </Button>
      </div>

      {showForm && (
        <InvestmentForm
          banks={banks}
          onSuccess={() => {
            setShowForm(false);
            refreshItems();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-5 py-4">Ativo</th>
                <th className="px-5 py-4">Detalhes</th>
                <th className="px-5 py-4">Corretora</th>
                <th className="px-5 py-4">Aplicação</th>
                <th className="px-5 py-4 text-right">Investido</th>
                <th className="px-5 py-4 text-right">Atual</th>
                <th className="px-5 py-4 text-right">Resultado</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const meta = parseInvestmentMetadata(item.metadata);
                const details = formatInvestmentDetails(
                  item.assetType,
                  meta,
                  item.quantity
                );
                const typeConfig = assetTypes.find((t) => t.value === item.assetType);
                const current = item.currentValueCents ?? item.amountInvestedCents;
                const diff = current - item.amountInvestedCents;
                const diffPct =
                  item.amountInvestedCents > 0
                    ? ((diff / item.amountInvestedCents) * 100).toFixed(1)
                    : "0";

                return (
                  <tr
                    key={item.id}
                    className="border-b border-border/50 hover:bg-card-hover/50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: typeConfig?.color ?? "#64748B" }}
                        />
                        <div>
                          <p className="font-medium">{item.description}</p>
                          {item.ticker && (
                            <p className="text-xs font-mono text-muted">{item.ticker}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        className="mb-1.5"
                        style={{
                          backgroundColor: `${typeConfig?.color ?? "#64748B"}22`,
                          color: typeConfig?.color ?? "#94A3B8",
                        }}
                      >
                        {assetLabels[item.assetType] ?? item.assetType}
                      </Badge>
                      {details.length > 0 && (
                        <div className="space-y-0.5">
                          {details.map((line) => (
                            <p key={line} className="text-xs text-muted">
                              {line}
                            </p>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <BankLogo
                        slug={item.bank.slug}
                        name={item.bank.name}
                        color={item.bank.color}
                        size="sm"
                        showName
                      />
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {formatDateBR(item.purchaseDate)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {formatCurrency(item.amountInvestedCents)}
                    </td>
                    <td className="px-5 py-4 text-right font-medium">
                      {formatCurrency(current)}
                    </td>
                    <td
                      className={`px-5 py-4 text-right font-semibold ${diff >= 0 ? "text-accent" : "text-danger"}`}
                    >
                      {diff >= 0 ? "+" : ""}
                      {formatCurrency(diff)} ({diffPct}%)
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-muted hover:text-danger" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
