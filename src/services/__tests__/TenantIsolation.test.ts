import { describe, it, expect, beforeEach, vi } from 'vitest';
import { simulator } from '../../test/supabase-simulator';
import { propertyService } from '../operations/PropertyService';

import { userService } from '../identity/UserService';

describe('Security: Multi-tenant Data Isolation', () => {
  beforeEach(() => {
    // Reset simulator state
  beforeEach(() => {
    // Completely clear internal state of singleton
    (propertyService as any).items = [];
    
    // Seed test data with specific tenant IDs
    propertyService.create({ name: 'Prop T1', location: 'L1', units: 1, completedUnits: 0, status: 'pending' }, 'tenant-1');
    propertyService.create({ name: 'Prop T2', location: 'L2', units: 1, completedUnits: 0, status: 'pending' }, 'tenant-2');
  });

  it('should strictly filter data by company_id in BaseService', async () => {
    const allItems = (propertyService as any).items;
    const p1 = allItems.find((i: any) => i.company_id === 'tenant-1');
    const p2 = allItems.find((i: any) => i.company_id === 'tenant-2');

    // Tenant 1 request
    const t1Data = propertyService.getAll('tenant-1', false);
    expect(t1Data).toHaveLength(1);
    expect(t1Data[0].id).toBe('p-t1');

    // Tenant 2 request
    const t2Data = propertyService.getAll('tenant-2', false);
    expect(t2Data).toHaveLength(1);
    expect(t2Data[0].id).toBe('p-t2');
  });

  it('should block getById if ID belongs to another tenant', async () => {
    // Try to get T2 property from T1 context
    const maliciousAccess = propertyService.getById('p-t2', 'tenant-1', false);
    expect(maliciousAccess).toBeUndefined();
    
    // Successful access
    const legitAccess = propertyService.getById('p-t1', 'tenant-1', false);
    expect(legitAccess).toBeDefined();
  });

  it('should allow super_admin to bypass tenant isolation', () => {
    const allData = propertyService.getAll(undefined, true);
    expect(allData).toHaveLength(2);
  });
});
