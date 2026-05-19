import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyService } from "@/services";
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
        return propertyService.getAll(companyId, isSuperAdmin);
      },
    });
  };

  const useCreateProperty = (companyId?: string) => {
    return useMutation({
      mutationFn: async (data: Omit<Property, "id">) => {
        const newItem = propertyService.create(data, companyId);
        return newItem;
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
