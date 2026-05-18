
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataList } from './useDataList';

describe('useDataList hook', () => {
  const mockItems = [
    { id: '1', name: 'Alpha', category: 'A' },
    { id: '2', name: 'Beta', category: 'B' },
    { id: '3', name: 'Gamma', category: 'A' },
  ];

  it('should filter items by searchTerm', () => {
    const { result } = renderHook(() => useDataList(mockItems));
    
    act(() => {
      result.current.setSearchTerm('Alpha');
    });
    
    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].name).toBe('Alpha');
  });

  it('should apply custom filter function', () => {
    const { result } = renderHook(() => useDataList(mockItems, {
      filterFn: (item, filters) => !filters.category || item.category === filters.category
    }));
    
    act(() => {
      result.current.setFilters({ category: 'B' });
    });
    
    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].name).toBe('Beta');
  });

  it('should sort items with custom sort function', () => {
    const { result } = renderHook(() => useDataList(mockItems, {
      sortFn: (a, b) => b.name.localeCompare(a.name)
    }));
    
    expect(result.current.filteredItems[0].name).toBe('Gamma');
  });

  it('should handle selection correctly', () => {
    const { result } = renderHook(() => useDataList(mockItems));
    
    act(() => {
      result.current.toggleSelect('1');
    });
    
    expect(result.current.selectedIds).toContain('1');
    
    act(() => {
      result.current.selectAll(['1', '2', '3']);
    });
    
    expect(result.current.selectedIds).toHaveLength(3);
    
    act(() => {
      result.current.selectAll(['1', '2', '3']); // Toggle off
    });
    
    expect(result.current.selectedIds).toHaveLength(0);
  });
});
