
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
    remove: deleteInspection
  } = useService<Inspection>(inspectionService);

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
    const statusRaw = inspectionService.getStatsByStatus(user?.company_id, user?.is_super_admin);
    const techRaw = inspectionService.getStatsByTechnician(user?.company_id, user?.is_super_admin);

    return {
      status: Object.entries(statusRaw).map(([name, value]) => ({ 
        name: name === 'pending' ? 'Pendente' : name === 'complete' ? 'Concluído' : name === 'progress' ? 'Em andamento' : name, 
        value 
      })),
      technician: Object.entries(techRaw).map(([name, value]) => ({ name, value }))
    };
  }, [inspections, user]);

  const properties = useMemo(() => {
    return Array.from(new Set(inspections.map(i => i.property)));
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
    updateStatus
  };
};
