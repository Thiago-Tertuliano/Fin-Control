import { getDashboardData as getExpenseDashboard } from "@/lib/services/expense";
import { getIncomeSummary } from "@/lib/services/income";
import { getInvestmentSummary } from "@/lib/services/investment";
import { getRecurringSummary } from "@/lib/services/recurring";

export function getFullDashboard(start: string, end: string) {
  const expenses = getExpenseDashboard(start, end);
  const recurring = getRecurringSummary();
  const income = getIncomeSummary();
  const investments = getInvestmentSummary();

  const totalOutflowCents =
    expenses.totalCents + recurring.totalMonthlyCents;
  const balanceCents = income.totalMonthlyCents - totalOutflowCents;

  return {
    expenses,
    recurring,
    income,
    investments,
    totalOutflowCents,
    balanceCents,
  };
}
