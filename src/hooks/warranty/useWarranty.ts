import { useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { warrantyFlowService, exportService } from "@/services";
import { 
  WarrantyRequestFlow, 
  WarrantyFilters, 
  WarrantyStage,
  KanbanCardData
} from "@/types/warrantyFlow";
import { useToast, useService, useDataList } from "@/hooks";

export const useWarranty = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const companyId = user?.company_id;
  const isSuperAdmin = !!user?.is_super_admin;
  
  const { items: requests, isLoading: isServiceLoading, refresh: refreshList } = useService<WarrantyRequestFlow>(warrantyFlowService);

  const filterFn = useCallback((request: WarrantyRequestFlow, currentFilters: any) => {
    if (currentFilters.propertyId && currentFilters.propertyId !== "all" && request.propertyId !== currentFilters.propertyId) return false;
    if (currentFilters.category && currentFilters.category !== "all" && request.category !== currentFilters.category) return false;
    if (currentFilters.priority && currentFilters.priority !== "all" && request.priority !== currentFilters.priority) return false;
    if (currentFilters.slaStatus && currentFilters.slaStatus !== "all" && request.slaStatus !== currentFilters.slaStatus) return false;
    if (currentFilters.isPaused !== undefined && request.isPaused !== currentFilters.isPaused) return false;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        request.title.toLowerCase().includes(term) ||
        request.clientName?.toLowerCase().includes(term) ||
        request.id.toLowerCase().includes(term)
      );
    }
    
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
    initialFilters: { propertyId: "all", category: "all", priority: "all", slaStatus: "all" },
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
        refreshList();
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
  }, [toast, refreshList]);

  const togglePause = useCallback((requestId: string, isPaused: boolean, reason: string) => {
    const result = warrantyFlowService.togglePause(requestId, isPaused, reason, "admin-1");
    if (result.success) {
      toast({ title: isPaused ? "SLA Pausado" : "SLA Retomado", description: isPaused ? `Motivo: ${reason}` : "O cronômetro do SLA foi retomado." });
      refreshList();
    }
    return result;
  }, [toast, refreshList]);

  const assignTechnician = useCallback((requestId: string, techId: string, techName: string) => {
    const result = warrantyFlowService.assignTechnician(requestId, techId, techName, "admin-1");
    if (result.success) {
      toast({ title: "Técnico atribuído", description: `O profissional ${techName} agora é o responsável.` });
      refreshList();
    }
    return result;
  }, [toast, refreshList]);

  const exportData = useCallback(() => {
    exportService.exportToCSV(filteredRequests, "garantias_a2");
    toast({ title: "Exportação concluída", description: "O arquivo CSV foi baixado com sucesso." });
  }, [filteredRequests, toast]);

  const metrics = useMemo(() => warrantyFlowService.calculateMetrics(), [requests]);

  return {
    requests,
    filteredRequests,
    kanbanData,
    isLoading: isServiceLoading,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    selectedRequest,
    setSelectedRequestId,
    changeStatus,
    togglePause,
    assignTechnician,
    exportData,
    clearFilters,
    refresh: refreshList,
    metrics
  };
};

