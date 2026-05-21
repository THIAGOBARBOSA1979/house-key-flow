import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyService } from "@/services";
import { errorHandler } from "@/utils/errors/ErrorHandler";

import { Property } from "@/types/property";

/**
 * Example of Service Layer integration with React Query.
 * This pattern allows for efficient caching and background updates.
 */
export const usePropertyQueries = () => {
  const queryClient = useQueryClient();

  const useAllProperties = (companyId?: string, isSuperAdmin?: boolean) => {
    return useQuery({
      queryKey: ["properties", companyId, isSuperAdmin],
      queryFn: async () => {
        try {
          return await propertyService.getAll(companyId, isSuperAdmin);
        } catch (error) {
          errorHandler.handle(error, 'useAllProperties');
          throw error;
        }
      },

    });
  };

  const useCreateProperty = (companyId?: string) => {
    return useMutation({
      mutationFn: async (data: Omit<Property, "id">) => {
        try {
          return await propertyService.create(data, companyId);
        } catch (error) {
          errorHandler.handle(error, 'useCreateProperty');
          throw error;
        }
      },

      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["properties"] });
      },
    });
  };

  return {
    useAllProperties,
    useCreateProperty,
  };
};
