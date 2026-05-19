import { useState, useEffect, useCallback } from 'react';
import { BaseService } from '@/services/BaseService';

export interface UseEntityOptions {
  companyId?: string;
  isSuperAdmin?: boolean;
}

export function useEntity<T extends { id: string; company_id?: string }>(
  service: BaseService<T>,
  options: UseEntityOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { companyId, isSuperAdmin } = options;

  const refresh = useCallback(() => {
    try {
      setLoading(true);
      const items = service.getAll(companyId, isSuperAdmin);
      setData(items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  }, [service, companyId, isSuperAdmin]);

  useEffect(() => {
    refresh();
    return service.subscribe((items) => {
      const filtered = isSuperAdmin 
        ? items 
        : items.filter(item => item.company_id === companyId);
      setData(filtered);
    });
  }, [refresh, service, companyId, isSuperAdmin]);

  return {
    data,
    loading,
    error,
    refresh,
    create: service.create.bind(service),
    update: service.update.bind(service),
    delete: service.delete.bind(service),
  };
}
