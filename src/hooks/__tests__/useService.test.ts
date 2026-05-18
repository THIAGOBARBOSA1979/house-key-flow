import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useService } from '../useService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({ toast: vi.fn() })),
}));

const mockService = {
  subscribe: vi.fn((cb) => {
    cb([{ id: '1', name: 'Item 1', company_id: 'comp-1' }]);
    return vi.fn(); // unsubscribe
  }),
  getAll: vi.fn(() => Promise.resolve([{ id: '1', name: 'Item 1', company_id: 'comp-1' }])),
};

describe('useService Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should subscribe to service and return items for a tenant', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: 'user-1', company_id: 'comp-1', is_super_admin: false }
    });

    const { result } = renderHook(() => useService(mockService));
    
    // items should be filtered by company_id in the subscribe callback logic of useService
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('1');
    expect(mockService.subscribe).toHaveBeenCalled();
  });

  it('should show empty list if no companyId and not super admin', () => {
    (useAuth as any).mockReturnValue({
      user: { id: 'user-2', company_id: null, is_super_admin: false }
    });

    const { result } = renderHook(() => useService(mockService));
    expect(result.current.items).toHaveLength(0);
  });
});
