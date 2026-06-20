"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  FileText,
  Tag,
} from "lucide-react";
import { BankLogo } from "@/components/ui/BankLogo";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  FieldError,
  Input,
  Label,
  Textarea,
} from "@/components/ui/Input";
import { formatCurrency, parseCurrencyToCents } from "@/lib/utils/currency";
import { todayISO } from "@/lib/utils/date";
import { cardPaymentMethods, formatPaymentLabel } from "@/lib/validators/expense";
import type { Bank, Category } from "@/lib/db/schema";
import { cn } from "@/lib/utils/cn";

const STEPS = [
  { id: 1, title: "Valor e descrição", icon: FileText },
  { id: 2, title: "Categoria", icon: Tag },
  { id: 3, title: "Banco e pagamento", icon: CreditCard },
  { id: 4, title: "Confirmar", icon: Check },
];

type FormState = {
  description: string;
  amountDisplay: string;
  amountCents: number;
  categoryId: string;
  bankId: string;
  date: string;
  paymentMethod: string;
  installments: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export function ExpenseWizard({
  categories,
  banks,
}: {
  categories: Category[];
  banks: Bank[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<FormState>({
    description: "",
    amountDisplay: "",
    amountCents: 0,
    categoryId: "",
    bankId: "",
    date: todayISO(),
    paymentMethod: "debito",
    installments: "",
    notes: "",
  });

  const selectedBank = banks.find((b) => b.id === form.bankId);
  const isCashBank = selectedBank?.slug === "dinheiro";

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function selectBank(bankId: string) {
    const bank = banks.find((b) => b.id === bankId);
    if (bank?.slug === "dinheiro") {
      setForm((prev) => ({
        ...prev,
        bankId,
        paymentMethod: "dinheiro",
        installments: "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        bankId,
        paymentMethod: prev.paymentMethod === "dinheiro" ? "debito" : prev.paymentMethod,
        installments: prev.paymentMethod === "credito" ? prev.installments : "",
      }));
    }
    setErrors((prev) => ({
      ...prev,
      bankId: undefined,
      paymentMethod: undefined,
      installments: undefined,
    }));
  }

  function selectPaymentMethod(method: string) {
    setForm((prev) => ({
      ...prev,
      paymentMethod: method,
      installments: method === "credito" ? prev.installments : "",
    }));
    setErrors((prev) => ({
      ...prev,
      paymentMethod: undefined,
      installments: undefined,
    }));
  }

  function handleAmountChange(value: string) {
    const cents = parseCurrencyToCents(value);
    update("amountCents", cents);
    update("amountDisplay", formatCurrency(cents));
  }

  function validateStep(): boolean {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (form.description.trim().length < 2) {
        newErrors.description = "Informe uma descrição válida";
      }
      if (form.amountCents <= 0) {
        newErrors.amountDisplay = "Informe um valor maior que zero";
      }
      if (!form.date) {
        newErrors.date = "Informe a data";
      }
    }

    if (step === 2 && !form.categoryId) {
      newErrors.categoryId = "Selecione uma categoria";
    }

    if (step === 3) {
      if (!form.bankId) newErrors.bankId = "Selecione um banco";
      if (!isCashBank) {
        if (!form.paymentMethod || form.paymentMethod === "dinheiro") {
          newErrors.paymentMethod = "Selecione a forma de pagamento";
        }
        if (form.paymentMethod === "credito") {
          const n = parseInt(form.installments, 10);
          if (!n || n < 1) {
            newErrors.installments = "Informe o número de parcelas";
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, 4));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function submit() {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description.trim(),
          amountCents: form.amountCents,
          categoryId: form.categoryId,
          bankId: form.bankId,
          date: form.date,
          paymentMethod: isCashBank ? "dinheiro" : form.paymentMethod,
          installments:
            !isCashBank && form.paymentMethod === "credito"
              ? parseInt(form.installments, 10)
              : null,
          notes: form.notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Erro ao salvar");
        return;
      }

      router.push("/gastos");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const methodLabel = formatPaymentLabel(
    isCashBank ? "dinheiro" : form.paymentMethod,
    form.paymentMethod === "credito" ? parseInt(form.installments, 10) || null : null
  );

  return (
    <div className="mx-auto max-w-3xl">
      {/* Stepper */}
      <div className="mb-8 flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  step >= s.id
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border text-muted"
                )}
              >
                {step > s.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <s.icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "hidden text-xs sm:block",
                  step >= s.id ? "text-foreground" : "text-muted"
                )}
              >
                {s.title}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1",
                  step > s.id ? "bg-accent" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="description">Descrição do gasto</Label>
              <Input
                id="description"
                placeholder="Ex: Supermercado, Uber, Netflix..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                autoFocus
              />
              <FieldError message={errors.description} />
            </div>
            <div>
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                placeholder="R$ 0,00"
                value={form.amountDisplay}
                onChange={(e) => handleAmountChange(e.target.value)}
              />
              <FieldError message={errors.amountDisplay} />
            </div>
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
              <FieldError message={errors.date} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-4 text-sm text-muted">
              Selecione a categoria que melhor descreve este gasto
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => update("categoryId", category.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                    form.categoryId === category.id
                      ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                      : "border-border hover:border-accent/40 hover:bg-card-hover"
                  )}
                >
                  <CategoryIcon
                    icon={category.icon}
                    color={category.color}
                  />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>
            <FieldError message={errors.categoryId} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <Label>Banco / conta</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {banks.map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => selectBank(bank.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                      form.bankId === bank.id
                        ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                        : "border-border hover:border-accent/40 hover:bg-card-hover"
                    )}
                  >
                    <BankLogo
                      slug={bank.slug}
                      name={bank.name}
                      color={bank.color}
                      size="sm"
                      showName
                      className="min-w-0 flex-1"
                    />
                  </button>
                ))}
              </div>
              <FieldError message={errors.bankId} />
            </div>

            {!isCashBank && (
              <>
                <div>
                  <Label>Forma de pagamento</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {cardPaymentMethods.map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => selectPaymentMethod(method.value)}
                        className={cn(
                          "rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                          form.paymentMethod === method.value
                            ? "border-accent bg-accent/10 text-accent ring-2 ring-accent/30"
                            : "border-border text-muted hover:border-accent/40 hover:bg-card-hover hover:text-foreground"
                        )}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                  <FieldError message={errors.paymentMethod} />
                </div>

                {form.paymentMethod === "credito" && (
                  <div>
                    <Label htmlFor="installments">Parcelas</Label>
                    <Input
                      id="installments"
                      type="number"
                      min={1}
                      max={48}
                      placeholder="Ex: 3"
                      value={form.installments}
                      onChange={(e) => update("installments", e.target.value)}
                    />
                    <FieldError message={errors.installments} />
                  </div>
                )}
              </>
            )}

            <div>
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Detalhes adicionais..."
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-muted">Revise os dados antes de confirmar</p>
            <div className="rounded-xl border border-border bg-background/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted">Descrição</span>
                <span className="font-medium">{form.description}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Valor</span>
                <span className="text-xl font-semibold text-danger">
                  -{formatCurrency(form.amountCents)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Data</span>
                <span>{form.date.split("-").reverse().join("/")}</span>
              </div>
              {selectedCategory && (
                <div className="flex items-center justify-between">
                  <span className="text-muted">Categoria</span>
                  <div className="flex items-center gap-2">
                    <CategoryIcon
                      icon={selectedCategory.icon}
                      color={selectedCategory.color}
                      size="sm"
                    />
                    {selectedCategory.name}
                  </div>
                </div>
              )}
              {selectedBank && (
                <div className="flex items-center justify-between">
                  <span className="text-muted">Banco</span>
                  <BankLogo
                    slug={selectedBank.slug}
                    name={selectedBank.name}
                    color={selectedBank.color}
                    size="sm"
                    showName
                  />
                </div>
              )}
              {!isCashBank && (
                <div className="flex items-center justify-between">
                  <span className="text-muted">Pagamento</span>
                  <span>{methodLabel}</span>
                </div>
              )}
              {form.notes && (
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted shrink-0">Observações</span>
                  <span className="text-right text-sm">{form.notes}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <Button
            variant="ghost"
            onClick={step === 1 ? () => router.back() : back}
            disabled={loading}
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 1 ? "Cancelar" : "Voltar"}
          </Button>

          {step < 4 ? (
            <Button onClick={next}>
              Continuar
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={loading}>
              {loading ? "Salvando..." : "Confirmar lançamento"}
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
