import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks';
import { BaseService } from '@/services/BaseService';

interface UseServiceOptions<T> {
  onSuccess?: (item: T, action: 'create' | 'update' | 'delete') => void;
  onError?: (error: unknown) => void;
  toastMessages?: {
    create?: string;
    update?: string;
    delete?: string;
  };
}

export function useService<T extends { id: string; company_id?: string }>(
  service: any,
  options: UseServiceOptions<T> = {}
) {
  const { toast } = useToast();
  const { user } = useAuth();
  const companyId = user?.company_id;
  const isSuperAdmin = !!user?.is_super_admin;
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await service.getAll(companyId, isSuperAdmin);
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [service, companyId, isSuperAdmin]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (typeof service.subscribe === 'function') {
      return service.subscribe((allNewItems: T[]) => {
        if (isSuperAdmin) {
          setItems(allNewItems);
        } else if (companyId) {
          setItems(allNewItems.filter(item => item.company_id === companyId));
        } else {
          setItems([]);
        }
      });
    }
  }, [service, companyId, isSuperAdmin]);

  const refresh = useCallback(() => {
    fetchItems();
  }, [fetchItems]);

  const create = useCallback(async (data: Omit<T, "id">) => {
    setIsLoading(true);
    try {
      const dataWithTenant = {
        ...data,
        company_id: (data as any).company_id || companyId
      } as Omit<T, "id">;

      const newItem = await service.create(dataWithTenant, dataWithTenant.company_id);

      if (optionsRef.current.toastMessages?.create) {
        toast({ title: "Sucesso", description: optionsRef.current.toastMessages.create });
      }
      optionsRef.current.onSuccess?.(newItem, 'create');
      return newItem;
    } catch (error) {
      optionsRef.current.onError?.(error);
      toast({ title: "Erro", description: "Falha ao criar item.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [service, toast, companyId]);

  const update = useCallback(async (id: string, data: Partial<T>) => {
    setIsLoading(true);
    try {
      const updatedItem = await service.update(id, data, isSuperAdmin);
      if (updatedItem) {
        if (optionsRef.current.toastMessages?.update) {
          toast({ title: "Sucesso", description: optionsRef.current.toastMessages.update });
        }
        optionsRef.current.onSuccess?.(updatedItem, 'update');
      }
      return updatedItem;
    } catch (error) {
      optionsRef.current.onError?.(error);
      toast({ title: "Erro", description: "Falha ao atualizar item.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [service, toast, isSuperAdmin]);

  const remove = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const success = await service.delete(id);
      if (success) {
        if (optionsRef.current.toastMessages?.delete) {
          toast({ title: "Sucesso", description: optionsRef.current.toastMessages.delete });
        }
        optionsRef.current.onSuccess?.({ id } as T, 'delete');
      }
      return success;
    } catch (error) {
      optionsRef.current.onError?.(error);
      toast({ title: "Erro", description: "Falha ao remover item.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [service, toast]);

  const bulkUpdate = useCallback(async (ids: string[], data: Partial<T>) => {
    setIsLoading(true);
    try {
      const results = [];
      for (const id of ids) {
        const updated = await service.update(id, data, isSuperAdmin);
        if (updated) results.push(updated);
      }
      toast({ title: "Sucesso", description: `${results.length} itens atualizados.` });
      return results;
    } catch (error) {
      toast({ title: "Erro", description: "Falha na atualização em massa.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [service, toast, isSuperAdmin]);

  const bulkRemove = useCallback(async (ids: string[]) => {
    setIsLoading(true);
    try {
      let count = 0;
      for (const id of ids) {
        const success = await service.delete(id);
        if (success) count++;
      }
      toast({ title: "Sucesso", description: `${count} itens removidos.` });
      return count;
    } catch (error) {
      toast({ title: "Erro", description: "Falha na remoção em massa.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [service, toast]);

  return {
    items,
    isLoading,
    refresh,
    create,
    update,
    remove,
    bulkUpdate,
    bulkRemove,
    getById: useCallback((id: string) => service.getById(id, companyId, isSuperAdmin), [service, companyId, isSuperAdmin])
  };
}



