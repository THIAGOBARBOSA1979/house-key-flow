
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataList } from './useDataList';

describe('useDataList hook', () => {
  const mockItems = [
    { id: '1', name: 'Alpha', category: 'A', unit: '101' },
    { id: '2', name: 'Beta', category: 'B', propertyName: 'Residence' },
    { id: '3', name: 'Gamma', category: 'A', email: 'test@example.com' },
  ];

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDataList(mockItems));
    
    expect(result.current.filteredItems).toHaveLength(3);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.currentPage).toBe(1);
  });

  it('should filter items by searchTerm across multiple fields', () => {
    const { result, rerender } = renderHook(({ items }) => useDataList(items), {
      initialProps: { items: mockItems }
    });
    
    // Search by name
    act(() => {
      result.current.setSearchTerm('Alpha');
    });
    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].name).toBe('Alpha');

    // Search by unit
    act(() => {
      result.current.setSearchTerm('101');
    });
    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].unit).toBe('101');

    // Search by email
    act(() => {
      result.current.setSearchTerm('test@example.com');
    });
    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].name).toBe('Gamma');

    // Search by propertyName
    act(() => {
      result.current.setSearchTerm('Residence');
    });
    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].name).toBe('Beta');
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
    expect(result.current.filteredItems[2].name).toBe('Alpha');
  });

  it('should handle pagination', () => {
    const { result } = renderHook(() => useDataList(mockItems, {
      itemsPerPage: 2
    }));
    
    expect(result.current.paginatedItems).toHaveLength(2);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.setCurrentPage(2);
    });

    expect(result.current.paginatedItems).toHaveLength(1);
    expect(result.current.paginatedItems[0].name).toBe('Gamma');
  });

  it('should handle selection correctly', () => {
    const { result } = renderHook(() => useDataList(mockItems));
    
    act(() => {
      result.current.toggleSelect('1');
    });
    
    expect(result.current.selectedIds).toContain('1');
    
    act(() => {
      result.current.toggleSelect('1'); // Toggle off
    });
    expect(result.current.selectedIds).not.toContain('1');

    act(() => {
      result.current.selectAll(['1', '2', '3']);
    });
    
    expect(result.current.selectedIds).toHaveLength(3);
    
    act(() => {
      result.current.selectAll(['1', '2', '3']); // Toggle off (all selected)
    });
    
    expect(result.current.selectedIds).toHaveLength(0);
  });

  it('should clear filters', () => {
    const { result } = renderHook(() => useDataList(mockItems, {
      initialFilters: { category: 'A' }
    }));
    
    act(() => {
      result.current.setSearchTerm('Alpha');
      result.current.setFilters({ category: 'B' });
    });

    expect(result.current.searchTerm).toBe('Alpha');
    expect(result.current.filters.category).toBe('B');

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.searchTerm).toBe('');
    expect(result.current.filters.category).toBe('A');
  });
});
