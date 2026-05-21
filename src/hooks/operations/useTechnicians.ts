import { useState, useCallback, useMemo, useEffect } from "react";
import { technicianService, type Technician, exportService } from "@/services";
import { errorHandler } from "@/utils/errors/ErrorHandler";
import { useToast } from "../shared/use-toast";


export const useTechnicians = () => {
  const { toast } = useToast();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);


  const refreshList = useCallback(() => {
    setIsLoading(true);
    try {
      setError(null);
      setTechnicians(technicianService.getAll());
    } catch (err) {
      setError(err);
      errorHandler.handle(err, 'useTechnicians:refreshList');
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const saveTechnician = useCallback((data: any, id?: string) => {
    if (id) {
      technicianService.update(id, data);
      toast({ title: "Técnico atualizado", description: "As informações foram salvas com sucesso." });
    } else {
      technicianService.create(data);
      toast({ title: "Técnico cadastrado", description: "O novo técnico já pode ser alocado para vistorias." });
    }
    refreshList();
  }, [refreshList, toast]);

  const deleteTechnician = useCallback((id: string) => {
    if (technicianService.delete(id)) {
      refreshList();
      toast({ title: "Técnico removido", description: "O cadastro foi excluído com sucesso.", variant: "destructive" });
    }
  }, [refreshList, toast]);

  const toggleTechnicianStatus = useCallback((id: string) => {
    const tech = technicians.find(t => t.id === id);
    if (tech) {
      const newStatus = tech.status === 'active' ? 'inactive' : 'active';
      technicianService.update(id, { status: newStatus });
      refreshList();
      toast({ title: "Status atualizado", description: `O técnico agora está ${newStatus === 'active' ? 'ativo' : 'inativo'}.` });
    }
  }, [technicians, refreshList, toast]);

  const handleBulkDelete = useCallback(() => {
    selectedIds.forEach(id => technicianService.delete(id));
    refreshList();
    setSelectedIds([]);
    toast({ title: "Ação concluída", description: `${selectedIds.length} técnicos foram removidos.`, variant: "destructive" });
  }, [selectedIds, refreshList, toast]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const exportData = useCallback(() => {
    exportService.exportToCSV(technicians, 'tecnicos_a2');
  }, [technicians]);

  const stats = useMemo(() => ({
    total: technicians.length,
    active: technicians.filter(t => t.status === "active").length,
    avgRating: (technicians.reduce((acc, t) => acc + t.rating, 0) / technicians.length || 0).toFixed(1),
    totalJobs: technicians.reduce((acc, t) => acc + t.completedJobs, 0),
  }), [technicians]);

  return {
    technicians,
    isLoading,
    selectedIds,
    stats,
    saveTechnician,
    deleteTechnician,
    toggleTechnicianStatus,
    handleBulkDelete,
    toggleSelect,
    clearSelection,
    exportData,
    refreshList,
    error

  };
};
