
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseService } from '@/services/BaseService';
import { Supabase } from '@/integrations/supabase';

// Mock Supabase globally is already done in setup.ts, 
// but we want to spy on it specifically for these tests.

describe('Architectural Regression - BaseService', () => {
  interface TestItem {
    id: string;
    name: string;
    company_id?: string;
  }

  let service: BaseService<TestItem>;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    service = new BaseService<TestItem>({
      storageKey: 'regression_test',
      auditEntityType: 'user',
      shouldSyncWithSupabase: true
    }, []);
  });

  it('should sync create operation to Supabase when enabled', async () => {
    const spy = vi.spyOn(Supabase.db, 'create');
    const newItem = { name: 'Test Item' };
    
    service.create(newItem, 'tenant-1');
    
    expect(spy).toHaveBeenCalledWith('regression_test', expect.objectContaining({
      name: 'Test Item',
      company_id: 'tenant-1'
    }));
  });

  it('should sync update operation to Supabase when enabled', async () => {
    const spy = vi.spyOn(Supabase.db, 'update');
    const item = service.create({ name: 'Original' }, 'tenant-1');
    
    service.update(item.id, { name: 'Updated' }, true);
    
    expect(spy).toHaveBeenCalledWith('regression_test', item.id, expect.objectContaining({
      name: 'Updated'
    }));
  });

  it('should sync delete operation to Supabase when enabled', async () => {
    const spy = vi.spyOn(Supabase.db, 'delete');
    const item = service.create({ name: 'To Delete' }, 'tenant-1');
    
    service.delete(item.id);
    
    expect(spy).toHaveBeenCalledWith('regression_test', item.id);
  });

  it('should enforce tenant isolation in getAll', () => {
    service.create({ name: 'Tenant 1 Item' }, 'tenant-1');
    service.create({ name: 'Tenant 2 Item' }, 'tenant-2');
    
    const results = service.getAll('tenant-1', false);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Tenant 1 Item');
  });

  it('should allow super admin to see all items', () => {
    service.create({ name: 'Tenant 1 Item' }, 'tenant-1');
    service.create({ name: 'Tenant 2 Item' }, 'tenant-2');
    
    const results = service.getAll(undefined, true);
    expect(results).toHaveLength(2);
  });
});
