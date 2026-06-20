import { ExpenseWizard } from "@/components/expenses/ExpenseWizard";
import { PageHeader } from "@/components/layout/AppShell";
import { listBanks, listCategories } from "@/lib/services/expense";

export default function NovoGastoPage() {
  const categories = listCategories();
  const banks = listBanks();

  return (
    <div className="p-8">
      <PageHeader
        title="Novo gasto"
        description="Cadastre um lançamento em 4 passos simples"
      />
      <ExpenseWizard categories={categories} banks={banks} />
    </div>
  );
}
