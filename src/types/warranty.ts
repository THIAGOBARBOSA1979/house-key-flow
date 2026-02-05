
// Warranty Item Status
export type WarrantyStatusType = "ativa" | "expirada" | "cancelada";

// Warranty Item - represents an item covered by warranty
export interface WarrantyItem {
  id: string;
  clientId: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  category: string;
  name: string;
  description: string;
  dataInicioGarantia: Date;
  dataFimGarantia: Date;
  statusGarantia: WarrantyStatusType;
  warrantyYears: number;
  icon?: string;
}

// Warranty Request - a request made by a client for a warranty item
export interface WarrantyRequest {
  id: string;
  itemId: string;
  clientId: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "progress" | "complete" | "critical";
  createdAt: Date;
  updatedAt: Date;
  problems: WarrantyProblemData[];
  additionalInfo?: string;
}

// Problem data for warranty request
export interface WarrantyProblemData {
  id: string;
  category: string;
  location: string;
  description: string;
  severity: "minor" | "moderate" | "severe";
  photos: string[];
}

// Eligibility result
export interface WarrantyEligibilityResult {
  isEligible: boolean;
  reason?: "expired" | "cancelled" | "not_started" | "not_owned" | "active";
  message?: string;
  daysRemaining?: number;
  percentageRemaining?: number;
}

// Error response for invalid warranty requests
export interface WarrantyErrorResponse {
  error: string;
  code: "WARRANTY_INACTIVE" | "WARRANTY_NOT_OWNED" | "INVALID_DATA";
  details: {
    item_id: string;
    reason: "expired" | "cancelled" | "not_started" | "not_owned";
  };
}

// Category icons mapping
export const CATEGORY_ICONS: Record<string, string> = {
  "Instalações Hidráulicas": "droplets",
  "Impermeabilização": "shield",
  "Revestimentos Cerâmicos": "grid",
  "Esquadrias": "door-open",
  "Estrutural": "building",
  "Elétrica": "zap",
  "Acabamentos": "paint-bucket",
  "Equipamentos": "settings",
};
