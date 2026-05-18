import { useState, useMemo, useCallback } from "react";
import { propertyService } from "@/services/PropertyService";
import { useService } from "@/hooks/useService";
import { Property } from "@/types/property";

/**
 * Custom hook to manage properties logic.
 */
export const useProperties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [managerFilter, setManagerFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { items: properties, create: createProperty, update: updateProperty, remove: deleteProperty, refresh: refreshList } = useService<Property>(propertyService, {
    toastMessages: {
      create: "Empreendimento criado com sucesso.",
      update: "Empreendimento atualizado com sucesso.",
      delete: "Empreendimento removido com sucesso."
    }
  });

  const metrics = useMemo(() => propertyService.getMetrics(), [properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || property.status === statusFilter;
      const matchesManager = managerFilter === "all" || property.manager === managerFilter;
      return matchesSearch && matchesStatus && matchesManager;
    });
  }, [properties, searchTerm, statusFilter, managerFilter]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setManagerFilter("all");
  }, []);

  const bulkDelete = useCallback(async () => {
    for (const id of selectedIds) {
      await deleteProperty(id);
    }
    const count = selectedIds.length;
    setSelectedIds([]);
    // Toast is handled by deleteProperty for each, or we could customize it
  }, [selectedIds, deleteProperty]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  return {
    properties,
    filteredProperties,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    managerFilter,
    setManagerFilter,
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
