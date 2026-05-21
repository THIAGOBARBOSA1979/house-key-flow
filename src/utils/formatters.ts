/**
 * Centralized utility functions for formatting dates and currency.
 */

export const formatDate = (date: Date | string | number | undefined): string => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
};

export const formatDateTime = (date: Date | string | number | undefined): string => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

export const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || value === null) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatPercentage = (value: number | undefined): string => {
  if (value === undefined || value === null) return "0%";
  return `${Math.round(value)}%`;
};

export const formatPhone = (value: string | undefined): string => {
  if (!value) return "-";
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return value;
};

export const formatCNPJ = (value: string | undefined): string => {
  if (!value) return "-";
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length !== 14) return value;
  return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
};

export const formatCPF = (value: string | undefined): string => {
  if (!value) return "-";
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length !== 11) return value;
  return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
};

export const formatCEP = (value: string | undefined): string => {
  if (!value) return "-";
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length !== 8) return value;
  return cleaned.replace(/^(\d{5})(\d{3})$/, "$1-$2");
};


export const formatRelativeTime = (date: Date | string | number | undefined): string => {
  if (!date) return "Agora";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Agora";
  
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Agora';
  if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;
  if (diffInHours < 24) return `Há ${diffInHours}h`;
  if (diffInDays === 1) return 'Ontem';
  if (diffInDays < 7) return `Há ${diffInDays} dias`;
  
  return formatDate(d);
};


