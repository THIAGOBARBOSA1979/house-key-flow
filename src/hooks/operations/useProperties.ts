import { useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { propertyService } from "@/services";
import { useService, useDataList } from "@/hooks";
import { Property } from "@/types/property";

/**
 * Custom hook to manage properties logic.
 */
export const useProperties = () => {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { items: properties, isLoading, create: createProperty, update: updateProperty, remove: deleteProperty, refresh: refreshList } = useService<Property>(propertyService, {
    toastMessages: {
      create: "Empreendimento criado com sucesso.",
      update: "Empreendimento atualizado com sucesso.",
      delete: "Empreendimento removido com sucesso."
    }
  });

  const filterFn = useCallback((property: Property, filters: any) => {
    const matchesStatus = filters.status === "all" || property.status === filters.status;
    const matchesManager = filters.manager === "all" || property.manager === filters.manager;
    return matchesStatus && matchesManager;
  }, []);

  const {
    filteredItems: filteredProperties,
    filters,
    setFilters,
    selectedIds,
    setSelectedIds,
    toggleSelect,
    searchTerm,
    setSearchTerm,
    clearFilters
  } = useDataList<Property>(properties, {
    initialFilters: { status: "all", manager: "all" },
    filterFn
  });

  const metrics = useMemo(() => propertyService.getMetrics(companyId, user?.is_super_admin), [companyId, user?.is_super_admin, properties]);

  const bulkDelete = useCallback(async () => {
    for (const id of selectedIds) {
      await deleteProperty(id);
    }
    setSelectedIds([]);
  }, [selectedIds, deleteProperty, setSelectedIds]);

  return {
    properties,
    isLoading,
    filteredProperties,
    searchTerm,
    setSearchTerm,
    statusFilter: filters.status,
    setStatusFilter: (status: string) => setFilters(prev => ({ ...prev, status })),
    managerFilter: filters.manager,
    setManagerFilter: (manager: string) => setFilters(prev => ({ ...prev, manager })),
    selectedIds,
    setSelectedIds,
    metrics,
    clearFilters,
    createProperty,
    updateProperty,
    deleteProperty,
    bulkDelete,
    toggleSelect,
    refreshList
  };
};

