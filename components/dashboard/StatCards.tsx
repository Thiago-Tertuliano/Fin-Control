"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardValue } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

export function StatCards({
  totalCents,
  count,
  avgCents,
  previousTotalCents,
}: {
  totalCents: number;
  count: number;
  avgCents: number;
  previousTotalCents?: number;
}) {
  const diff =
    previousTotalCents !== undefined
      ? totalCents - previousTotalCents
      : undefined;
  const diffPct =
    previousTotalCents && previousTotalCents > 0 && diff !== undefined
      ? ((diff / previousTotalCents) * 100).toFixed(1)
      : null;

  const cards = [
    {
      title: "Total do mês",
      value: formatCurrency(totalCents),
      icon: Wallet,
      accent: "text-accent",
      bg: "bg-accent/10",
      trend: diff,
    },
    {
      title: "Lançamentos",
      value: String(count),
      icon: Receipt,
      accent: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Ticket médio",
      value: formatCurrency(avgCents),
      icon: TrendingDown,
      accent: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
            <div className={cn("rounded-xl p-2", card.bg)}>
              <card.icon className={cn("h-4 w-4", card.accent)} />
            </div>
          </CardHeader>
          <CardValue>{card.value}</CardValue>
          {card.trend !== undefined && diffPct !== null && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1 text-xs",
                card.trend > 0 ? "text-danger" : "text-accent"
              )}
            >
              {card.trend > 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {Math.abs(Number(diffPct))}% vs mês anterior
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

export function RecentExpensesList({
  expenses,
}: {
  expenses: Array<{
    id: string;
    description: string;
    amountCents: number;
    date: string;
    category: { name: string; color: string; icon: string };
    bank: { name: string; slug: string; color: string };
  }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos lançamentos</CardTitle>
        <Link href="/gastos" className="text-xs text-accent hover:underline">
          Ver todos
        </Link>
      </CardHeader>
      {expenses.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          Nenhum gasto registrado ainda.
        </p>
      ) : (
        <div className="space-y-1">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-card-hover"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: expense.category.color }}
                />
                <div>
                  <p className="text-sm font-medium">{expense.description}</p>
                  <p className="text-xs text-muted">
                    {expense.category.name} · {expense.bank.name}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-danger">
                -{formatCurrency(expense.amountCents)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
