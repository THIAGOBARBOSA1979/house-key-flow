import { describe, it, expect, beforeEach } from 'vitest';
import { propertyService } from '../operations/PropertyService';

describe('PropertyService', () => {
  beforeEach(() => {
    localStorage.clear();
    // Re-initialize or reset items if needed, but BaseService uses INITIAL_PROPERTIES
    // and we can pass true for isSuperAdmin to get everything
  });

  it('should calculate metrics correctly', () => {
    // Pass isSuperAdmin=true to ensure we bypass company check in test
    const metrics = propertyService.getMetrics(undefined, true);
    
    expect(metrics).toHaveProperty('total');
    expect(metrics).toHaveProperty('totalUnits');
    expect(metrics).toHaveProperty('averageProgress');
    
    // Based on INITIAL_PROPERTIES (3 items)
    expect(metrics.total).toBe(3);
  });

  it('should update milestone status and log it', () => {
    const propertyId = "1";
    const milestoneId = "m3";
    
    const updated = propertyService.updateMilestone(propertyId, milestoneId, true);
    
    expect(updated).toBeDefined();
    const milestone = updated?.milestones?.find(m => m.id === milestoneId);
    expect(milestone?.completed).toBe(true);
    expect(milestone?.completedAt).toBeDefined();
  });
});

