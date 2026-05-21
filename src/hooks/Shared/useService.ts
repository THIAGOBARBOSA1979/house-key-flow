import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks';
import { errorHandler } from '@/utils/errors/ErrorHandler';
import { AppError } from '@/utils/errors/AppError';


export interface UseServiceOptions<T> {
  onSuccess?: (item: T, action: 'create' | 'update' | 'delete') => void;
  onError?: (error: unknown) => void;
  toastMessages?: {
    create?: string;
    update?: string;
    delete?: string;
  };
}

export interface IService<T> {
  getAll(companyId?: string, isSuperAdmin?: boolean): T[] | Promise<T[]>;
  getById(id: string, companyId?: string, isSuperAdmin?: boolean): T | undefined | Promise<T | undefined>;
  create(data: Omit<T, "id">, companyId?: string): Promise<T>;
  update(id: string, data: Partial<T>, isSuperAdmin?: boolean): Promise<T | undefined>;
  delete(id: string): Promise<boolean>;
  bulkUpdate(ids: string[], data: Partial<T>, isSuperAdmin?: boolean): Promise<T[]>;
  bulkDelete(ids: string[]): Promise<number>;
  subscribe(listener: (items: T[]) => void): () => void;
}

export function useService<T extends { id: string; company_id?: string }>(
  service: IService<T>,
  options: UseServiceOptions<T> = {}
) {
  const { toast } = useToast();
  const { user } = useAuth();
  const companyId = user?.company_id;
  const isSuperAdmin = !!user?.is_super_admin;
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);


  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      setError(null);
      if ('sync' in service && typeof (service as any).sync === 'function') {

        await (service as any).sync(companyId, isSuperAdmin);
      }
      const data = await service.getAll(companyId, isSuperAdmin);
      setItems(data);
    } catch (err) {
      const appError = errorHandler.handle(err, 'useService:fetchItems');
      setError(appError);
      optionsRef.current.onError?.(err);

    } finally {
      setIsLoading(false);
    }
  }, [service, companyId, isSuperAdmin]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    return service.subscribe((allNewItems: T[]) => {
      if (isSuperAdmin) {
        setItems(allNewItems);
      } else if (companyId) {
        setItems(allNewItems.filter(item => item.company_id === companyId));
      } else {
        setItems([]);
      }
    });
  }, [service, companyId, isSuperAdmin]);

  const refresh = useCallback(() => {
    fetchItems();
  }, [fetchItems]);

  const create = useCallback(async (data: Omit<T, "id">) => {
    setIsLoading(true);
    try {
      const newItem = await service.create(data, companyId);
      if (optionsRef.current.toastMessages?.create) {
        toast({ title: "Sucesso", description: optionsRef.current.toastMessages.create });
      }
      optionsRef.current.onSuccess?.(newItem, 'create');
      return newItem;
    } catch (error) {
      optionsRef.current.onError?.(error);
      toast({ title: "Erro", description: "Falha ao criar item.", variant: "destructive" });
      throw error;
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
      throw error;
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
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [service, toast]);

  const bulkUpdate = useCallback(async (ids: string[], data: Partial<T>) => {
    setIsLoading(true);
    try {
      const results = await service.bulkUpdate(ids, data, isSuperAdmin);
      toast({ title: "Sucesso", description: `${results.length} itens atualizados.` });
      return results;
    } catch (error) {
      toast({ title: "Erro", description: "Falha na atualização em massa.", variant: "destructive" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [service, toast, isSuperAdmin]);

  const bulkRemove = useCallback(async (ids: string[]) => {
    setIsLoading(true);
    try {
      const count = await service.bulkDelete(ids);
      toast({ title: "Sucesso", description: `${count} itens removidos.` });
      return count;
    } catch (error) {
      toast({ title: "Erro", description: "Falha na remoção em massa.", variant: "destructive" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [service, toast]);

  const getById = useCallback(async (id: string) => {
    return await service.getById(id, companyId, isSuperAdmin);
  }, [service, companyId, isSuperAdmin]);

  return {
    items,
    isLoading,
    refresh,
    error,

    create,
    update,
    remove,
    bulkUpdate,
    bulkRemove,
    getById
  };
}

