import { useState, useCallback, useEffect } from "react";
import { clientStageService } from "@/services/operations/ClientStageService";
import { useAuth } from "@/contexts/AuthContext";
import { ClientProfile, ClientEvent, ClientStage } from "@/types/clientFlow";
import { useToast } from "@/components/ui/use-toast";

export function useClientStages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<ClientProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const data = clientStageService.getAllProfiles(user?.company_id, user?.is_super_admin);
      setProfiles(data);
    } catch (error) {
      console.error("Error loading client profiles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
    
    // Subscribe to changes
    const unsubscribe = clientStageService.subscribe(() => {
      loadData();
    });
    
    return () => unsubscribe();
  }, [loadData]);

  const advanceStage = async (clientId: string, stage: ClientStage, notes?: string) => {
    const result = await clientStageService.advanceStage(
      clientId, 
      stage, 
      notes, 
      user?.name || "Administrador"
    );

    if (result.success) {
      toast({
        title: "Sucesso",
        description: `Jornada do cliente atualizada para ${stage}`,
      });
      loadData();
      return true;
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao atualizar jornada",
        variant: "destructive",
      });
      return false;
    }
  };

  const getClientEvents = useCallback(async (clientId: string) => {
    return await clientStageService.getEvents(clientId);
  }, []);

  return {
    profiles,
    isLoading,
    advanceStage,
    getClientEvents,
    refresh: loadData
  };
}
