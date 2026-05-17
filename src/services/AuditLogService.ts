// Audit Log Service using crypto.randomUUID() for ID generation

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

class AuditLogService {
  private logs: AuditLogEntry[] = [];
  private storageKey = "a2_audit_logs";

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.logs = parsed.map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) }));
      } catch (e) {
        console.error("Failed to load audit logs", e);
        this.seedMockData();
      }
    } else {
      this.seedMockData();
    }
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
  }

  private seedMockData() {
    const now = new Date();
    const day = (d: number) => new Date(now.getTime() - d * 86400000);

    this.logs = [
      {
        id: crypto.randomUUID(), entityType: 'inspection', entityId: '1',
        action: 'created', performedBy: 'admin-1', performedByName: 'Ana Costa',
        performedByRole: 'admin', timestamp: day(30),
        details: 'Vistoria de pré-entrega criada para Edifício Aurora, Unidade 204.'
      },
      {
        id: crypto.randomUUID(), entityType: 'inspection', entityId: '1',
        action: 'scheduled', performedBy: 'admin-1', performedByName: 'Ana Costa',
        performedByRole: 'admin', timestamp: day(28),
        details: 'Vistoria agendada para 15/05/2025 às 10:00.'
      },
      {
        id: crypto.randomUUID(), entityType: 'inspection', entityId: '3',
        action: 'created', performedBy: 'admin-1', performedByName: 'Ana Costa',
        performedByRole: 'admin', timestamp: day(40),
        details: 'Vistoria de reparo criada para Edifício Aurora, Unidade 204.'
      },
      {
        id: crypto.randomUUID(), entityType: 'inspection', entityId: '3',
        action: 'completed', performedBy: 'admin-2', performedByName: 'Roberto Santos',
        performedByRole: 'admin', timestamp: day(20),
        details: 'Vistoria de reparo concluída. 2 itens verificados, todos conformes.'
      },
      {
        id: crypto.randomUUID(), entityType: 'warranty', entityId: 'w-1',
        action: 'created', performedBy: 'client-1', performedByName: 'João Silva',
        performedByRole: 'client', timestamp: day(10),
        details: 'Solicitação de garantia criada: Infiltração no banheiro.'
      },
      {
        id: crypto.randomUUID(), entityType: 'warranty', entityId: 'w-1',
        action: 'updated', performedBy: 'admin-1', performedByName: 'Ana Costa',
        performedByRole: 'admin', timestamp: day(9),
        details: 'Solicitação movida para análise técnica.'
      },
      {
        id: crypto.randomUUID(), entityType: 'warranty', entityId: 'w-1',
        action: 'assigned', performedBy: 'admin-1', performedByName: 'Ana Costa',
        performedByRole: 'admin', timestamp: day(8),
        details: 'Técnico Carlos Andrade designado para análise.',
        metadata: { assignedTo: 'Carlos Andrade' }
      },
    ];
    this.persist();
  }

  log(entry: NewAuditLogEntry): AuditLogEntry {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    this.logs.unshift(newEntry);
    this.persist();
    
    // Dispatch system-wide event for real-time UI updates
    window.dispatchEvent(new CustomEvent('a2_audit_log_created', { detail: newEntry }));
    
    console.log('[AuditLog]', newEntry.action, newEntry.entityType, newEntry.entityId, newEntry.details);
    return newEntry;
  }

  getLogsByEntity(entityType: AuditEntityType, entityId?: string): AuditLogEntry[] {
    return this.logs
      .filter(l => l.entityType === entityType && (!entityId || l.entityId === entityId))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getLogsByUser(userId: string): AuditLogEntry[] {
    return this.logs
      .filter(l => l.performedBy === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getLogsByDateRange(from: Date, to: Date): AuditLogEntry[] {
    return this.logs
      .filter(l => l.timestamp >= from && l.timestamp <= to)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getRecentLogs(limit: number = 20): AuditLogEntry[] {
    return this.logs.slice(0, limit).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getAllLogs(): AuditLogEntry[] {
    return [...this.logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getAuditStats() {
    return {
      totalLogs: this.logs.length,
      logsByAction: this.logs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      logsByRole: this.logs.reduce((acc, log) => {
        acc[log.performedByRole] = (acc[log.performedByRole] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recentActivityTrend: this.getRecentActivityTrend()
    };
  }

  private getRecentActivityTrend() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const prev24h = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const currentCount = this.logs.filter(l => l.timestamp >= last24h).length;
    const prevCount = this.logs.filter(l => l.timestamp >= prev24h && l.timestamp < last24h).length;

    return {
      count: currentCount,
      trend: prevCount === 0 ? 0 : ((currentCount - prevCount) / prevCount) * 100
    };
  }
}

export const auditLogService = new AuditLogService();
