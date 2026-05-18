import { useState, useMemo, useCallback, useEffect } from "react";
import { inspectionService, Inspection } from "@/services/InspectionService";
import { useToast } from "@/components/ui/use-toast";

/**
 * Custom hook to manage inspections logic.
 */
export const useInspections = () => {
  const { toast } = useToast();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTechnician, setFilterTechnician] = useState("all");
  const [filterProperty, setFilterProperty] = useState("all");
  const [filterChecklist, setFilterChecklist] = useState("all");

  const loadData = useCallback(() => {
    setInspections(inspectionService.getAll());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredInspections = useMemo(() => {
    return inspections.filter(inspection => {
      const matchesSearch = 
        inspection.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.unit.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || inspection.status === filterStatus;
      const matchesTech = filterTechnician === "all" || inspection.technician === filterTechnician;
      const matchesProperty = filterProperty === "all" || inspection.property === filterProperty;
      const matchesChecklist = filterChecklist === "all" || inspection.checklistId === filterChecklist;
      
      return matchesSearch && matchesStatus && matchesTech && matchesProperty && matchesChecklist;
    });
  }, [inspections, searchTerm, filterStatus, filterTechnician, filterProperty, filterChecklist]);

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

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterTechnician("all");
    setFilterProperty("all");
    setFilterChecklist("all");
  }, []);

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
    
    toast({
      title: "Relatório gerado",
      description: "O arquivo CSV foi baixado com sucesso.",
    });
  }, [toast]);

  return {
    inspections,
    filteredInspections,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterTechnician,
    setFilterTechnician,
    filterProperty,
    setFilterProperty,
    filterChecklist,
    setFilterChecklist,
    stats,
    loadData,
    clearFilters,
    handleExport
  };
};
