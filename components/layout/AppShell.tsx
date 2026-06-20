"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Repeat,
  TrendingUp,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navSections = [
  {
    label: "Visão geral",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Gastos",
    items: [
      { href: "/gastos", label: "Lançamentos", icon: Receipt },
      { href: "/gastos/mensais", label: "Mensalidades", icon: Repeat },
    ],
  },
  {
    label: "Finanças",
    items: [
      { href: "/renda", label: "Renda", icon: Banknote },
      { href: "/investimentos", label: "Investimentos", icon: TrendingUp },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/gastos") return pathname === "/gastos";
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15">
          <Wallet className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">FinControl</p>
          <p className="text-xs text-muted">Gestão pessoal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted/70">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(pathname, href)
                      ? "bg-accent/15 text-accent"
                      : "text-muted hover:bg-card hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-xl bg-card/80 p-4">
          <p className="text-xs leading-relaxed text-muted">
            Controle gastos avulsos, mensalidades, renda e investimentos em um só lugar.
          </p>
        </div>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <main className="grid-bg min-h-screen">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
