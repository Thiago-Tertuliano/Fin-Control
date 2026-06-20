"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { BankLogo } from "@/components/ui/BankLogo";
import { SubscriptionLogo, PopularSubscriptionBrands } from "@/components/ui/SubscriptionLogo";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardValue } from "@/components/ui/Card";
import {
  FieldError,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/Input";
import { formatCurrency, parseCurrencyToCents } from "@/lib/utils/currency";
import { paymentMethods } from "@/lib/validators/recurring";
import type { Bank, Category, RecurringExpenseWithRelations } from "@/lib/db/schema";

const methodLabels = Object.fromEntries(
  paymentMethods.map((m) => [m.value, m.label])
);

export function RecurringManager({
  initialItems,
  categories,
  banks,
}: {
  initialItems: RecurringExpenseWithRelations[];
  categories: Category[];
  banks: Bank[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    description: "",
    amountDisplay: "",
    amountCents: 0,
    categoryId: "",
    bankId: "",
    billingDay: "5",
    paymentMethod: "credito",
    notes: "",
  });

  const totalMonthly = items
    .filter((i) => i.active === 1)
    .reduce((s, i) => s + i.amountCents, 0);

  function handleAmount(value: string) {
    const cents = parseCurrencyToCents(value);
    setForm((f) => ({
      ...f,
      amountCents: cents,
      amountDisplay: formatCurrency(cents),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (form.description.length < 2) newErrors.description = "Descrição obrigatória";
    if (form.amountCents <= 0) newErrors.amount = "Valor inválido";
    if (!form.categoryId) newErrors.categoryId = "Selecione categoria";
    if (!form.bankId) newErrors.bankId = "Selecione banco";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description,
          amountCents: form.amountCents,
          categoryId: form.categoryId,
          bankId: form.bankId,
          billingDay: Number(form.billingDay),
          paymentMethod: form.paymentMethod,
          notes: form.notes || null,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({
          description: "",
          amountDisplay: "",
          amountCents: 0,
          categoryId: "",
          bankId: "",
          billingDay: "5",
          paymentMethod: "credito",
          notes: "",
        });
        setErrors({});
        router.refresh();
        const updated = await fetch("/api/recurring").then((r) => r.json());
        setItems(Array.isArray(updated) ? updated : []);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrors({
          form: data.error ?? "Não foi possível salvar a mensalidade",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, active: number) {
    await fetch(`/api/recurring/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: active !== 1 }),
    });
    const updated = await fetch("/api/recurring").then((r) => r.json());
    setItems(updated);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta mensalidade?")) return;
    await fetch(`/api/recurring/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total mensal</CardTitle>
          </CardHeader>
          <CardValue className="text-indigo-400">{formatCurrency(totalMonthly)}</CardValue>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ativas</CardTitle>
          </CardHeader>
          <CardValue>{items.filter((i) => i.active === 1).length}</CardValue>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ticket médio</CardTitle>
          </CardHeader>
          <CardValue>
            {formatCurrency(
              items.filter((i) => i.active === 1).length > 0
                ? Math.round(
                    totalMonthly / items.filter((i) => i.active === 1).length
                  )
                : 0
            )}
          </CardValue>
        </Card>
      </div>

      <div className="mb-6 flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Nova mensalidade
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Nome / serviço</Label>
              <Input
                placeholder="Netflix, Academia, Aluguel..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <FieldError message={errors.description} />
              <div className="mt-3">
                <p className="mb-2 text-xs text-muted">Atalhos populares</p>
                <PopularSubscriptionBrands
                  onSelect={(name) => setForm({ ...form, description: name })}
                />
              </div>
            </div>
            <div>
              <Label>Valor mensal</Label>
              <Input
                placeholder="R$ 0,00"
                value={form.amountDisplay}
                onChange={(e) => handleAmount(e.target.value)}
              />
              <FieldError message={errors.amount} />
            </div>
            <div>
              <Label>Dia do vencimento</Label>
              <Select
                value={form.billingDay}
                onChange={(e) => setForm({ ...form, billingDay: e.target.value })}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Dia {d}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Forma de pagamento</Label>
              <Select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              >
                {paymentMethods.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.categoryId} />
            </div>
            <div>
              <Label>Banco / cartão</Label>
              <Select
                value={form.bankId}
                onChange={(e) => setForm({ ...form, bankId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.bankId} />
            </div>
            <div className="md:col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <FieldError message={errors.form} />
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar mensalidade"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-5 py-4">Serviço</th>
                <th className="px-5 py-4">Vencimento</th>
                <th className="px-5 py-4">Categoria</th>
                <th className="px-5 py-4">Banco</th>
                <th className="px-5 py-4">Pagamento</th>
                <th className="px-5 py-4 text-right">Valor/mês</th>
                <th className="px-5 py-4 text-right">Status</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-border/50 hover:bg-card-hover/50 ${item.active !== 1 ? "opacity-50" : ""}`}
                >
                  <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <SubscriptionLogo description={item.description} size="sm" />
                    <span className="font-medium">{item.description}</span>
                  </div>
                </td>
                  <td className="px-5 py-4">
                    <Badge className="bg-indigo-500/15 text-indigo-300">
                      Dia {item.billingDay}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <CategoryIcon
                        icon={item.category.icon}
                        color={item.category.color}
                        size="sm"
                      />
                      {item.category.name}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <BankLogo
                      slug={item.bank.slug}
                      name={item.bank.name}
                      color={item.bank.color}
                      size="sm"
                    />
                  </td>
                  <td className="px-5 py-4 text-muted">
                    {methodLabels[item.paymentMethod]}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-indigo-300">
                    {formatCurrency(item.amountCents)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => toggleActive(item.id, item.active)}
                      className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground"
                    >
                      {item.active === 1 ? (
                        <>
                          <ToggleRight className="h-5 w-5 text-accent" /> Ativa
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-5 w-5" /> Pausada
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted hover:text-danger" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
