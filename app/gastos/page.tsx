"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { ExpenseFilters, ExpenseTable } from "@/components/expenses/ExpenseList";
import { PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { getMonthRange } from "@/lib/utils/date";
import type { Bank, Category, ExpenseWithRelations } from "@/lib/db/schema";

export default function GastosPage() {
  const [expenses, setExpenses] = useState<ExpenseWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = useCallback(async (filters: Record<string, string> = {}) => {
    setLoading(true);
    try {
      const { start, end } = getMonthRange();
      const params = new URLSearchParams({ start, end, ...filters });
      const res = await fetch(`/api/expenses?${params}`);
      const data = await res.json();
      setExpenses(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const [catRes, bankRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/banks"),
      ]);
      setCategories(await catRes.json());
      setBanks(await bankRes.json());
      await loadExpenses();
    }
    init();
  }, [loadExpenses]);

  return (
    <div className="p-8">
      <PageHeader
        title="Gastos"
        description="Todos os lançamentos do mês atual"
        action={
          <Link href="/gastos/novo">
            <Button>
              <PlusCircle className="h-4 w-4" />
              Novo gasto
            </Button>
          </Link>
        }
      />

      <ExpenseFilters
        categories={categories}
        banks={banks}
        onFilter={loadExpenses}
      />

      {loading ? (
        <div className="py-16 text-center text-sm text-muted">
          Carregando gastos...
        </div>
      ) : (
        <ExpenseTable expenses={expenses} onDeleted={() => loadExpenses()} />
      )}
    </div>
  );
}
