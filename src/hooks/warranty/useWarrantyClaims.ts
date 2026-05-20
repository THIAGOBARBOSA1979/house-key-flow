import { useState, useMemo, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { warrantyFlowService, warrantyValidationService, eventAutomationService } from "@/services";
import { WarrantyItem } from "@/types/warranty";

export const useWarrantyClaims = (clientId: string, userName?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const companyId = user?.company_id;
  const isSuperAdmin = !!user?.is_super_admin;
  
  const allClaims = useMemo(() => 
    warrantyFlowService.getClientRequests(clientId, companyId, isSuperAdmin).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ), [clientId, companyId, isSuperAdmin]);
    
  const [claims, setClaims] = useState<any[]>(allClaims);

  const cancelClaim = useCallback((claimId: string) => {
    const success = warrantyFlowService.cancelRequest(claimId, clientId);
    if (success) {
      setClaims(prev => prev.filter(c => c.id !== claimId));
      toast({ title: "Solicitação cancelada", description: "Sua solicitação de garantia foi cancelada com sucesso." });
      return true;
    }
    return false;
  }, [clientId, toast]);

  const addInfo = useCallback((claimId: string, info: string) => {
    const result = warrantyFlowService.addUpdate(
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

  const createClaim = useCallback((selectedItem: WarrantyItem, data: any) => {
    const result = warrantyValidationService.validateAndCreateRequest(
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

  const metrics = useMemo(() => warrantyFlowService.calculateMetrics(), []);

  return {
    claims,
    metrics,
    cancelClaim,
    addInfo,
    createClaim
  };
};
