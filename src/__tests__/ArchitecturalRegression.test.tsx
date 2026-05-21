
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseBaseService } from '@/services/SupabaseBaseService';
import { Supabase } from '@/integrations/supabase';

describe('Architectural Regression - BaseService', () => {
  interface TestItem {
    id: string;
    name: string;
    company_id?: string;
  }

  class TestService extends SupabaseBaseService<TestItem> {}

  let service: TestService;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    service = new TestService({
      storageKey: 'regression_test',
      supabaseTable: 'audit_logs' as any,
      auditEntityType: 'user',
      shouldSyncWithSupabase: true
    }, []);
  });


  it('should sync create operation to Supabase when enabled', async () => {
    const spy = vi.spyOn(Supabase.db, 'create');
    const newItem = { name: 'Test Item' };
    
    await service.create(newItem, 'tenant-1');
    
    expect(spy).toHaveBeenCalledWith('audit_logs', expect.objectContaining({
      name: 'Test Item',
      company_id: 'tenant-1'
    }));
  });

  it('should sync update operation to Supabase when enabled', async () => {
    const spy = vi.spyOn(Supabase.db, 'update');
    const item = await service.create({ name: 'Original' }, 'tenant-1');
    
    await service.update(item.id, { name: 'Updated' }, true);
    
    expect(spy).toHaveBeenCalledWith('audit_logs', item.id, expect.objectContaining({
      name: 'Updated'
    }));
  });

  it('should sync delete operation to Supabase when enabled', async () => {
    const spy = vi.spyOn(Supabase.db, 'delete');
    const item = await service.create({ name: 'To Delete' }, 'tenant-1');
    
    await service.delete(item.id);
    
    expect(spy).toHaveBeenCalledWith('audit_logs', item.id);
  });


  it('should enforce tenant isolation in getAll', async () => {
    await service.create({ name: 'Tenant 1 Item' }, 'tenant-1');
    await service.create({ name: 'Tenant 2 Item' }, 'tenant-2');
    
    const results = await service.getAll('tenant-1', false);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Tenant 1 Item');
  });

  it('should allow super admin to see all items', async () => {
    await service.create({ name: 'Tenant 1 Item' }, 'tenant-1');
    await service.create({ name: 'Tenant 2 Item' }, 'tenant-2');
    
    const results = await service.getAll(undefined, true);
    expect(results).toHaveLength(2);
  });

});
