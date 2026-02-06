
import { useState, useEffect, useCallback } from 'react';
import { 
  ClientStage, 
  ClientProfile, 
  StagePermissions, 
  TimelineItem,
  ClientEvent
} from '@/types/clientFlow';
import { clientStageService } from '@/services/ClientStageService';

export interface UseClientStageResult {
  profile: ClientProfile | null;
  stage: ClientStage | null;
  permissions: StagePermissions;
  timeline: TimelineItem[];
  events: ClientEvent[];
  isLoading: boolean;
  error: string | null;
  canScheduleInspection: boolean;
  canRequestWarranty: boolean;
  isStageReached: (targetStage: ClientStage) => boolean;
  refreshProfile: () => void;
}

export function useClientStage(clientId: string): UseClientStageResult {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClientData = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      const clientProfile = clientStageService.getClientProfile(clientId);
      setProfile(clientProfile);
      
      if (!clientProfile) {
        setError('Cliente não encontrado');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do cliente');
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  const stage = profile?.currentStage || null;
  const permissions = clientStageService.getPermissions(clientId);
  const timeline = clientStageService.getTimeline(clientId);
  const events = clientStageService.getEvents(clientId);

  const canScheduleInspection = clientStageService.canScheduleInspection(clientId);
  const canRequestWarranty = clientStageService.canRequestWarranty(clientId);

  const isStageReached = useCallback((targetStage: ClientStage): boolean => {
    return clientStageService.isStageReached(clientId, targetStage);
  }, [clientId]);

  return {
    profile,
    stage,
    permissions,
    timeline,
    events,
    isLoading,
    error,
    canScheduleInspection,
    canRequestWarranty,
    isStageReached,
    refreshProfile: loadClientData
  };
}
