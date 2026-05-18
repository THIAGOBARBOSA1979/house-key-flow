import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import { BaseService } from '@/services/BaseService';
import { useToast } from '@/hooks/use-toast';

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
  service: BaseService<T>,

  options: UseServiceOptions<T> = {}
) {
  const { toast } = useToast();
  const { user } = useAuth();
  const companyId = user?.company_id;
  const [items, setItems] = useState<T[]>(() => service.getAll(companyId, user?.is_super_admin));
  const [isLoading, setIsLoading] = useState(false);


  // We use a ref for options to avoid re-triggering callbacks when options object changes but functions stay same
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    return service.subscribe((allNewItems) => {
      if (user?.is_super_admin) {
        setItems(allNewItems);
      } else if (companyId) {
        setItems(allNewItems.filter(item => item.company_id === companyId));
      } else {
        setItems([]);
      }
    });
  }, [service, companyId, user?.is_super_admin]);

  const refresh = useCallback(() => {
    setItems(service.getAll(companyId, user?.is_super_admin));
  }, [service, companyId, user?.is_super_admin]);

  const create = useCallback(async (data: Omit<T, "id">) => {
    setIsLoading(true);
    try {
      // Auto-assign company_id on creation if not a super admin or if not provided
      const dataWithTenant = {
        ...data,
        company_id: (data as any).company_id || companyId
      } as Omit<T, "id">;

      const newItem = service.create(dataWithTenant, dataWithTenant.company_id);

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
  }, [service, toast]);

  const update = useCallback(async (id: string, data: Partial<T>) => {
    setIsLoading(true);
    try {
      const updatedItem = service.update(id, data);
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
  }, [service, toast]);

  const remove = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const deletedItem = service.getById(id);
      const success = service.delete(id);
      if (success) {
        if (optionsRef.current.toastMessages?.delete) {
          toast({ title: "Sucesso", description: optionsRef.current.toastMessages.delete });
        }
        if (deletedItem) optionsRef.current.onSuccess?.(deletedItem, 'delete');
      }
      return success;
    } catch (error) {
      optionsRef.current.onError?.(error);
      toast({ title: "Erro", description: "Falha ao remover item.", variant: "destructive" });
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
    getById: useCallback((id: string) => service.getById(id, companyId, user?.is_super_admin), [service, companyId, user?.is_super_admin])
  };
}


