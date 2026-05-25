import { useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { warrantyFlowService, exportService } from "@/services";
import { 
  WarrantyRequestFlow, 
  WarrantyFilters, 
  WarrantyStage,
  KanbanCardData,
  WarrantyMetrics
} from "@/types/warrantyFlow";
import { useToast, useService, useDataList } from "@/hooks";

export const useWarranty = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const companyId = user?.company_id;
  const userId = user?.id || "unknown-user";
  const isSuperAdmin = !!user?.is_super_admin;
  
  const { items: requests, isLoading: isServiceLoading, refresh: refreshList, error } = useService<WarrantyRequestFlow>(warrantyFlowService, {
    toastMessages: {
      create: "Protocolo de garantia aberto com sucesso.",
      update: "Registro de garantia sincronizado.",
      delete: "Protocolo de garantia arquivado."
    }
  });

  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const filterFn = useCallback((request: WarrantyRequestFlow, currentFilters: Partial<WarrantyFilters>) => {
    if (currentFilters.propertyId && currentFilters.propertyId !== "all" && request.propertyId !== currentFilters.propertyId) return false;
    if (currentFilters.category && currentFilters.category !== "all" && request.category !== currentFilters.category) return false;
    if (currentFilters.priority && currentFilters.priority !== "all" && request.priority !== currentFilters.priority) return false;
    if (currentFilters.slaStatus && (currentFilters.slaStatus as string) !== "all" && request.slaStatus !== currentFilters.slaStatus) return false;
    if (currentFilters.isPaused !== undefined && request.isPaused !== currentFilters.isPaused) return false;
    
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
      const result = await Promise.resolve(warrantyFlowService.changeStatus(requestId, newStage, userId, false, notes));
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
  }, [toast, refreshList, userId]);

  const togglePause = useCallback(async (requestId: string, isPaused: boolean, reason: string) => {
    const result = await warrantyFlowService.togglePause(requestId, isPaused, reason, userId);
    if (result.success) {
      toast({ title: isPaused ? "SLA Pausado" : "SLA Retomado", description: isPaused ? `Motivo: ${reason}` : "O cronômetro do SLA foi retomado." });
      refreshList();
    }
    return result;
  }, [toast, refreshList, userId]);

  const assignTechnician = useCallback(async (requestId: string, techId: string, techName: string) => {
    const result = await warrantyFlowService.assignTechnician(requestId, techId, techName, userId);
    if (result.success) {
      toast({ title: "Técnico atribuído", description: `O profissional ${techName} agora é o responsável.` });
      refreshList();
    }
    return result;
  }, [toast, refreshList, userId]);

  const exportData = useCallback(() => {
    exportService.exportToCSV(filteredRequests, "garantias_a2");
    toast({ title: "Exportação concluída", description: "O arquivo CSV foi baixado com sucesso." });
  }, [filteredRequests, toast]);

  const [metrics, setMetrics] = useState<WarrantyMetrics | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const data = await warrantyFlowService.calculateMetrics(companyId, isSuperAdmin);
      setMetrics(data);
    };
    fetchMetrics();
  }, [requests, companyId, isSuperAdmin]);

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
    metrics,
    error
  };
};


