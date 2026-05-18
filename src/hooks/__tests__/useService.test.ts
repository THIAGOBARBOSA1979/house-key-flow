import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useService } from '../useService';

// Mock service
const mockService = {
  subscribe: vi.fn((cb) => {
    cb([{ id: '1', name: 'Item 1', company_id: 'comp-1' }]);
    return vi.fn(); // unsubscribe
  }),
  getAll: vi.fn(() => [{ id: '1', name: 'Item 1', company_id: 'comp-1' }]),
};

describe('useService Hook', () => {
  it('should subscribe to service and return items', () => {
    const { result } = renderHook(() => useService(mockService as any, 'comp-1'));
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Item 1');
    expect(mockService.subscribe).toHaveBeenCalled();
  });

  it('should respect companyId filtering in getAll', () => {
    renderHook(() => useService(mockService as any, 'comp-2'));
    expect(mockService.getAll).toHaveBeenCalledWith('comp-2', undefined);
  });
});
