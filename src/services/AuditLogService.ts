import { v4 as uuidv4 } from 'uuid';

export type AuditEntityType = 'inspection' | 'warranty';
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
  | 'assigned';

export type AuditRole = 'admin' | 'client';

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

  constructor() {
    this.seedMockData();
  }

  private seedMockData() {
    const now = new Date();
    const day = (d: number) => new Date(now.getTime() - d * 86400000);

    this.logs = [
      {
        id: uuidv4(), entityType: 'inspection', entityId: '1',
        action: 'created', performedBy: 'admin-1', performedByName: 'Ana Costa',
        performedByRole: 'admin', timestamp: day(30),
        details: 'Vistoria de pré-entrega criada para Edifício Aurora, Unidade 204.'
      },
      {
        id: uuidv4(), entityType: 'inspection', entityId: '1',
        action: 'scheduled', performedBy: 'admin-1', performedByName: 'Ana Costa',
        performedByRole: 'admin', timestamp: day(28),
        details: 'Vistoria agendada para 15/05/2025 às 10:00.'
      },
      {
        id: uuidv4(), entityType: 'inspection', entityId: '3',
        action: 'created', performedBy: 'admin-1', performedByName: 'Ana Costa',
        performedByRole: 'admin', timestamp: day(40),
        details: 'Vistoria de reparo criada para Edifício Aurora, Unidade 204.'
      },
      {
        id: uuidv4(), entityType: 'inspection', entityId: '3',
        action: 'completed', performedBy: 'admin-2', performedByName: 'Roberto Santos',
        performedByRole: 'admin', timestamp: day(20),
        details: 'Vistoria de reparo concluída. 2 itens verificados, todos conformes.'
      },
      {
        id: uuidv4(), entityType: 'warranty', entityId: 'w-1',
        action: 'created', performedBy: 'client-1', performedByName: 'João Silva',
        performedByRole: 'client', timestamp: day(10),
        details: 'Solicitação de garantia criada: Infiltração no banheiro.'
      },
      {
        id: uuidv4(), entityType: 'warranty', entityId: 'w-1',
        action: 'updated', performedBy: 'admin-1', performedByName: 'Ana Costa',
        performedByRole: 'admin', timestamp: day(9),
        details: 'Solicitação movida para análise técnica.'
      },
      {
        id: uuidv4(), entityType: 'warranty', entityId: 'w-1',
        action: 'assigned', performedBy: 'admin-1', performedByName: 'Ana Costa',
        performedByRole: 'admin', timestamp: day(8),
        details: 'Técnico Carlos Andrade designado para análise.',
        metadata: { assignedTo: 'Carlos Andrade' }
      },
    ];
  }

  log(entry: NewAuditLogEntry): AuditLogEntry {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: uuidv4(),
      timestamp: new Date(),
    };
    this.logs.unshift(newEntry);
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
    return this.logs.slice(0, limit);
  }

  getAllLogs(): AuditLogEntry[] {
    return [...this.logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const auditLogService = new AuditLogService();
