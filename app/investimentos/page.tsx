import { InvestmentManager } from "@/components/investments/InvestmentManager";
import { PageHeader } from "@/components/layout/AppShell";
import { listBanks } from "@/lib/services/expense";
import { listInvestments } from "@/lib/services/investment";

export default function InvestimentosPage() {
  const items = listInvestments();
  const banks = listBanks();

  return (
    <div className="p-8">
      <PageHeader
        title="Investimentos"
        description="Carteira de ações, FIIs, renda fixa e outros ativos"
      />
      <InvestmentManager initialItems={items} banks={banks} />
    </div>
  );
}
