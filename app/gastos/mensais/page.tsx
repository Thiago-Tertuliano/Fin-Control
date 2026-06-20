import { RecurringManager } from "@/components/recurring/RecurringManager";
import { PageHeader } from "@/components/layout/AppShell";
import { listBanks, listCategories } from "@/lib/services/expense";
import { listRecurringExpenses } from "@/lib/services/recurring";

export default function GastosMensaisPage() {
  const items = listRecurringExpenses();
  const categories = listCategories();
  const banks = listBanks();

  return (
    <div className="p-8">
      <PageHeader
        title="Gastos mensais"
        description="Assinaturas, planos e despesas fixas recorrentes"
      />
      <RecurringManager
        initialItems={items}
        categories={categories}
        banks={banks}
      />
    </div>
  );
}
