import { describe, it, expect } from 'vitest';
import { propertyService } from '../operations/PropertyService';

describe('PropertyService', () => {
  it('should calculate metrics correctly', () => {
    const metrics = propertyService.getMetrics();
    
    expect(metrics).toHaveProperty('total');
    expect(metrics).toHaveProperty('totalUnits');
    expect(metrics).toHaveProperty('averageProgress');
    
    // Based on INITIAL_PROPERTIES
    expect(metrics.total).toBeGreaterThanOrEqual(3);
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
