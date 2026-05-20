
export type DataViewMode = 'grid' | 'list' | 'timeline' | 'table' | 'calendar';

export type StatusType = 
  | "pending" 
  | "confirmed" 
  | "completed" 
  | "cancelled" 
  | "in_progress" 
  | "resolved" 
  | "rejected" 
  | "overdue" 
  | "active" 
  | "inactive" 
  | "expired" 
  | "critical" 
  | "low" 
  | "medium" 
  | "high"
  | "progress"
  | "complete"
  | "success"
  | "warning"
  | "error"
  | "info";

export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

export interface FilterConfig {
  field: string;
  value: any;
  operator: "eq" | "contains" | "gt" | "lt" | "between";
}
