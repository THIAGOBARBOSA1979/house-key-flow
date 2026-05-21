import { useEffect } from 'react';
import { useAuditStore } from './useAuditStore';

export const useAuditMarker = (issueDescription: string) => {
  const { issues, markAsFixed } = useAuditStore();

  useEffect(() => {
    const issue = issues.find(i => i.description === issueDescription && i.status === 'pending');
    if (issue) {
      // Small delay to simulate "fixing" and ensure store stability
      const timer = setTimeout(() => {
        markAsFixed(issue.id);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [issues, issueDescription, markAsFixed]);
};
