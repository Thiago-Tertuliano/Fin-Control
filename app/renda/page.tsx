import { IncomeManager } from "@/components/income/IncomeManager";
import { PageHeader } from "@/components/layout/AppShell";
import { listBanks } from "@/lib/services/expense";
import { listIncomeSources } from "@/lib/services/income";

export default function RendaPage() {
  const items = listIncomeSources();
  const banks = listBanks();

  return (
    <div className="p-8">
      <PageHeader
        title="Renda"
        description="Salários, freelances e outras fontes de entrada mensal"
      />
      <IncomeManager initialItems={items} banks={banks} />
    </div>
  );
}
