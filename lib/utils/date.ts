import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  subMonths,
  isValid,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDateBR(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return format(d, "dd/MM/yyyy", { locale: ptBR });
}

export function formatMonthYear(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return format(d, "MMMM yyyy", { locale: ptBR });
}

export function getMonthRange(monthRef: Date = new Date()) {
  const start = format(startOfMonth(monthRef), "yyyy-MM-dd");
  const end = format(endOfMonth(monthRef), "yyyy-MM-dd");
  return { start, end };
}

export function getPreviousMonthRange(monthRef: Date = new Date()) {
  const prev = subMonths(monthRef, 1);
  return getMonthRange(prev);
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}
