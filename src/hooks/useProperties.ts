import { useState, useMemo, useCallback, useEffect } from "react";
import { propertyService, Property } from "@/services/PropertyService";
import { useToast } from "@/components/ui/use-toast";

/**
 * Custom hook to manage properties logic.
 */
export const useProperties = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>(propertyService.getAll());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [managerFilter, setManagerFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [metrics, setMetrics] = useState(propertyService.getMetrics());

  useEffect(() => {
    setMetrics(propertyService.getMetrics());
  }, [properties]);

  const refreshList = useCallback(() => {
    setProperties(propertyService.getAll());
  }, []);

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

  const createProperty = useCallback((data: Property) => {
    propertyService.create(data);
    refreshList();
    toast({ title: "Sucesso", description: "Empreendimento criado com sucesso." });
  }, [refreshList, toast]);

  const updateProperty = useCallback((id: string, data: Property) => {
    propertyService.update(id, data);
    refreshList();
    toast({ title: "Sucesso", description: "Empreendimento atualizado com sucesso." });
  }, [refreshList, toast]);

  const deleteProperty = useCallback((id: string) => {
    propertyService.delete(id);
    refreshList();
    toast({ title: "Sucesso", description: "Empreendimento removido com sucesso." });
  }, [refreshList, toast]);

  const bulkDelete = useCallback(() => {
    selectedIds.forEach(id => propertyService.delete(id));
    refreshList();
    const count = selectedIds.length;
    setSelectedIds([]);
    toast({ 
      title: "Ação concluída", 
      description: `${count} empreendimentos foram removidos.`,
      variant: "destructive"
    });
  }, [selectedIds, refreshList, toast]);

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
