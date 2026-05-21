import { useAuditStore } from './useAuditStore';

export const useAuditManager = () => {
  const { markAsFixed, issues } = useAuditStore();

  const completeTask = (description: string) => {
    const issue = issues.find(i => i.description === description && i.status === 'pending');
    if (issue) {
      markAsFixed(issue.id);
    }
  };

  return { completeTask };
};
