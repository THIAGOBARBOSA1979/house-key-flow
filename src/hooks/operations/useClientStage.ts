import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ClientStage, 
  ClientProfile, 
  StagePermissions, 
  TimelineItem,
  ClientEvent
} from '@/types/clientFlow';
import { clientStageService } from '@/services';

export interface UseClientStageResult {
  profile: ClientProfile | null;
  allProfiles: ClientProfile[];
  selectedProfileId: string | null;
  setSelectedProfileId: (id: string) => void;
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

export function useClientStage(userId: string): UseClientStageResult {
  const [profiles, setAllProfiles] = useState<ClientProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userProfiles = clientStageService.getProfilesByUserId(userId);
      setAllProfiles(userProfiles);
      
      if (userProfiles.length > 0 && !selectedProfileId) {
        // Use the first one by default, or the one stored in session
        const stored = localStorage.getItem(`active_profile_${userId}`);
        const initial = stored && userProfiles.some(p => p.id === stored) 
          ? stored 
          : userProfiles[0].id;
        setSelectedProfileId(initial);
      }
      
      if (userProfiles.length === 0) {
        setError('Nenhuma unidade vinculada encontrada');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedProfileId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeProfile = useMemo(() => 
    profiles.find(p => p.id === selectedProfileId) || null,
  [profiles, selectedProfileId]);

  const activeId = activeProfile?.id || userId;

  const stage = activeProfile?.currentStage || null;
  const permissions = clientStageService.getPermissions(activeId);
  const events = clientStageService.getEvents(activeId);
  const timeline: TimelineItem[] = events.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.createdAt,
    status: 'completed' as const,
    eventType: event.eventType
  }));

  const canScheduleInspection = clientStageService.canScheduleInspection(activeId);
  const canRequestWarranty = clientStageService.canRequestWarranty(activeId);

  const isStageReached = useCallback((targetStage: ClientStage): boolean => {
    return clientStageService.isStageReached(activeId, targetStage);
  }, [activeId]);

  const handleSetProfile = (id: string) => {
    setSelectedProfileId(id);
    localStorage.setItem(`active_profile_${userId}`, id);
  };

  return {
    profile: activeProfile,
    allProfiles: profiles,
    selectedProfileId,
    setSelectedProfileId: handleSetProfile,
    stage,
    permissions,
    timeline,
    events,
    isLoading,
    error,
    canScheduleInspection,
    canRequestWarranty,
    isStageReached,
    refreshProfile: loadData
  };
}
