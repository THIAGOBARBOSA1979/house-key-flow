
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { securityService } from '../SystemSecurityService';
import { Supabase } from '@/integrations/supabase';

// Mock auditLogService
vi.mock('../../core/AuditLogService', () => ({
  auditLogService: {
    log: vi.fn().mockResolvedValue(true)
  }
}));

// Mock Supabase
vi.mock('@/integrations/supabase', () => ({
  Supabase: {
    auth: {
      getSession: vi.fn()
    }
  }
}));


describe('SystemSecurityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should validate email correctly', () => {
    expect(securityService.validateEmail('test@example.com')).toBe(true);
    expect(securityService.validateEmail('invalid-email')).toBe(false);
    expect(securityService.validateEmail('test@')).toBe(false);
  });

  it('should sanitize strings by removing sensitive characters', () => {
    const malicious = '<script>alert("xss")</script>';
    const sanitized = securityService.sanitizeString(malicious);
    expect(sanitized).not.toContain('<');
    expect(sanitized).not.toContain('>');
  });

  it('should handle session timeouts', () => {
    const onTimeout = vi.fn();
    
    // Simulate being logged in
    (Supabase.auth.getSession as any).mockResolvedValue({ user: { id: '1' } });

    
    const cleanup = securityService.initialize(onTimeout);
    
    // Advance time by 31 minutes (timeout is 30m)
    vi.advanceTimersByTime(31 * 60 * 1000);
    
    // Since the check is async, we need to wait a bit
    await vi.waitFor(() => {
      expect(onTimeout).toHaveBeenCalled();
    });

    
    if (cleanup) cleanup();
  });

  it('should reset inactivity timer on user interaction', () => {
    const onTimeout = vi.fn();
    (Supabase.auth.getSession as any).mockResolvedValue({ user: { id: '1' } });
    
    const cleanup = securityService.initialize(onTimeout);
    
    // Advance 20 minutes
    vi.advanceTimersByTime(20 * 60 * 1000);
    
    // Simulate interaction
    window.dispatchEvent(new MouseEvent('mousemove'));
    
    // Advance another 20 minutes (total 40m, but 20m since last interaction)
    vi.advanceTimersByTime(20 * 60 * 1000);
    
    expect(onTimeout).not.toHaveBeenCalled();
    
    // Advance another 15 minutes (total 35m since interaction)
    vi.advanceTimersByTime(15 * 60 * 1000);
    await vi.waitFor(() => {
      expect(onTimeout).toHaveBeenCalled();
    });


    if (cleanup) cleanup();
  });
});
