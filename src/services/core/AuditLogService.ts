import { Supabase, FilterParams } from "@/integrations/supabase";
import { Database } from "@/integrations/supabase/types";
import { BaseService } from "@/services/BaseService";

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

class AuditLogService extends BaseService<any> {
  constructor() {
    super({ storageKey: "audit_logs", shouldSyncWithSupabase: false }, []);
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

    if (!params.isSuperAdmin && params.companyId) {
      filters.push({ column: 'company_id', operator: 'eq', value: params.companyId });
    }

    const { data, error } = await Supabase.db.findMany<any>('audit_logs', {
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

  async logAction(data: {
    action: AuditAction;
    entityType: AuditEntityType;
    entityId?: string;
    payload?: any;
    previousValues?: any;
    companyId?: string;
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

  subscribe(callback: (logs: AuditLogEntry[]) => void) {
    this.getRecentLogsAsync(50).then(logs => {
      this.items = logs;
      callback(logs);
    });

    const channel = Supabase.realtime.subscribeToTable('audit_logs', async () => {
      const logs = await this.getRecentLogsAsync(50);
      this.items = logs;
      callback(logs);
    });
    
    this.listeners.push(callback);
    return () => {
      channel.unsubscribe();
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async getRecentLogsAsync(limit: number = 50): Promise<AuditLogEntry[]> {
    return this.getLogs({ pageSize: limit });
  }

  async getAuditStats(companyId?: string, isSuperAdmin?: boolean) {
    const filters: FilterParams[] = [];
    if (!isSuperAdmin && companyId) {
      filters.push({ column: 'company_id', operator: 'eq', value: companyId });
    }
    const { data, error } = await Supabase.db.count('audit_logs', filters);
    return { totalLogs: data || 0, currentCount24h: 0 };
  }
}

export const auditLogService = new AuditLogService();
