import { useEffect } from 'react';
import { useAuditManager } from './useAuditManager';

export const useAuditMarker = (issueDescription: string) => {
  const { completeTask } = useAuditManager();

  useEffect(() => {
    // Pequeno delay para garantir estabilidade do store
    const timer = setTimeout(() => {
      completeTask(issueDescription);
    }, 500);
    return () => clearTimeout(timer);
  }, [issueDescription, completeTask]);
};