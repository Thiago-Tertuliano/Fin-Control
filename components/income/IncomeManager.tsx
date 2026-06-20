"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { BankLogo } from "@/components/ui/BankLogo";
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
import { incomeTypes } from "@/lib/validators/income";
import type { Bank, IncomeSourceWithRelations } from "@/lib/db/schema";

const typeLabels = Object.fromEntries(incomeTypes.map((t) => [t.value, t.label]));

export function IncomeManager({
  initialItems,
  banks,
}: {
  initialItems: IncomeSourceWithRelations[];
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
    incomeType: "salario",
    bankId: "",
    payDay: "5",
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
    if (!form.bankId) newErrors.bankId = "Selecione banco de recebimento";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description,
          amountCents: form.amountCents,
          incomeType: form.incomeType,
          bankId: form.bankId,
          payDay: Number(form.payDay),
          notes: form.notes || null,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        router.refresh();
        const updated = await fetch("/api/income").then((r) => r.json());
        setItems(updated);
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, active: number) {
    await fetch(`/api/income/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: active !== 1 }),
    });
    const updated = await fetch("/api/income").then((r) => r.json());
    setItems(updated);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta fonte de renda?")) return;
    await fetch(`/api/income/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Renda mensal total</CardTitle>
          </CardHeader>
          <CardValue className="text-emerald-400">{formatCurrency(totalMonthly)}</CardValue>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fontes ativas</CardTitle>
          </CardHeader>
          <CardValue>{items.filter((i) => i.active === 1).length}</CardValue>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Próximo recebimento</CardTitle>
          </CardHeader>
          <CardValue className="text-base">
            {items.filter((i) => i.active === 1).length > 0
              ? `Dia ${[...items].filter((i) => i.active === 1).sort((a, b) => a.payDay - b.payDay)[0]?.payDay}`
              : "—"}
          </CardValue>
        </Card>
      </div>

      <div className="mb-6 flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Nova renda
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Descrição</Label>
              <Input
                placeholder="Salário CLT, Freelance..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <FieldError message={errors.description} />
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
              <Label>Tipo de renda</Label>
              <Select
                value={form.incomeType}
                onChange={(e) => setForm({ ...form, incomeType: e.target.value })}
              >
                {incomeTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Dia que cai na conta</Label>
              <Select
                value={form.payDay}
                onChange={(e) => setForm({ ...form, payDay: e.target.value })}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Dia {d}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Banco de recebimento</Label>
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
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar renda"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Calendário visual */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Calendário do mês — quando cai cada renda</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: 31 }, (_, i) => {
            const day = i + 1;
            const dayIncomes = items.filter(
              (item) => item.active === 1 && item.payDay === day
            );
            return (
              <div
                key={day}
                className={`rounded-lg border p-2 text-center ${
                  dayIncomes.length > 0
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-border/50 bg-background/40"
                }`}
              >
                <p className="text-xs text-muted">{day}</p>
                {dayIncomes.map((inc) => (
                  <p
                    key={inc.id}
                    className="mt-1 truncate text-[10px] font-medium text-emerald-400"
                    title={inc.description}
                  >
                    {inc.description.split(" ")[0]}
                  </p>
                ))}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-5 py-4">Descrição</th>
                <th className="px-5 py-4">Tipo</th>
                <th className="px-5 py-4">Dia pagamento</th>
                <th className="px-5 py-4">Banco</th>
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
                  <td className="px-5 py-4 font-medium">{item.description}</td>
                  <td className="px-5 py-4">
                    <Badge className="bg-emerald-500/15 text-emerald-300">
                      {typeLabels[item.incomeType]}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge className="bg-emerald-500/15 text-emerald-300">
                      Dia {item.payDay}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <BankLogo
                      slug={item.bank.slug}
                      name={item.bank.name}
                      color={item.bank.color}
                      size="sm"
                      showName
                    />
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-emerald-400">
                    +{formatCurrency(item.amountCents)}
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
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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
