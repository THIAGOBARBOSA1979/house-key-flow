import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseService } from '../BaseService';

vi.mock("@/services", () => ({
  auditLogService: {
    logAction: vi.fn().mockResolvedValue(true)
  }
}));

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

  it('should create an item', async () => {
    const item = await service.create({ name: 'Test Item' }, 'tenant-1');
    expect(item.id).toBeDefined();
    expect(item.name).toBe('Test Item');
  });

  it('should isolate data by tenant', async () => {
    await service.create({ name: 'T1' }, 'tenant-1');
    await service.create({ name: 'T2' }, 'tenant-2');
    const items = await service.getAll('tenant-1');
    expect(items).toHaveLength(1);
  });

  it('should update items', async () => {
    const item = await service.create({ name: 'Old' }, 'tenant-1');
    await service.update(item.id, { name: 'New' });
    const updated = await service.getById(item.id, 'tenant-1');
    expect(updated?.name).toBe('New');
  });

  it('should delete items', async () => {
    const item = await service.create({ name: 'Del' }, 'tenant-1');
    await service.delete(item.id);
    const items = await service.getAll('tenant-1');
    expect(items).toHaveLength(0);
  });
});
