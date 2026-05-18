import { SupabaseService } from "../SupabaseService";
import { Supabase } from "@/integrations/supabase";

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
  details: string;
  timestamp: Date;
  performedByName: string;
  performedByRole: string;
  entityType: string;
  entityId: string;
  metadata?: any;
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
    return (data || []).map(raw => this.mapToEntry(raw));
  }

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
      p_entity_id: data.entityId || null,
      p_payload: data.payload || null,
      p_previous_values: data.previousValues || null
    });

    if (error) console.error('Failed to log audit action:', error);
  }

  getRecentLogs(limit: number = 20): AuditLogEntry[] {
    return this.localLogs.slice(0, limit);
  }

  getAllLogs(): AuditLogEntry[] {
    return this.localLogs;
  }

  getFilteredLogs(filters: any): AuditLogEntry[] {
    return this.localLogs.filter(log => {
      if (filters.action && filters.action !== 'all' && log.action !== filters.action) return false;
      if (filters.entityType && filters.entityType !== 'all' && log.entityType !== filters.entityType) return false;
      return true;
    });
  }

  subscribe(callback: (logs: AuditLogEntry[]) => void) {
    this.getRecentLogsAsync(50).then(logs => {
      this.localLogs = logs;
      callback(logs);
    });

    const channel = Supabase.realtime.subscribeToTable('audit_logs', async () => {
      const logs = await this.getRecentLogsAsync(50);
      this.localLogs = logs;
      callback(logs);
    });
    return () => channel.unsubscribe();
  }

  async getRecentLogsAsync(limit: number = 50): Promise<AuditLogEntry[]> {
    return this.getLogs({ pageSize: limit });
  }

  async getAuditStats(companyId?: string, isSuperAdmin?: boolean) {
    const { data, error } = await Supabase.db.rpc('count_table_rows', { p_table: 'audit_logs', p_company_id: companyId });
    return { totalLogs: data || 0, currentCount24h: 0 };
  }
}

export const auditLogService = new AuditLogService();
