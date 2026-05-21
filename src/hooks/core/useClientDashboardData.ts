import { useMemo, useState, useEffect } from "react";
import { 
  documentService, 
  inspectionService, 
  warrantyFlowService,
  constructionService
} from "@/services";
import { useClientStage } from "@/hooks/operations/useClientStage";

export const useClientDashboardData = (clientId: string, userName?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const { profile, isLoading: profileLoading } = useClientStage(clientId);
  const propertyId = profile?.propertyId;

  const data = useMemo(() => {
    if (profileLoading) return null;
    
    return {
      allDocs: documentService.getDocumentsByClient(userName || profile?.name || "João Silva"),
      allInspections: inspectionService.getAll().filter(i => i && i.client === (userName || profile?.name || "João Silva")),
      warrantyRequests: warrantyFlowService.getAllRequests().filter(r => r.clientId === clientId),
      constructionUpdates: propertyId ? constructionService.getUpdatesByProperty(propertyId) : constructionService.getUpdates(),
    };
  }, [clientId, userName, profile?.name, propertyId, profileLoading]);

  useEffect(() => {
    if (!profileLoading) {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [profileLoading]);

  return {
    isLoading: isLoading || profileLoading,
    allDocs: data?.allDocs || [],
    allInspections: data?.allInspections || [],
    upcomingInspections: data?.allInspections?.filter(i => i.status !== 'complete') || [],
    warrantyRequests: data?.warrantyRequests || [],
    constructionUpdates: data?.constructionUpdates || []
  };
};

