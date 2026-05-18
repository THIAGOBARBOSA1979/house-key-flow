
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userService } from '@/services/identity/UserService';
import { propertyService } from '@/services/operations/PropertyService';
import { Supabase } from '@/integrations/supabase';

describe('Service Logic Regression', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('UserService should map Supabase profiles (full_name) to name correctly', async () => {
    // Mock Supabase findMany to return profiles with full_name
    vi.spyOn(Supabase.db, 'findMany').mockResolvedValue({
      data: [{ id: '1', full_name: 'John Doe', role: 'admin', status: 'active' }],
      error: null
    });

    // Manually trigger initialization if needed or check existing items
    // Since userService is a singleton, it might already have items.
    // Let's create a new instance for isolated testing if possible, 
    // but usually singletons are initialized on import.
    
    // @ts-ignore - accessing private method for test
    await userService.initializeSupabase();
    
    const users = userService.getAll(undefined, true);
    expect(users[0].name).toBe('John Doe');
  });

  it('PropertyService should enforce tenant isolation through BaseService', () => {
    propertyService.create({ 
      name: 'Project A', 
      location: 'Loc A', 
      units: 10, 
      completedUnits: 5, 
      status: 'active' 
    }, 'comp-1');
    propertyService.create({ 
      name: 'Project B', 
      location: 'Loc B', 
      units: 20, 
      completedUnits: 10, 
      status: 'active' 
    }, 'comp-2');
    
    const comp1Properties = propertyService.getAll('comp-1', false);
    expect(comp1Properties).toHaveLength(1);
    expect(comp1Properties[0].name).toBe('Project A');
  });

  it('Services should trigger audit logs through BaseService', async () => {
    const { auditLogService } = await import('@/services/core/AuditLogService');
    const spy = vi.spyOn(auditLogService, 'logAction');
    
    propertyService.create({ 
      name: 'New Project', 
      location: 'Loc C', 
      units: 30, 
      completedUnits: 0, 
      status: 'planning' 
    }, 'comp-1');

    
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      action: 'created',
      entityType: 'property'
    }));
  });
});
