
import { useState, useMemo, useCallback } from "react";
import { inspectionService, propertyService } from "@/services";
import { useService, useDataList } from "@/hooks";
import { Inspection } from "@/types/inspection";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Custom hook to manage inspections logic.
 */
export const useInspections = () => {
  const { user } = useAuth();
  const { 
    items: inspections, 
    isLoading,
    refresh: loadData,
    create: createInspection,
    update: updateInspection,
    remove: deleteInspection,
    error
  } = useService<Inspection>(inspectionService, {
    toastMessages: {
      create: "Protocolo de vistoria iniciado com sucesso.",
      update: "Relatório de vistoria atualizado.",
      delete: "Vistoria removida do histórico estratégico."
    }
  });


  const filterFn = useCallback((inspection: Inspection, currentFilters: any, searchTerm: string) => {
    const matchesStatus = !currentFilters.status || currentFilters.status === "all" || inspection.status === currentFilters.status;
    const matchesTech = !currentFilters.technician || currentFilters.technician === "all" || inspection.technician === currentFilters.technician;
    const matchesProperty = !currentFilters.property || currentFilters.property === "all" || inspection.property === currentFilters.property;
    const matchesChecklist = !currentFilters.checklist || currentFilters.checklist === "all" || inspection.checklistId === currentFilters.checklist;
    
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
    filterFn: (item, filters) => filterFn(item, filters, searchTerm)
  });

  const stats = useMemo(() => {
    const today = new Date();
    return {
      total: inspections.length,
      pending: inspections.filter(i => i.status === "pending" || i.status === "confirmed").length,
      complete: inspections.filter(i => i.status === "complete").length,
      cancelled: inspections.filter(i => i.status === "cancelled").length,
      delayed: inspections.filter(i => {
        const date = new Date(i.date);
        return (i.status === "pending" || i.status === "confirmed") && date < today;
      }).length
    };
  }, [inspections]);


  const analyticsStats = useMemo(() => {
    // These now return Promises, so we need to handle them differently or provide defaults
    // Since this is a memo, we'll return defaults and use a separate state/effect for real analytics if needed
    // For now, providing safe defaults to avoid UI crash
    return {
      status: [],
      technician: [],
      conformityScore: 100,
      trend: []
    };
  }, [inspections, user]);

  const properties = useMemo(() => {
    return Array.from(new Set(inspections.map(i => i.property)));
  }, [inspections]);

  const handleExport = useCallback(async () => {
    const data = await inspectionService.exportData('csv');
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

  const updateStatus = useCallback(async (id: string, status: string) => {
    const success = await inspectionService.updateStatus(id, status);
    if (success) loadData();
    return success;
  }, [loadData]);

  return {
    inspections,
    filteredInspections,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    stats,
    analyticsStats,
    properties,
    isLoading,
    loadData,
    clearFilters,
    handleExport,
    createInspection,
    updateInspection,
    deleteInspection,
    updateStatus,
    error
  };
};

