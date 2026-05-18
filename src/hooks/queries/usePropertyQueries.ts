import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyService } from "@/services";
import { Property } from "@/types/property";

/**
 * Example of Service Layer integration with React Query.
 * This pattern allows for efficient caching and background updates.
 */
export const usePropertyQueries = () => {
  const queryClient = useQueryClient();

  const useAllProperties = () => {
    return useQuery({
      queryKey: ["properties"],
      queryFn: async () => {
        // In a real scenario, this would be a fetch to Supabase/API
        // For now, we simulate async fetch from local service
        await new Promise(resolve => setTimeout(resolve, 500));
        return propertyService.getAll();
      },
    });
  };

  const useCreateProperty = () => {
    return useMutation({
      mutationFn: async (data: Omit<Property, "id">) => {
        const newItem = propertyService.create(data);
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
