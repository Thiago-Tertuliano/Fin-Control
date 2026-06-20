"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Search } from "lucide-react";
import { BankLogo } from "@/components/ui/BankLogo";
import { SubscriptionLogo } from "@/components/ui/SubscriptionLogo";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateBR } from "@/lib/utils/date";
import {
  formatPaymentLabel,
  paymentMethods,
} from "@/lib/validators/expense";
import type { Bank, Category } from "@/lib/db/schema";
import type { ExpenseWithRelations } from "@/lib/db/schema";

export function ExpenseFilters({
  categories,
  banks,
  onFilter,
}: {
  categories: Category[];
  banks: Bank[];
  onFilter: (filters: Record<string, string>) => void;
}) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [bankId, setBankId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  function apply() {
    onFilter({
      ...(search && { search }),
      ...(categoryId && { categoryId }),
      ...(bankId && { bankId }),
      ...(paymentMethod && { paymentMethod }),
    });
  }

  function clear() {
    setSearch("");
    setCategoryId("");
    setBankId("");
    setPaymentMethod("");
    onFilter({});
  }

  return (
    <Card className="mb-6">
      <div className="grid gap-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <Label>Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-10"
              placeholder="Descrição do gasto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && apply()}
            />
          </div>
        </div>
        <div>
          <Label>Categoria</Label>
          <Select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Banco</Label>
          <Select value={bankId} onChange={(e) => setBankId(e.target.value)}>
            <option value="">Todos</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Pagamento</Label>
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="">Todos</option>
            {paymentMethods.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={apply}>Filtrar</Button>
        <Button variant="ghost" onClick={clear}>
          Limpar
        </Button>
      </div>
    </Card>
  );
}

export function ExpenseTable({
  expenses,
  onDeleted,
}: {
  expenses: ExpenseWithRelations[];
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Excluir este gasto?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      onDeleted?.();
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  if (expenses.length === 0) {
    return (
      <Card className="py-16 text-center">
        <p className="text-muted">Nenhum gasto encontrado.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="px-5 py-4 font-medium">Descrição</th>
              <th className="px-5 py-4 font-medium">Categoria</th>
              <th className="px-5 py-4 font-medium">Banco</th>
              <th className="px-5 py-4 font-medium">Pagamento</th>
              <th className="px-5 py-4 font-medium">Data</th>
              <th className="px-5 py-4 font-medium text-right">Valor</th>
              <th className="px-5 py-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className="border-b border-border/50 transition-colors hover:bg-card-hover/50"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <SubscriptionLogo description={expense.description} size="sm" />
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      {expense.notes && (
                        <p className="text-xs text-muted">{expense.notes}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <CategoryIcon
                      icon={expense.category.icon}
                      color={expense.category.color}
                      size="sm"
                    />
                    <span>{expense.category.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <BankLogo
                    slug={expense.bank.slug}
                    name={expense.bank.name}
                    color={expense.bank.color}
                    size="sm"
                    showName
                  />
                </td>
                <td className="px-5 py-4">
                  <Badge className="bg-card-hover text-muted">
                    {formatPaymentLabel(
                      expense.paymentMethod,
                      expense.installments
                    )}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-muted">
                  {formatDateBR(expense.date)}
                </td>
                <td className="px-5 py-4 text-right font-semibold text-danger">
                  -{formatCurrency(expense.amountCents)}
                </td>
                <td className="px-5 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(expense.id)}
                    disabled={deleting === expense.id}
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4 text-muted hover:text-danger" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border px-5 py-3 text-xs text-muted">
        {expenses.length} lançamento(s) · Total:{" "}
        <span className="font-semibold text-foreground">
          {formatCurrency(
            expenses.reduce((s, e) => s + e.amountCents, 0)
          )}
        </span>
      </div>
    </Card>
  );
}
