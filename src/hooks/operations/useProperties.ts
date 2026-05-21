import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { propertyService } from "@/services";
import { useDataList } from "@/hooks";
import { useQueryService } from "@/hooks/core/useQueryService";
import { Property } from "@/types/property";

/**
 * Custom hook to manage properties logic.
 */
export const useProperties = () => {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { 
    items: properties, 
    isLoading, 
    create: createProperty, 
    update: updateProperty, 
    remove: deleteProperty, 
    refresh: refreshList,
    error
  } = useQueryService<Property>(propertyService, "properties", {
    toastMessages: {
      create: "Empreendimento criado com sucesso.",
      update: "Empreendimento atualizado com sucesso.",
      delete: "Empreendimento removido com sucesso."
    }
  });

  const filterFn = useCallback((property: Property, currentFilters: { status?: string, manager?: string }) => {
    const matchesStatus = currentFilters.status === "all" || property.status === currentFilters.status;
    const matchesManager = currentFilters.manager === "all" || property.manager === currentFilters.manager;
    return matchesStatus && matchesManager;
  }, []);

  const listOptions = useMemo(() => ({
    initialFilters: { status: "all" as const, manager: "all" as const },
    filterFn
  }), [filterFn]);

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
  } = useDataList<Property>(properties, listOptions);

  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    propertyService.getMetrics(companyId, user?.is_super_admin).then(setMetrics);
  }, [companyId, user?.is_super_admin, properties]);

  const bulkDelete = useCallback(async () => {
    try {
      const results = await propertyService.bulkDelete(selectedIds);
      if (results > 0) {
        refreshList();
        setSelectedIds([]);
      }
    } catch (err) {
      errorHandler.handle(err, 'useProperties:bulkDelete');
    }
  }, [selectedIds, refreshList, setSelectedIds]);

  return {
    properties,
    isLoading,
    filteredProperties,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    selectedIds,
    setSelectedIds,
    metrics,
    clearFilters,
    createProperty,
    updateProperty,
    deleteProperty,
    bulkDelete,
    toggleSelect,
    refreshList,
    error
  };
};



