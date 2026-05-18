import { useState, useCallback, useMemo } from "react";
import { warrantyFlowService, exportService } from "@/services";
import { 
  WarrantyRequestFlow, 
  WarrantyFilters, 
  WarrantyStage,
  KanbanCardData
} from "@/types/warrantyFlow";
import { useToast, useService, useDataList } from "@/hooks";

export const useWarranty = () => {
  const { toast } = useToast();
  
  const { items: requests, isLoading: isServiceLoading } = useService<WarrantyRequestFlow>(warrantyFlowService);

  const filterFn = useCallback((request: WarrantyRequestFlow, filters: WarrantyFilters) => {
    if (filters.propertyId && request.propertyId !== filters.propertyId) return false;
    if (filters.category && request.category !== filters.category) return false;
    if (filters.priority && request.priority !== filters.priority) return false;
    if (filters.slaStatus && request.slaStatus !== filters.slaStatus) return false;
    if (filters.isPaused !== undefined && request.isPaused !== filters.isPaused) return false;
    return true;
  }, []);

  const {
    filteredItems: filteredRequests,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    clearFilters
  } = useDataList<WarrantyRequestFlow>(requests, {
    filterFn
  });

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const kanbanData = useMemo(() => {
    const data = new Map<WarrantyStage, KanbanCardData[]>();
    filteredRequests.forEach(request => {
      const stage = request.currentStage;
      if (!data.has(stage)) data.set(stage, []);
      data.get(stage)?.push({
        id: request.id,
        request,
        slaInfo: {
          stage: request.currentStage,
          startedAt: request.stageStartedAt,
          deadline: request.slaDeadline,
          status: request.slaStatus,
          hoursRemaining: 0, 
          percentageRemaining: 0 
        },
        dragDisabled: false
      });
    });
    return data;
  }, [filteredRequests]);

  const selectedRequest = useMemo(() => {
    return requests.find(r => r.id === selectedRequestId) || null;
  }, [requests, selectedRequestId]);

  const changeStatus = useCallback(async (requestId: string, newStage: WarrantyStage, notes?: string) => {
    try {
      const result = await Promise.resolve(warrantyFlowService.changeStatus(requestId, newStage, "admin-1", false, notes));
      if (result.success) {
        toast({ title: "Status atualizado", description: `Solicitação movida para ${newStage}.` });
        return result;
      } else {
        toast({ title: "Erro ao atualizar", description: result.error || "Não foi possível alterar o status.", variant: "destructive" });
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar status";
      toast({ title: "Erro inesperado", description: errorMessage, variant: "destructive" });
      return { success: false, error: errorMessage };
    }
  }, [toast]);

  const togglePause = useCallback((requestId: string, isPaused: boolean, reason: string) => {
    const result = warrantyFlowService.togglePause(requestId, isPaused, reason, "admin-1");
    if (result.success) {
      toast({ title: isPaused ? "SLA Pausado" : "SLA Retomado", description: isPaused ? `Motivo: ${reason}` : "O cronômetro do SLA foi retomado." });
    }
    return result;
  }, [toast]);

  const assignTechnician = useCallback((requestId: string, techId: string, techName: string) => {
    const result = warrantyFlowService.assignTechnician(requestId, techId, techName, "admin-1");
    if (result.success) {
      toast({ title: "Técnico atribuído", description: `O profissional ${techName} agora é o responsável.` });
    }
    return result;
  }, [toast]);

  const exportData = useCallback(() => {
    exportService.exportToCSV(requests, "garantias_a2");
    toast({ title: "Exportação concluída", description: "O arquivo CSV foi baixado com sucesso." });
  }, [requests, toast]);

  return {
    requests,
    filteredRequests,
    kanbanData,
    isLoading: isServiceLoading,
    filters: { ...filters, search: searchTerm },
    setFilters: (newFilters: Partial<WarrantyFilters>) => {
      if (newFilters.search !== undefined) setSearchTerm(newFilters.search);
      setFilters(prev => ({ ...prev, ...newFilters }));
    },
    selectedRequest,
    setSelectedRequestId,
    changeStatus,
    togglePause,
    assignTechnician,
    exportData,
    clearFilters,
    refresh: () => {} // Refresh handled by useService effect
  };
};

