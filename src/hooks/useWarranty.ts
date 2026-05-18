import { useState, useCallback, useMemo, useEffect } from "react";
import { warrantyFlowService } from "@/services/WarrantyFlowService";
import { 
  WarrantyRequestFlow, 
  WarrantyFilters, 
  WarrantyStage,
  KanbanCardData
} from "@/types/warrantyFlow";
import { useToast } from "@/hooks/use-toast";
import { exportService } from "@/services/ExportService";

/**
 * Centralized hook for Warranty management logic.
 */
export const useWarranty = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<WarrantyRequestFlow[]>([]);
  const [filters, setFilters] = useState<WarrantyFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const data = warrantyFlowService.getAllRequests();
      setRequests(data);
    } catch (error) {
      console.error("Error loading warranty data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as solicitações de garantia.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!r.title.toLowerCase().includes(s) && !r.clientName.toLowerCase().includes(s)) return false;
      }
      if (filters.propertyId && r.propertyId !== filters.propertyId) return false;
      return true;
    });
  }, [filters, requests]);

  const kanbanData = useMemo(() => {
    // We reuse the filtered requests to build kanban data
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
          hoursRemaining: 0, // Placeholder
          percentageRemaining: 0 // Placeholder
        },
        dragDisabled: false
      });
    });
    return data;
  }, [filteredRequests]);

  const selectedRequest = useMemo(() => {
    return requests.find(r => r.id === selectedRequestId) || null;
  }, [requests, selectedRequestId]);

  const changeStatus = useCallback((requestId: string, newStage: WarrantyStage, notes?: string) => {
    const result = warrantyFlowService.changeStatus(requestId, newStage, 'admin-1', false, notes);
    if (result.success) {
      loadData();
      toast({
        title: "Status atualizado",
        description: `Solicitação movida para a etapa desejada.`
      });
    } else {
      toast({
        title: "Erro ao atualizar",
        description: result.error || "Não foi possível alterar o status.",
        variant: "destructive"
      });
    }
    return result;
  }, [loadData, toast]);

  const togglePause = useCallback((requestId: string, isPaused: boolean, reason: string) => {
    const result = warrantyFlowService.togglePause(requestId, isPaused, reason, 'admin-1');
    if (result.success) {
      loadData();
      toast({
        title: isPaused ? "SLA Pausado" : "SLA Retomado",
        description: "O cronômetro do SLA foi atualizado."
      });
    }
    return result;
  }, [loadData, toast]);

  const assignTechnician = useCallback((requestId: string, techId: string, techName: string) => {
    const result = warrantyFlowService.assignTechnician(requestId, techId, techName, 'admin-1');
    if (result.success) {
      loadData();
      toast({
        title: "Técnico atribuído",
        description: `O profissional ${techName} agora é o responsável.`
      });
    }
    return result;
  }, [loadData, toast]);

  const exportData = useCallback(() => {
    const allRequests = warrantyFlowService.getAllRequests();
    exportService.exportToCSV(allRequests, 'garantias_a2');
    toast({
      title: "Exportação concluída",
      description: "O arquivo CSV foi baixado com sucesso."
    });
  }, [toast]);

  return {
    requests,
    filteredRequests,
    kanbanData,
    isLoading,
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
