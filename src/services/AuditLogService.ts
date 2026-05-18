import { BaseService } from "./BaseService";

export type AuditEntityType = 'inspection' | 'warranty' | 'document' | 'user' | 'property' | 'checklist' | 'system' | 'financial';
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

export type AuditRole = 'admin' | 'client' | 'user';

export interface AuditLogEntry {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  performedBy: string;
  performedByName: string;
  performedByRole: AuditRole;
  timestamp: Date;
  details: string;
  metadata?: Record<string, unknown>;
}

type NewAuditLogEntry = Omit<AuditLogEntry, 'id' | 'timestamp'>;

const INITIAL_LOGS: AuditLogEntry[] = [
  {
    id: crypto.randomUUID(), entityType: 'inspection', entityId: '1',
    action: 'created', performedBy: 'admin-1', performedByName: 'Ana Costa',
    performedByRole: 'admin', timestamp: new Date(Date.now() - 30 * 86400000),
    details: 'Vistoria de pré-entrega criada para Edifício Aurora, Unidade 204.'
  },
  {
    id: crypto.randomUUID(), entityType: 'inspection', entityId: '1',
    action: 'scheduled', performedBy: 'admin-1', performedByName: 'Ana Costa',
    performedByRole: 'admin', timestamp: new Date(Date.now() - 28 * 86400000),
    details: 'Vistoria agendada para 15/05/2025 às 10:00.'
  },
  {
    id: crypto.randomUUID(), entityType: 'warranty', entityId: 'w-1',
    action: 'created', performedBy: 'client-1', performedByName: 'João Silva',
    performedByRole: 'client', timestamp: new Date(Date.now() - 10 * 86400000),
    details: 'Solicitação de garantia criada: Infiltração no banheiro.'
  },
];

class AuditLogService extends BaseService<AuditLogEntry> {
  constructor() {
    super("a2_audit_logs", INITIAL_LOGS);
  }

  protected loadFromStorage() {
    super.loadFromStorage();
    // Ensure timestamps are Date objects
    this.items = this.items.map(l => ({ 
      ...l, 
      timestamp: l.timestamp instanceof Date ? l.timestamp : new Date(l.timestamp) 
    }));
  }

  log(entry: NewAuditLogEntry, userContext?: { id: string, name: string, role: AuditRole }): AuditLogEntry {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      performedBy: userContext?.id || entry.performedBy || 'system',
      performedByName: userContext?.name || entry.performedByName || 'Sistema',
      performedByRole: userContext?.role || entry.performedByRole || 'user',
    };
    
    this.items.unshift(newEntry);
    this.persist();
    
    window.dispatchEvent(new CustomEvent('a2_audit_log_created', { detail: newEntry }));
    console.log('[AuditLog]', newEntry.action, newEntry.entityType, newEntry.entityId, newEntry.details);
    
    return newEntry;
  }

  getRecentLogs(limit: number = 20): AuditLogEntry[] {
    return this.items.slice(0, limit).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getFilteredLogs(filters: {
    searchTerm?: string;
    action?: string;
    role?: string;
    entityType?: string;
    entityId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): AuditLogEntry[] {
    return this.items.filter(log => {
      const matchesSearch = !filters.searchTerm || 
        log.details.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        log.performedByName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        log.entityId.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesAction = !filters.action || filters.action === "all" || log.action === filters.action;
      const matchesRole = !filters.role || filters.role === "all" || log.performedByRole === filters.role;
      const matchesEntityType = !filters.entityType || filters.entityType === "all" || log.entityType === filters.entityType;
      const matchesEntityId = !filters.entityId || log.entityId === filters.entityId;
      const matchesDateFrom = !filters.dateFrom || log.timestamp >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || log.timestamp <= filters.dateTo;

      return matchesSearch && matchesAction && matchesRole && matchesEntityType && matchesEntityId && matchesDateFrom && matchesDateTo;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getAuditStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const currentCount = this.items.filter(l => l.timestamp >= last24h).length;

    return {
      totalLogs: this.items.length,
      currentCount24h: currentCount
    };
  }
}

export const auditLogService = new AuditLogService();
