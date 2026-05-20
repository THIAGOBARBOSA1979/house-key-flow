import { useState, useMemo, useCallback } from "react";

import { SortConfig } from "@/types";

export function useDataTable<T>(data: T[], itemsPerPage: number = 10) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);


  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a: any, b: any) => {
      const aVal = a[sortConfig.key!];
      const bVal = b[sortConfig.key!];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = useCallback((key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  return {
    sortedData: paginatedData,
    allSortedData: sortedData,
    sortConfig,
    handleSort,
    currentPage,
    setCurrentPage,
    totalPages
  };
}

