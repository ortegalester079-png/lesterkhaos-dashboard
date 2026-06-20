import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases de Tailwind resolviendo conflictos. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea números grandes: 12500 -> "12.5K". */
export function formatNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (Math.abs(value) >= 1_000) {
    return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return String(value);
}

/** Porcentaje con un decimal. */
export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

/** Mediana de un arreglo numérico. */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Fecha legible en español (ej. "16 jun"). */
export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

/** Fecha + hora (ej. "16 jun, 19:30"). */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** ID corto único para registros nuevos creados en cliente. */
export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
