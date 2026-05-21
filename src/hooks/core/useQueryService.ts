
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks";
import { errorHandler } from "@/utils/errors/ErrorHandler";
import { IService, UseServiceOptions } from "../shared/useService";

/**
 * A standard hook to wrap services with React Query.
 * This combines the best of both worlds: our service architecture and TanStack's caching.
 */
export function useQueryService<T extends { id: string; company_id?: string }>(
  service: IService<T>,
  queryKey: string,
  options: UseServiceOptions<T> = {}
) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const companyId = user?.company_id;
  const isSuperAdmin = !!user?.is_super_admin;

  // Query for all items
  const query = useQuery({
    queryKey: [queryKey, companyId, isSuperAdmin],
    queryFn: async () => {
      try {
        if ('sync' in service && typeof (service as any).sync === 'function') {
          await (service as any).sync(companyId, isSuperAdmin);
        }
        return await service.getAll(companyId, isSuperAdmin);
      } catch (err) {
        errorHandler.handle(err, `useQueryService:${queryKey}:getAll`);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<T, "id">) => service.create(data, companyId),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      if (options.toastMessages?.create) {
        toast({ title: "Sucesso", description: options.toastMessages.create });
      }
      options.onSuccess?.(newItem, 'create');
    },
    onError: (err) => {
      errorHandler.handle(err, `useQueryService:${queryKey}:create`);
      options.onError?.(err);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<T> }) => service.update(id, data, isSuperAdmin),
    onSuccess: (updatedItem) => {
      if (updatedItem) {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        if (options.toastMessages?.update) {
          toast({ title: "Sucesso", description: options.toastMessages.update });
        }
        options.onSuccess?.(updatedItem, 'update');
      }
    },
    onError: (err) => {
      errorHandler.handle(err, `useQueryService:${queryKey}:update`);
      options.onError?.(err);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => service.delete(id),
    onSuccess: (success, id) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        if (options.toastMessages?.delete) {
          toast({ title: "Sucesso", description: options.toastMessages.delete });
        }
        options.onSuccess?.({ id } as T, 'delete');
      }
    },
    onError: (err) => {
      errorHandler.handle(err, `useQueryService:${queryKey}:delete`);
      options.onError?.(err);
    }
  });

  return {
    items: query.data || [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refresh: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
    
    create: createMutation.mutateAsync,
    update: (id: string, data: Partial<T>) => updateMutation.mutateAsync({ id, data }),
    remove: deleteMutation.mutateAsync,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
