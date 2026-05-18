import { SupabaseService } from "./SupabaseService";
import { Supabase } from "@/integration/supabase";
import { SupabaseRealtime } from "@/integration/supabase/realtime";

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

export type AuditRole = 'super_admin' | 'admin' | 'staff' | 'technical' | 'user' | 'client';

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
  // UI expected fields (computed or mapped)
  details: string;
  timestamp: Date;
  performedByName: string;
  performedByRole: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  // Joined fields
  profiles?: {
    full_name: string;
    role: string;
  };
}

class AuditLogService extends SupabaseService<any> {
  private localLogs: AuditLogEntry[] = [];

  constructor() {
    super("audit_logs");
  }

  private mapToEntry(raw: any): AuditLogEntry {
    const profiles = raw.profiles;
    return {
      ...raw,
      details: raw.payload?.message || `${raw.action} em ${raw.entity_type}`,
      timestamp: new Date(raw.created_at),
      performedByName: profiles?.full_name || 'Sistema',
      performedByRole: profiles?.role || 'system',
      entityType: raw.entity_type,
      entityId: raw.entity_id || '',
      metadata: raw.payload
    };
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
    if (params.action && params.action !== 'all') filters.push({ column: 'action', operator: 'eq', value: params.action });
    if (params.entityType && params.entityType !== 'all') filters.push({ column: 'entity_type', operator: 'eq', value: params.entityType });

    const { data, error } = await Supabase.db.findMany<any>(this.table, {
      filters,
      pagination: {
        page: params.page || 1,
        pageSize: params.pageSize || 50,
        orderBy: 'created_at',
        orderDirection: 'desc'
      },
      select: '*, profiles(full_name, role)'
    });

    if (error) return [];
    return (data || []).map(this.mapToEntry);
  }

  // Compatibility methods
  async log(entry: any, userContext?: any): Promise<void> {
    await this.logAction({
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      payload: { ...entry.metadata, message: entry.details }
    });
  }

  async logAction(data: {
    action: AuditAction;
    entityType: AuditEntityType;
    entityId?: string;
    payload?: any;
    previousValues?: any;
  }): Promise<void> {
    const { error } = await Supabase.db.rpc('log_audit_action', {
      p_action: data.action,
      p_entity_type: data.entityType,
      p_entity_id: data.entityId,
      p_payload: data.payload,
      p_previous_values: data.previousValues
    });

    if (error) console.error('Failed to log audit action:', error);
  }

  getRecentLogs(limit: number = 20, companyId?: string, isSuperAdmin?: boolean): AuditLogEntry[] {
    // For synchronous access, we return the local cache
    return this.localLogs.slice(0, limit);
  }

  // Add back with correct signature for backward compatibility
  getAllLogs(companyId?: string, isSuperAdmin?: boolean): AuditLogEntry[] {
    return this.localLogs;
  }


  getFilteredLogs(filters: any): AuditLogEntry[] {
    // This is used by AuditLogViewer, which needs to be updated to be async
    // But for now, we return filtered cache
    return this.localLogs.filter(log => {
      if (filters.action && filters.action !== 'all' && log.action !== filters.action) return false;
      if (filters.entityType && filters.entityType !== 'all' && log.entityType !== filters.entityType) return false;
      return true;
    });
  }

    return this.localLogs; // Simplified for build compatibility
  }

  subscribe(callback: (logs: AuditLogEntry[]) => void) {
    // Fetch initial data async and then call callback
    this.getRecentLogsAsync(50).then(logs => {
      this.localLogs = logs;
      callback(logs);
    });

    const channel = SupabaseRealtime.subscribeToTable('audit_logs', async () => {
      const logs = await this.getRecentLogsAsync(50);
      this.localLogs = logs;
      callback(logs);
    });
    return () => SupabaseRealtime.unsubscribe(channel);
  }

  async getRecentLogsAsync(limit: number = 20, companyId?: string, isSuperAdmin?: boolean): Promise<AuditLogEntry[]> {
    return this.getLogs({ pageSize: limit, companyId, isSuperAdmin });
  }


  async getAuditStats(companyId?: string, isSuperAdmin?: boolean) {
    const count = await this.count(companyId, isSuperAdmin);
    return { totalLogs: count, currentCount24h: 0 };
  }
}

export const auditLogService = new AuditLogService();
