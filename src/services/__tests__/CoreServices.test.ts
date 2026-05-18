import { describe, it, expect, beforeEach, vi } from 'vitest';
import { notificationService } from '../core/NotificationService';
import { auditLogService } from '../core/AuditLogService';

// Mock Supabase for AuditLogService
vi.mock('@/integration/supabase', () => ({
  Supabase: {
    db: {
      findMany: vi.fn().mockResolvedValue({ data: [], error: null }),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    }
  }
}));

describe('Core Services Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    (notificationService as any).items = [];
    vi.clearAllMocks();
  });

  it('should generate notifications for specific events', () => {
    notificationService.createNotification('client-abc', 'stage_changed', {
      relatedEntityType: 'warranty',
      relatedEntityId: 'w-123'
    }, {
      title: 'Mudança de Status',
      message: 'Sua solicitação mudou para em análise.'
    });

    const notifications = notificationService.getNotifications('client-abc');
    expect(notifications).toHaveLength(1);
    expect(notifications[0].title).toBe('Mudança de Status');
    expect(notifications[0].read).toBe(false);

    notificationService.markAsRead(notifications[0].id!);
    expect(notificationService.getUnreadCount('client-abc')).toBe(0);
  });

  it('should record audit logs for critical actions', async () => {
    await auditLogService.logAction({
      action: 'created',
      entityType: 'user',
      entityId: 'u-456',
      payload: { name: 'Novo Usuário' }
    });

    const { Supabase } = await import('@/integration/supabase');
    expect(Supabase.db.rpc).toHaveBeenCalledWith('log_audit_action', expect.objectContaining({
      p_action: 'created',
      p_entity_type: 'user'
    }));
  });
});
