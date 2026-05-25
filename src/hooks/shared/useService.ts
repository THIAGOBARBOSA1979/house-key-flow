import { useState, useCallback, useEffect, useRef, useTransition } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks';
import { errorHandler } from '@/utils/errors/ErrorHandler';
import { AppError } from '@/utils/errors/AppError';
import { Result } from '@/types/result';


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
  getAll(companyId?: string, isSuperAdmin?: boolean): Promise<T[]>;
  getById(id: string, companyId?: string, isSuperAdmin?: boolean): Promise<T | undefined>;
  create(data: Omit<T, "id">, companyId?: string): Promise<T>;
  update(id: string, data: Partial<T>, isSuperAdmin?: boolean): Promise<T | undefined>;
  delete(id: string): Promise<boolean>;
  bulkUpdate(ids: string[], data: Partial<T>): Promise<T[]>;
  bulkDelete(ids: string[]): Promise<number>;
  subscribe(listener: (items: T[]) => void): () => void;
}

export function useService<T extends { id: string; company_id?: string; companyId?: string }>(
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
  const [isPending, startTransition] = useTransition();

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      setError(null);
      const data = await service.getAll(companyId, isSuperAdmin);
      
      startTransition(() => {
        setItems(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
      });
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
    
    // Subscribe to service updates (Real-time sync)
    const unsubscribe = service.subscribe((updatedItems) => {
      startTransition(() => {
        setItems(prev => JSON.stringify(prev) === JSON.stringify(updatedItems) ? prev : [...updatedItems]);

      });
    });
    
    return () => unsubscribe();
  }, [fetchItems, service]);


  const refresh = useCallback(() => {
    fetchItems();
  }, [fetchItems]);

  const create = useCallback(async (data: Omit<T, "id">) => {
    setIsLoading(true);
    try {
      setError(null);
      const newItem = await service.create(data, companyId);
      
      if (optionsRef.current.toastMessages?.create) {
        toast({ 
          title: "Sincronização Concluída", 
          description: optionsRef.current.toastMessages.create 
        });
      }
      optionsRef.current.onSuccess?.(newItem, 'create');
      return newItem;
    } catch (error) {
      const appError = errorHandler.handle(error, 'useService:create');
      setError(appError);
      optionsRef.current.onError?.(error);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [service, toast, companyId]);

  const update = useCallback(async (id: string, data: Partial<T>) => {
    setIsLoading(true);
    try {
      setError(null);
      const updatedItem = await service.update(id, data, isSuperAdmin);
      
      if (updatedItem) {
        if (optionsRef.current.toastMessages?.update) {
          toast({ 
            title: "Registro Atualizado", 
            description: optionsRef.current.toastMessages.update 
          });
        }
        optionsRef.current.onSuccess?.(updatedItem, 'update');
      }
      return updatedItem;
    } catch (error) {
      const appError = errorHandler.handle(error, 'useService:update');
      setError(appError);
      optionsRef.current.onError?.(error);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [service, toast, isSuperAdmin]);

  const remove = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      setError(null);
      const success = await service.delete(id);
      
      if (success) {
        if (optionsRef.current.toastMessages?.delete) {
          toast({ 
            title: "Módulo Removido", 
            description: optionsRef.current.toastMessages.delete 
          });
        }
        optionsRef.current.onSuccess?.({ id } as T, 'delete');
      }
      return success;
    } catch (error) {
      const appError = errorHandler.handle(error, 'useService:remove');
      setError(appError);
      optionsRef.current.onError?.(error);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [service, toast]);

  const getById = useCallback(async (id: string) => {
    try {
      return await service.getById(id, companyId, isSuperAdmin);
    } catch (error) {
      errorHandler.handle(error, 'useService:getById');
      return undefined;
    }
  }, [service, companyId, isSuperAdmin]);

  return {
    items,
    isLoading: isLoading || isPending,
    refresh,
    error,

    create,
    update,
    remove,
    bulkUpdate: useCallback(async (ids: string[], data: Partial<T>) => {
      // For simplicity, keeping bulk as it is for now or refactoring if needed
      return await service.bulkUpdate(ids, data);
    }, [service]),
    bulkRemove: useCallback(async (ids: string[]) => {
      return await service.bulkDelete(ids);
    }, [service]),
    getById
  };
}
