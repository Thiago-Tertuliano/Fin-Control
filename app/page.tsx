import Link from "next/link";
import { PlusCircle } from "lucide-react";
import {
  CategoryPieChart,
  DailyAreaChart,
  BankBarChart,
} from "@/components/dashboard/Charts";
import {
  CashFlowBar,
  IncomeCalendar,
  OverviewCards,
  UpcomingBills,
} from "@/components/dashboard/OverviewCards";
import { RecentExpensesList } from "@/components/dashboard/StatCards";
import { PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { getFullDashboard } from "@/lib/services/dashboard";
import { getMonthRange, formatMonthYear } from "@/lib/utils/date";

export default function DashboardPage() {
  const { start, end } = getMonthRange();
  const data = getFullDashboard(start, end);

  const categoryChart = data.expenses.byCategory.map((c) => ({
    name: c.name,
    totalCents: c.totalCents,
    color: c.color,
  }));

  const bankChart = data.expenses.byBank.map((b) => ({
    name: b.name,
    totalCents: b.totalCents,
    color: b.color,
  }));

  return (
    <div className="p-8">
      <PageHeader
        title="Dashboard"
        description={`Visão financeira completa · ${formatMonthYear(new Date())}`}
        action={
          <Link href="/gastos/novo">
            <Button>
              <PlusCircle className="h-4 w-4" />
              Novo gasto
            </Button>
          </Link>
        }
      />

      <OverviewCards
        incomeCents={data.income.totalMonthlyCents}
        expenseCents={data.expenses.totalCents}
        recurringCents={data.recurring.totalMonthlyCents}
        balanceCents={data.balanceCents}
        investedCents={data.investments.totalInvestedCents}
        portfolioCents={data.investments.totalCurrentCents}
        profitCents={data.investments.profitCents}
        profitPct={data.investments.profitPct}
      />

      <div className="mt-6">
        <CashFlowBar
          incomeCents={data.income.totalMonthlyCents}
          expenseCents={data.expenses.totalCents}
          recurringCents={data.recurring.totalMonthlyCents}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <CategoryPieChart data={categoryChart} />
        <DailyAreaChart data={data.expenses.byDay} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <UpcomingBills items={data.recurring.upcoming} />
        <IncomeCalendar items={data.income.calendar} />
        <RecentExpensesList expenses={data.expenses.recent} />
      </div>

      <div className="mt-6">
        <BankBarChart data={bankChart} />
      </div>
    </div>
  );
}
