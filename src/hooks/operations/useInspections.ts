import { useState, useMemo, useCallback } from "react";
import { inspectionService } from "@/services";
import { useService, useDataList } from "@/hooks";
import { Inspection } from "@/types/inspection";

/**
 * Custom hook to manage inspections logic.
 */
export const useInspections = () => {
  const { items: inspections, isLoading, refresh: loadData } = useService<Inspection>(inspectionService);

  const filterFn = useCallback((inspection: Inspection, filters: any) => {
    const matchesStatus = filters.status === "all" || inspection.status === filters.status;
    const matchesTech = filters.technician === "all" || inspection.technician === filters.technician;
    const matchesProperty = filters.property === "all" || inspection.property === filters.property;
    const matchesChecklist = filters.checklist === "all" || inspection.checklistId === filters.checklist;
    
    return matchesStatus && matchesTech && matchesProperty && matchesChecklist;
  }, []);

  const {
    filteredItems: filteredInspections,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    clearFilters
  } = useDataList<Inspection>(inspections, {
    initialFilters: { status: "all", technician: "all", property: "all", checklist: "all" },
    filterFn
  });

  const stats = useMemo(() => {
    const today = new Date();
    return {
      pending: inspections.filter(i => i.status === "pending").length,
      completed: inspections.filter(i => i.status === "complete").length,
      delayed: inspections.filter(i => {
        const date = new Date(i.date);
        return i.status === "pending" && date < today;
      }).length
    };
  }, [inspections]);

  return {
    inspections,
    filteredInspections,
    searchTerm,
    setSearchTerm,
    filterStatus: filters.status,
    setFilterStatus: (val: string) => setFilters(prev => ({ ...prev, status: val })),
    filterTechnician: filters.technician,
    setFilterTechnician: (val: string) => setFilters(prev => ({ ...prev, technician: val })),
    filterProperty: filters.property,
    setFilterProperty: (val: string) => setFilters(prev => ({ ...prev, property: val })),
    filterChecklist: filters.checklist,
    setFilterChecklist: (val: string) => setFilters(prev => ({ ...prev, checklist: val })),
    stats,
    isLoading,
    loadData,
    clearFilters,
    handleExport
  };
};
