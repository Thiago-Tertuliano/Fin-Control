"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  PiggyBank,
  Repeat,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardValue } from "@/components/ui/Card";
import { BankLogo } from "@/components/ui/BankLogo";
import { SubscriptionLogo } from "@/components/ui/SubscriptionLogo";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

type OverviewProps = {
  incomeCents: number;
  expenseCents: number;
  recurringCents: number;
  balanceCents: number;
  investedCents: number;
  portfolioCents: number;
  profitCents: number;
  profitPct: string;
};

export function OverviewCards({
  incomeCents,
  expenseCents,
  recurringCents,
  balanceCents,
  investedCents,
  portfolioCents,
  profitCents,
  profitPct,
}: OverviewProps) {
  const totalOutflow = expenseCents + recurringCents;
  const positiveBalance = balanceCents >= 0;

  const cards = [
    {
      title: "Renda mensal",
      value: formatCurrency(incomeCents),
      icon: ArrowUpRight,
      accent: "text-emerald-400",
      bg: "bg-emerald-500/10",
      sub: "Salários e entradas fixas",
    },
    {
      title: "Gastos do mês",
      value: formatCurrency(expenseCents),
      icon: ArrowDownRight,
      accent: "text-red-400",
      bg: "bg-red-500/10",
      sub: "Lançamentos avulsos",
    },
    {
      title: "Mensalidades",
      value: formatCurrency(recurringCents),
      icon: Repeat,
      accent: "text-indigo-400",
      bg: "bg-indigo-500/10",
      sub: "Assinaturas e planos fixos",
    },
    {
      title: "Saldo estimado",
      value: formatCurrency(balanceCents),
      icon: Wallet,
      accent: positiveBalance ? "text-accent" : "text-red-400",
      bg: positiveBalance ? "bg-accent/10" : "bg-red-500/10",
      sub: `Renda − gastos − mensalidades (${formatCurrency(totalOutflow)})`,
    },
    {
      title: "Carteira investida",
      value: formatCurrency(portfolioCents),
      icon: TrendingUp,
      accent: "text-amber-400",
      bg: "bg-amber-500/10",
      sub: `Aportado: ${formatCurrency(investedCents)} · ${profitCents >= 0 ? "+" : ""}${profitPct}%`,
    },
    {
      title: "Comprometimento",
      value: incomeCents > 0 ? `${((totalOutflow / incomeCents) * 100).toFixed(0)}%` : "—",
      icon: CalendarClock,
      accent: "text-blue-400",
      bg: "bg-blue-500/10",
      sub: "Da renda comprometida com saídas",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
            <div className={cn("rounded-xl p-2", card.bg)}>
              <card.icon className={cn("h-4 w-4", card.accent)} />
            </div>
          </CardHeader>
          <CardValue className={card.accent}>{card.value}</CardValue>
          <p className="mt-2 text-xs text-muted">{card.sub}</p>
        </Card>
      ))}
    </div>
  );
}

export function CashFlowBar({
  incomeCents,
  expenseCents,
  recurringCents,
}: {
  incomeCents: number;
  expenseCents: number;
  recurringCents: number;
}) {
  const total = incomeCents || 1;
  const expensePct = (expenseCents / total) * 100;
  const recurringPct = (recurringCents / total) * 100;
  const freePct = Math.max(0, 100 - expensePct - recurringPct);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de caixa mensal</CardTitle>
        <PiggyBank className="h-4 w-4 text-muted" />
      </CardHeader>
      <div className="mb-4 flex h-4 overflow-hidden rounded-full">
        <div
          className="bg-red-500/80 transition-all"
          style={{ width: `${expensePct}%` }}
          title={`Gastos: ${expensePct.toFixed(0)}%`}
        />
        <div
          className="bg-indigo-500/80 transition-all"
          style={{ width: `${recurringPct}%` }}
          title={`Mensalidades: ${recurringPct.toFixed(0)}%`}
        />
        <div
          className="bg-accent/80 transition-all"
          style={{ width: `${freePct}%` }}
          title={`Disponível: ${freePct.toFixed(0)}%`}
        />
      </div>
      <div className="flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          Gastos avulsos · {formatCurrency(expenseCents)}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500/80" />
          Mensalidades · {formatCurrency(recurringCents)}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
          Disponível · {formatCurrency(incomeCents - expenseCents - recurringCents)}
        </span>
      </div>
    </Card>
  );
}

export function UpcomingBills({
  items,
}: {
  items: Array<{
    id: string;
    description: string;
    amountCents: number;
    billingDay: number;
    bank: { name: string; color: string; slug: string };
  }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos vencimentos</CardTitle>
      </CardHeader>
      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">Nenhuma mensalidade ativa</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-card-hover"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-col items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <span className="text-[10px] leading-none">DIA</span>
                  <span className="text-sm font-bold leading-none">{item.billingDay}</span>
                </div>
                <SubscriptionLogo description={item.description} size="sm" />
                <div>
                  <p className="text-sm font-medium">{item.description}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <BankLogo
                      slug={item.bank.slug}
                      name={item.bank.name}
                      color={item.bank.color}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
              <span className="text-sm font-semibold text-indigo-300">
                {formatCurrency(item.amountCents)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function IncomeCalendar({
  items,
}: {
  items: Array<{
    id: string;
    description: string;
    amountCents: number;
    payDay: number;
    incomeType: string;
    bank: { name: string };
  }>;
}) {
  const typeLabels: Record<string, string> = {
    salario: "Salário",
    freelance: "Freelance",
    aluguel: "Aluguel",
    dividendos: "Dividendos",
    outros: "Outros",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendário de recebimentos</CardTitle>
      </CardHeader>
      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">Nenhuma renda cadastrada</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-card-hover"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-col items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <span className="text-[10px] leading-none">DIA</span>
                  <span className="text-sm font-bold leading-none">{item.payDay}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{item.description}</p>
                  <p className="text-xs text-muted">
                    {typeLabels[item.incomeType] ?? item.incomeType} · {item.bank.name}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-emerald-400">
                +{formatCurrency(item.amountCents)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
