import { useState, useMemo, useCallback } from "react";
import { SortConfig } from "@/types";

export function useDataTable<T>(data: T[], itemsPerPage: number = 10) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);


  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a: any, b: any) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const setPage = (page: number) => {
    setCurrentPage(page);
  };

  return {
    sortedData,
    paginatedData,
    currentPage,
    totalPages,
    sortConfig,
    requestSort,
    setPage,
  };
}
