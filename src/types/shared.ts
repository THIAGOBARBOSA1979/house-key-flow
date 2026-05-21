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
  operator: "eq" | "contains" | "gt" | "lt" | "between";
}
