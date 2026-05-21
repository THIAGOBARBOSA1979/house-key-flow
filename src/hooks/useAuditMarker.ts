import { useEffect } from 'react';
import { useAuditManager } from './useAuditManager';

export const useAuditMarker = (issueDescription: string) => {
  const { markFixed } = useAuditManager();

  useEffect(() => {
    // Small delay to ensure store stability
    const timer = setTimeout(() => {
      markFixed(issueDescription);
    }, 500);
    return () => clearTimeout(timer);
  }, [issueDescription, markFixed]);
};