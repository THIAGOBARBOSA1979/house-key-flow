import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { BaseService } from '../BaseService';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    }
  }
}));

// Concrete implementation for testing BaseService
class TestService extends BaseService<{ id: string; company_id?: string; name: string }> {
  constructor() {
    super('test_storage', []);
  }
}

describe('BaseService - Tenant Isolation', () => {
  let service: TestService;

  beforeEach(() => {
    localStorage.clear();
    service = new TestService();
    // Force clear internal items since it might have loaded from localStorage before clear
    (service as any).items = [];
  });

  it('should restrict getAll for non-super-admins when no companyId is provided', () => {
    service.create({ name: 'Item 1' }, 'comp-1');
    const items = service.getAll();
    expect(items).toHaveLength(0);
  });

  it('should return only tenant-specific items for non-super-admins', () => {
    service.create({ name: 'Tenant 1 Item' }, 'comp-1');
    service.create({ name: 'Tenant 2 Item' }, 'comp-2');
    
    const tenant1Items = service.getAll('comp-1', false);
    expect(tenant1Items).toHaveLength(1);
    expect(tenant1Items[0].name).toBe('Tenant 1 Item');
  });

  it('should return all items for super-admins', () => {
    service.create({ name: 'Tenant 1 Item' }, 'comp-1');
    service.create({ name: 'Tenant 2 Item' }, 'comp-2');
    
    const allItems = service.getAll(undefined, true);
    expect(allItems).toHaveLength(2);
  });

  it('should verify ownership on getById for non-super-admins', () => {
    const item = service.create({ name: 'Private Item' }, 'comp-1');
    
    // Access from correct tenant
    expect(service.getById(item.id, 'comp-1')).toBeDefined();
    
    // Access from wrong tenant
    expect(service.getById(item.id, 'comp-2')).toBeUndefined();
    
    // Access as super admin
    expect(service.getById(item.id, undefined, true)).toBeDefined();
  });
});
