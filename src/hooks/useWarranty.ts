import { useState, useCallback, useMemo, useEffect } from "react";
import { warrantyFlowService } from "@/services";
import { 
  WarrantyRequestFlow, 
  WarrantyFilters, 
  WarrantyStage,
  KanbanCardData
} from "@/types/warrantyFlow";
import { useToast } from "@/hooks/use-toast";
import { exportService } from "@/services/ExportService";

export const useWarranty = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<WarrantyFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [requests, setRequests] = useState<WarrantyRequestFlow[]>(() => warrantyFlowService.getAllRequests());

  useEffect(() => {
    return warrantyFlowService.subscribe((newRequests) => {
      setRequests(newRequests);
    });
  }, []);

  const loadData = useCallback(() => {
    setRequests(warrantyFlowService.getAllRequests());
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!r.title.toLowerCase().includes(s) && !r.clientName.toLowerCase().includes(s)) return false;
      }
      if (filters.propertyId && r.propertyId !== filters.propertyId) return false;
      if (filters.category && r.category !== filters.category) return false;
      if (filters.priority && r.priority !== filters.priority) return false;
      if (filters.slaStatus && r.slaStatus !== filters.slaStatus) return false;
      return true;
    });
  }, [filters, requests]);

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
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    isLoading,
    error,
    filters,
    setFilters,
    selectedRequest,
    setSelectedRequestId,
    changeStatus,
    togglePause,
    assignTechnician,
    exportData,
    refresh: loadData
  };
};

