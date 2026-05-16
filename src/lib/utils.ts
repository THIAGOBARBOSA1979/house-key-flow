
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Utility for merging tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Common date formatter
 */
export const formatDate = (date: Date | string | number | null | undefined) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Data inválida";
  return d.toLocaleDateString('pt-BR');
};

/**
 * Safe date formatter for date-fns format function
 */
export function safeFormat(
  date: Date | string | number | null | undefined,
  formatStr: string,
  options?: any
) {
  if (!date) return "—";
  const d = new Date(date);
  if (!isValid(d)) return "—";
  
  return format(d, formatStr, { locale: ptBR, ...options });
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, length: number) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Currency formatter
 */
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
