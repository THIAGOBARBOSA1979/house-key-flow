import { useState, useMemo, useCallback } from "react";
import { inspectionService } from "@/services";
import { useService, useDataList } from "@/hooks";
import { Inspection } from "@/types/inspection";

/**
 * Custom hook to manage inspections logic.
 */
export const useInspections = () => {
  const { 
    items: inspections, 
    isLoading, 
    refresh: loadData,
    create: createInspection,
    update: updateInspection,
    remove: deleteInspection
  } = useService<Inspection>(inspectionService);

  const filterFn = useCallback((inspection: Inspection, currentFilters: any) => {
    const matchesStatus = currentFilters.status === "all" || inspection.status === currentFilters.status;
    const matchesTech = currentFilters.technician === "all" || inspection.technician === currentFilters.technician;
    const matchesProperty = currentFilters.property === "all" || inspection.property === currentFilters.property;
    const matchesChecklist = currentFilters.checklist === "all" || inspection.checklistId === currentFilters.checklist;
    
    const matchesSearch = !searchTerm || 
      inspection.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.unit.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesTech && matchesProperty && matchesChecklist && matchesSearch;
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
      total: inspections.length,
      pending: inspections.filter(i => i.status === "pending").length,
      completed: inspections.filter(i => i.status === "complete").length,
      delayed: inspections.filter(i => {
        const date = new Date(i.date);
        return i.status === "pending" && date < today;
      }).length
    };
  }, [inspections]);

  const handleExport = useCallback(() => {
    const data = inspectionService.exportData('csv');
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-vistorias-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, []);

  return {
    inspections,
    filteredInspections,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    stats,
    isLoading,
    loadData,
    clearFilters,
    handleExport,
    createInspection,
    updateInspection,
    deleteInspection
  };
};

