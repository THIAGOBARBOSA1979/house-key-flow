import { ErrorCode } from "@/utils/errors/AppError";

export type DataViewMode = 'grid' | 'list' | 'timeline' | 'table' | 'calendar';

export type StatusType = 
  | "pending" 
  | "progress" 
  | "complete" 
  | "critical" 
  | "success" 
  | "warning" 
  | "error" 
  | "info" 
  | "neutral"
  | "reschedule_requested"
  | "presence_confirmed"
  | "on_track"
  | "expired"
  | "confirmed" 
  | "cancelled" 
  | "in_progress" 
  | "waiting_client" 
  | "scheduled" 
  | "resolved" 
  | "rejected" 
  | "overdue" 
  | "active" 
  | "inactive" 
  | "low" 
  | "medium" 
  | "high";

export interface SortConfig {
  key: string | null;
  direction: "asc" | "desc";
}

export interface FilterConfig {
  field: string;
  value: any;
  operator: "eq" | "contains" | "gt" | "lt" | "between" | "in" | "neq";
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total?: number;
}

export interface BaseEntity {
  id: string;
  company_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type Listener<T> = (items: T[]) => void;

