import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useService } from '../shared/useService';
import * as AuthContext from '@/contexts/AuthContext';
import { useToast } from '@/hooks';

// Mock dependencies
vi.mock('@/hooks', () => ({
  useToast: vi.fn(() => ({ toast: vi.fn() })),
}));

// We mock the whole module to control useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockService: any = {
  subscribe: vi.fn((cb) => {
    cb([{ id: '1', name: 'Item 1', company_id: 'comp-1' }]);
    return vi.fn(); // unsubscribe
  }),
  getAll: vi.fn(() => Promise.resolve([{ id: '1', name: 'Item 1', company_id: 'comp-1' }])),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  bulkUpdate: vi.fn(),
  bulkDelete: vi.fn(),
};


describe('useService Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should subscribe to service and return items for a tenant', async () => {
    // Inject mock implementation
    (AuthContext.useAuth as any).mockReturnValue({
      user: { id: 'user-1', company_id: 'comp-1', is_super_admin: false }
    });

    const { result } = renderHook(() => useService(mockService));
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('1');
    expect(mockService.subscribe).toHaveBeenCalled();
  });

  it('should show empty list if no companyId and not super admin', () => {
    (AuthContext.useAuth as any).mockReturnValue({
      user: { id: 'user-2', company_id: null, is_super_admin: false }
    });

    const { result } = renderHook(() => useService(mockService));
    expect(result.current.items).toHaveLength(0);
  });
});
