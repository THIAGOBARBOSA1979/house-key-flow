import { SupabaseService } from "./SupabaseService";
import { Supabase } from "@/integration/supabase";

export type AuditEntityType = 'inspection' | 'warranty' | 'document' | 'user' | 'property' | 'checklist' | 'system' | 'financial' | 'auth';
export type AuditAction = 
  | 'created' 
  | 'updated' 
  | 'accepted' 
  | 'rejected' 
  | 'scheduled' 
  | 'completed' 
  | 'cancelled' 
  | 'stage_changed'
  | 'comment_added'
  | 'info_added'
  | 'assigned'
  | 'exported'
  | 'logged_in'
  | 'logged_out'
  | 'settings_updated'
  | 'downloaded'
  | 'archived'
  | 'published'
  | 'favorited'
  | 'deleted'
  | 'viewed'
  | 'payment_received'
  | 'invoice_issued';

export type AuditRole = 'super_admin' | 'admin' | 'staff' | 'technical' | 'user';

export interface AuditLogEntry {
  id: string;
  company_id: string | null;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  payload: any;
  previous_values: any;
  created_at: string;
  // Joined fields
  profiles?: {
    full_name: string;
    role: string;
  };
}

class AuditLogService extends SupabaseService<any> {
  constructor() {
    super("audit_logs");
  }

  async getLogs(params: {
    companyId?: string;
    isSuperAdmin?: boolean;
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    action?: string;
    entityType?: string;
  }): Promise<AuditLogEntry[]> {
    const filters: any[] = [];
    
    if (params.action && params.action !== 'all') {
      filters.push({ column: 'action', operator: 'eq', value: params.action });
    }
    
    if (params.entityType && params.entityType !== 'all') {
      filters.push({ column: 'entity_type', operator: 'eq', value: params.entityType });
    }

    // Since findMany is generic but we need joins, we might need a custom query or use findMany with select
    const { data, error } = await Supabase.db.findMany<AuditLogEntry>(this.table, {
      filters,
      pagination: {
        page: params.page || 1,
        pageSize: params.pageSize || 50,
        orderBy: 'created_at',
        orderDirection: 'desc'
      },
      select: '*, profiles(full_name, role)'
    });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async logAction(data: {
    action: AuditAction;
    entityType: AuditEntityType;
    entityId?: string;
    payload?: any;
    previousValues?: any;
  }): Promise<void> {
    // We can use the RPC function we created in the migration for security definer context
    const { error } = await Supabase.db.rpc('log_audit_action', {
      p_action: data.action,
      p_entity_type: data.entityType,
      p_entity_id: data.entityId,
      p_payload: data.payload,
      p_previous_values: data.previousValues
    });

    if (error) {
      console.error('Failed to log audit action:', error);
    }
  }

  // Legacy compatibility / helpers
  async getAuditStats(companyId?: string, isSuperAdmin?: boolean) {
    const total = await this.count(companyId, isSuperAdmin);
    // For 24h count, we'd need more complex filtering in count() or a separate query
    return {
      totalLogs: total,
      currentCount24h: 0 // Placeholder
    };
  }
}

export const auditLogService = new AuditLogService();
