import { describe, it, expect, beforeEach } from 'vitest';
import { propertyService } from '../operations/PropertyService';

describe('PropertyService', () => {
  beforeEach(() => {
    localStorage.clear();
    (propertyService as any).items = [];
  });

  it('should calculate metrics correctly', async () => {
    await propertyService.create({
      name: "Test Property",
      location: "Test Location",
      units: 10,
      completedUnits: 0,
      status: "pending",
      milestones: []
    }, "comp-test");

    const metrics = propertyService.getMetrics(undefined, true);
    expect(metrics.total).toBe(1);
    expect(metrics.totalUnits).toBe(10);
  });


  it('should update milestone status and log it', async () => {
    const p = await propertyService.create({
      name: "Test Property 2",
      location: "Test Location 2",
      units: 5,
      completedUnits: 0,
      status: "pending",
      milestones: [
        { id: "m1", title: "Milestone 1", targetDate: new Date(), completed: false }
      ]
    }, "comp-test-2");

    const propertyId = p.id!;
    const milestoneId = "m1";
    
    // Test with isSuperAdmin=true
    const updated = await propertyService.updateMilestone(propertyId, milestoneId, true, true);
    
    expect(updated).toBeDefined();
    const milestone = updated?.milestones?.find(m => m.id === milestoneId);
    expect(milestone?.completed).toBe(true);
  });

});
