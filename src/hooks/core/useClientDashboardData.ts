import { useMemo, useState, useEffect } from "react";
import { 
  financialService, 
  documentService, 
  inspectionService, 
  warrantyFlowService 
} from "@/services";

export const useClientDashboardData = (clientId: string, userName?: string) => {
  const [isLoading, setIsLoading] = useState(true);

  const financialSummary = useMemo(() => financialService.getFinancialSummary(clientId), [clientId]);
  const allDocs = useMemo(() => documentService.getDocumentsByClient(userName || "João Silva"), [userName]);
  const allInspections = useMemo(() => 
    inspectionService.getAll().filter(i => i.client === (userName || "João Silva")), [userName]);
  const upcomingInspections = useMemo(() => allInspections.filter(i => i.status !== 'complete'), [allInspections]);
  const warrantyRequests = useMemo(() => 
    warrantyFlowService.getAllRequests().filter(r => r.clientId === clientId), [clientId]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return {
    isLoading,
    financialSummary,
    allDocs,
    allInspections,
    upcomingInspections,
    warrantyRequests
  };
};
