import { useState, useMemo, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { warrantyFlowService, warrantyValidationService, eventAutomationService } from "@/services";
import { WarrantyItem } from "@/types/warranty";
import { errorHandler } from "@/utils/errors/ErrorHandler";

export const useWarrantyClaims = (clientId: string, userName?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const companyId = user?.company_id;
  const isSuperAdmin = !!user?.is_super_admin;
  
  const [claims, setClaims] = useState<any[]>([]);
  const [error, setError] = useState<unknown>(null);

  const fetchClaims = useCallback(async () => {
    try {
      const data = await warrantyFlowService.getClientRequests(clientId, companyId, isSuperAdmin);
      setClaims(data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (err) {
      setError(err);
    }
  }, [clientId, companyId, isSuperAdmin]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const cancelClaim = useCallback(async (claimId: string) => {
    const success = await warrantyFlowService.cancelRequest(claimId, clientId);
    if (success) {
      setClaims(prev => prev.filter(c => c.id !== claimId));
      toast({ title: "Solicitação cancelada", description: "Sua solicitação de garantia foi cancelada com sucesso." });
      return true;
    }
    return false;
  }, [clientId, toast]);

  const addInfo = useCallback(async (claimId: string, info: string) => {
    const result = await warrantyFlowService.addUpdate(
      claimId, 
      clientId, 
      userName || "Cliente", 
      info
    );
    if (result.success) {
      setClaims(prev => prev.map(c => c.id === claimId ? result.request : c));
      toast({ title: "Informações adicionadas", description: "As informações foram anexadas à sua solicitação." });
      return true;
    }
    return false;
  }, [clientId, userName, toast]);

  const createClaim = useCallback(async (selectedItem: WarrantyItem, data: any) => {
    const result = await warrantyValidationService.validateAndCreateRequest(
      selectedItem.id,
      clientId,
      {
        title: data.title,
        problems: data.problems,
        additionalInfo: data.additionalInfo,
      }
    );
    
    if (!result.success) {
      toast({
        title: "Erro na solicitação",
        description: (result as any).error.error,
        variant: "destructive"
      });
      return false;
    }
    
    eventAutomationService.onWarrantyRequested(
      result.request.id,
      clientId,
      selectedItem.name
    );
    
    setClaims(prev => [result.request, ...prev]);
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação de garantia foi enviada com sucesso."
    });
    return true;
  }, [clientId, toast]);

  const metrics = useMemo(() => {
    try {
      return warrantyFlowService.calculateMetrics(companyId, isSuperAdmin);
    } catch (err) {
      errorHandler.handle(err, 'useWarrantyClaims:calculateMetrics');
      return { totalActiveRequests: 0, pendingRequests: 0, averageResolutionDays: 0, slaComplianceRate: 0 };
    }
  }, [companyId, isSuperAdmin]);

  return {
    claims,
    metrics,
    cancelClaim,
    addInfo,
    createClaim,
    error
  };
};
