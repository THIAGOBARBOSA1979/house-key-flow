import { useState, useCallback, useMemo, useEffect } from "react";
import { constructionService, type ConstructionUpdate, propertyService } from "@/services";
import { useToast } from "@/hooks";

export const useAnnouncements = () => {
  const { toast } = useToast();
  const [updates, setUpdates] = useState<ConstructionUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const properties = useMemo(() => propertyService.getAll(), []);

  const refreshUpdates = useCallback(() => {
    setIsLoading(true);
    try {
      setUpdates(constructionService.getUpdates());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUpdates();
  }, [refreshUpdates]);

  const createAnnouncement = useCallback((data: Omit<ConstructionUpdate, 'id' | 'date' | 'readBy'>) => {
    const newUpdate = constructionService.createUpdate({
      ...data,
      date: new Date(),
    });
    refreshUpdates();
    toast({ title: "Sucesso", description: "Novo comunicado publicado." });
    return newUpdate;
  }, [refreshUpdates, toast]);

  const updateAnnouncement = useCallback((id: string, data: Partial<ConstructionUpdate>) => {
    constructionService.updateUpdate(id, data);
    refreshUpdates();
    toast({ title: "Sucesso", description: "Comunicado atualizado com sucesso." });
  }, [refreshUpdates, toast]);

  const deleteAnnouncement = useCallback((id: string) => {
    constructionService.deleteUpdate(id);
    refreshUpdates();
    toast({
      title: "Comunicado removido",
      description: "O comunicado foi excluído permanentemente.",
      variant: "destructive"
    });
  }, [refreshUpdates, toast]);

  return {
    updates,
    isLoading,
    properties,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    refreshUpdates
  };
};
