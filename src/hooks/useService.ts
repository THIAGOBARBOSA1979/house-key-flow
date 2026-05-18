import { useState, useCallback, useEffect } from 'react';
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

export function useService<T extends { id?: string }>(
  service: BaseService<T>,
  options: UseServiceOptions<T> = {}
) {
  const { toast } = useToast();
  const [items, setItems] = useState<T[]>(() => service.getAll());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return service.subscribe((newItems) => {
      setItems(newItems);
    });
  }, [service]);

  const refresh = useCallback(() => {
    setItems(service.getAll());
  }, [service]);

  const create = useCallback(async (data: Omit<T, "id">) => {
    try {
      const newItem = service.create(data);
      if (options.toastMessages?.create) {
        toast({ title: "Sucesso", description: options.toastMessages.create });
      }
      options.onSuccess?.(newItem, 'create');
      return newItem;
    } catch (error) {
      options.onError?.(error);
      toast({ title: "Erro", description: "Falha ao criar item.", variant: "destructive" });
    }
  }, [service, options, toast]);

  const update = useCallback(async (id: string, data: Partial<T>) => {
    try {
      const updatedItem = service.update(id, data);
      if (updatedItem) {
        if (options.toastMessages?.update) {
          toast({ title: "Sucesso", description: options.toastMessages.update });
        }
        options.onSuccess?.(updatedItem, 'update');
      }
      return updatedItem;
    } catch (error) {
      options.onError?.(error);
      toast({ title: "Erro", description: "Falha ao atualizar item.", variant: "destructive" });
    }
  }, [service, options, toast]);

  const remove = useCallback(async (id: string) => {
    try {
      const deletedItem = service.getById(id);
      const success = service.delete(id);
      if (success) {
        if (options.toastMessages?.delete) {
          toast({ title: "Sucesso", description: options.toastMessages.delete });
        }
        if (deletedItem) options.onSuccess?.(deletedItem, 'delete');
      }
      return success;
    } catch (error) {
      options.onError?.(error);
      toast({ title: "Erro", description: "Falha ao remover item.", variant: "destructive" });
    }
  }, [service, options, toast]);

  return {
    items,
    isLoading,
    refresh,
    create,
    update,
    remove,
    getById: useCallback((id: string) => service.getById(id), [service])
  };
}


