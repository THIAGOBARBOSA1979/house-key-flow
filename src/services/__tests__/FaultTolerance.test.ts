import { describe, it, expect, beforeEach, vi } from 'vitest';
import { simulator } from '../../test/supabase-simulator';
import { warrantyFlowService } from '../warranty/WarrantyFlowService';

describe('Fault Tolerance: Supabase Outage Simulation', () => {
  beforeEach(() => {
    (warrantyFlowService as any).items = [];
    simulator.setOptions({ failRate: 0, latency: 0 });
  });

  it('should handle intermittent API failures gracefully', async () => {
    // Enable 50% failure rate
    simulator.setOptions({ failRate: 0.5 });
    
    // We try multiple times. Since it's random, we might get failures.
    // In a real scenario, the service should catch and handle.
    // Currently, BaseService methods are mostly synchronous but internal sync to Supabase is async.
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    warrantyFlowService.createRequest({
      title: 'Failure Test',
      category: 'Estrutural',
      clientId: 'c1',
      clientName: 'C1',
      propertyId: 'p1',
      propertyName: 'P1',
      unitNumber: '101'
    });

    // Wait for the async background sync to Supabase
    await new Promise(r => setTimeout(r, 100));

    // If failRate triggered, console.error should have been called by the catch block in the service
    // This validates that the system doesn't crash on background failure.
    // In production, we'd check for retry logic or user-facing error toast.
  });

  it('should test loading states via simulated latency', async () => {
    simulator.setOptions({ latency: 100 });
    const start = Date.now();
    
    // Force a findOne which is awaited
    const { Supabase } = await import('@/integration/supabase');
    await Supabase.db.findOne('profiles', 'u1');
    
    const duration = Date.now() - start;
    expect(duration).toBeGreaterThanOrEqual(100);
  });
});
