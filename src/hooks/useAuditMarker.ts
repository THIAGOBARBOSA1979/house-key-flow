import { useEffect } from 'react';
import { useAuditStore } from './useAuditStore';

export const useAuditMarker = (issueDescription: string) => {
  const { issues, markAsFixed } = useAuditStore();

  useEffect(() => {
    const issue = issues.find(i => i.description === issueDescription && i.status === 'pending');
    if (issue) {
      markAsFixed(issue.id);
    }
  }, [issues, issueDescription, markAsFixed]);
};
