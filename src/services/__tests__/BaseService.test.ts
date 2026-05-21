
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseService } from '../BaseService';

// Mock AuditLogService to prevent circular imports and side effects
vi.mock("@/services", () => ({
  auditLogService: {
    logAction: vi.fn().mockResolvedValue(true)
  }
}));

// Concrete implementation for testing
interface TestItem {
  id: string;
  name: string;
  company_id?: string;
  created_at?: Date;
}

class TestService extends BaseService<TestItem> {
  constructor() {
    super({
      storageKey: 'test-storage',
      auditEntityType: 'user' as any,
      shouldSyncWithSupabase: false
    });
  }
}

describe('BaseService', () => {
  let service: TestService;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    service = new TestService();
  });

  it('should create an item and persist to localStorage', async () => {
    const item = await service.create({ name: 'Test Item' }, 'tenant-1');
    
    expect(item.id).toBeDefined();
    expect(item.name).toBe('Test Item');
    expect(item.company_id).toBe('tenant-1');
    
    const stored = JSON.parse(localStorage.getItem('test-storage') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Test Item');
  });

  it('should isolate data by tenant (company_id)', async () => {
    await service.create({ name: 'Tenant 1 Item' }, 'tenant-1');
    await service.create({ name: 'Tenant 2 Item' }, 'tenant-2');
    
    const t1Items = service.getAll('tenant-1');
    expect(t1Items).toHaveLength(1);
    expect(t1Items[0].name).toBe('Tenant 1 Item');
    
    const allItemsSuper = service.getAll(undefined, true);
    expect(allItemsSuper).toHaveLength(2);
  });

  it('should prevent cross-tenant access in getById', async () => {
    const item = await service.create({ name: 'Secret' }, 'tenant-1');
    
    const accessed = service.getById(item.id, 'tenant-2');
    expect(accessed).toBeUndefined();
    
    const accessedRight = service.getById(item.id, 'tenant-1');
    expect(accessedRight?.name).toBe('Secret');
  });

  it('should update items and notify listeners', async () => {
    const item = await service.create({ name: 'Old Name' }, 'tenant-1');
    const listener = vi.fn();
    service.subscribe(listener);
    
    await service.update(item.id, { name: 'New Name' });
    
    expect(service.getById(item.id, 'tenant-1')?.name).toBe('New Name');
    expect(listener).toHaveBeenCalled();
  });

  it('should delete items', async () => {
    const item = await service.create({ name: 'To be deleted' }, 'tenant-1');
    const success = await service.delete(item.id);
    
    expect(success).toBe(true);
    expect(service.getAll('tenant-1')).toHaveLength(0);
  });

  it('should deserialize dates correctly', async () => {
    const dateStr = '2026-05-20T10:00:00.000Z';
    localStorage.setItem('test-storage', JSON.stringify([{ id: '1', name: 'Date test', created_at: dateStr }]));
    
    // Create new instance to trigger loadFromStorage
    const newService = new TestService();
    const item = newService.getById('1', undefined, true);
    
    expect(item?.created_at).toBeInstanceOf(Date);
  });
});
