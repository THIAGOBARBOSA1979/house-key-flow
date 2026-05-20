import { useState, useMemo, useCallback } from 'react';

export interface UseDataListOptions<T> {
  initialFilters?: Record<string, any>;
  filterFn?: (item: T, filters: any) => boolean;
  sortFn?: (a: T, b: T) => number;
  itemsPerPage?: number;
}

export function useDataList<T extends { id: string }>(
  items: T[],
  options: UseDataListOptions<T> = {}
) {
  const { itemsPerPage = 0 } = options;

  const [filters, setFilters] = useState<Record<string, any>>(options.initialFilters || {});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    let result = [...items].filter(Boolean);

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item: any) => {
        if (!item) return false;
        // Generic search across common fields
        return (
          item.name?.toLowerCase().includes(lowerSearch) ||
          item.title?.toLowerCase().includes(lowerSearch) ||
          item.description?.toLowerCase().includes(lowerSearch) ||
          item.email?.toLowerCase().includes(lowerSearch)
        );
      });
    }

    if (options.filterFn) {
      result = result.filter(item => item && options.filterFn!(item, filters));
    }

    if (options.sortFn) {
      result.sort(options.sortFn);
    }

    return result;
  }, [items, filters, searchTerm, options]);

  const paginatedItems = useMemo(() => {
    if (!itemsPerPage) return filteredItems;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);


  const totalPages = itemsPerPage ? Math.ceil(filteredItems.length / itemsPerPage) : 1;

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    if (selectedIds.length === ids.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ids);
    }
  }, [selectedIds]);

  const clearFilters = useCallback(() => {
    setFilters(options.initialFilters || {});
    setSearchTerm('');
  }, [options.initialFilters]);

  return {
    filteredItems,
    paginatedItems,
    currentPage,
    setCurrentPage,
    totalPages,
    filters,
    setFilters,
    selectedIds,
    setSelectedIds,
    toggleSelect,
    selectAll,
    searchTerm,
    setSearchTerm,
    clearFilters,
  };
}
