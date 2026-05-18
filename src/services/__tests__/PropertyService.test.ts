import { describe, it, expect, beforeEach } from 'vitest';
import { propertyService } from '../operations/PropertyService';

describe('PropertyService', () => {
  beforeEach(() => {
    localStorage.clear();
    // Re-initialize or reset items if needed
    (propertyService as any).items = [];
    // Manually add a property for testing to ensure isolation from INITIAL_PROPERTIES state
    propertyService.create({
      name: "Test Property",
      location: "Test Location",
      units: 10,
      completedUnits: 0,
      status: "pending",
      milestones: [
        { id: "m1", title: "Milestone 1", targetDate: new Date(), completed: false }
      ]
    }, "comp-test");
  });

  it('should calculate metrics correctly', () => {
    const metrics = propertyService.getMetrics(undefined, true);
    expect(metrics.total).toBe(1);
    expect(metrics.totalUnits).toBe(10);
  });

  it('should update milestone status and log it', () => {
    const all = propertyService.getAll(undefined, true);
    const propertyId = all[0].id!;
    const milestoneId = "m1";
    
    const updated = propertyService.updateMilestone(propertyId, milestoneId, true);
    
    expect(updated).toBeDefined();
    const milestone = updated?.milestones?.find(m => m.id === milestoneId);
    expect(milestone?.completed).toBe(true);
    expect(milestone?.completedAt).toBeDefined();
  });
});


