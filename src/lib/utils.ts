
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
  if (isNaN(d.getTime())) return "Data inválida";
  
  // Dynamic import of format to avoid circular deps if any
  const { format } = require('date-fns');
  return format(d, formatStr, options);
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, length: number) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};
