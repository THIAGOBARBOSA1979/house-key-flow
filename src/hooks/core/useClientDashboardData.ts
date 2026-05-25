import { useMemo, useState, useEffect } from "react";
import { errorHandler } from "@/utils/errors/ErrorHandler";

import { 
  documentService, 
  inspectionService, 
  warrantyFlowService,
  constructionService
} from "@/services";
import { useClientStage } from "@/hooks/operations/useClientStage";

export const useClientDashboardData = (clientId: string, userName?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<any>(null);

  const { profile, isLoading: profileLoading } = useClientStage(clientId);
  const propertyId = profile?.propertyId;

  useEffect(() => {
    if (profileLoading) return;
    
    const load = async () => {
      try {
        const [docs, inspections, warranty, construction] = await Promise.all([
          documentService.getDocumentsByClient(userName || profile?.name || "João Silva"),
          inspectionService.getAll(),
          warrantyFlowService.getAllRequests(),
          propertyId ? constructionService.getUpdatesByProperty(propertyId) : constructionService.getUpdates()
        ]);

        setData({
          allDocs: docs,
          allInspections: inspections.filter(i => i && i.client === (userName || profile?.name || "João Silva")),
          warrantyRequests: warranty.filter(r => r.clientId === clientId),
          constructionUpdates: construction,
        });
      } catch (err) {
        errorHandler.handle(err, 'useClientDashboardData');
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [clientId, userName, profile?.name, propertyId, profileLoading]);

  useEffect(() => {
    if (!profileLoading) {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [profileLoading]);

  return {
    isLoading: isLoading || profileLoading,
    error,

    allDocs: (data?.allDocs || []).sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()),
    allInspections: (data?.allInspections || []).sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()),
    upcomingInspections: (data?.allInspections?.filter((i: any) => i.status !== 'complete') || []).sort((a: any, b: any) => a.date?.getTime() - b.date?.getTime()),
    warrantyRequests: (data?.warrantyRequests || []).sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()),
    constructionUpdates: (data?.constructionUpdates || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
  };
};

