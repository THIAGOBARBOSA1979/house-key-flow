import { useState, useCallback, useMemo, useEffect } from "react";
import { constructionService, type ConstructionUpdate, propertyService } from "@/services";
import { errorHandler } from "@/utils/errors/ErrorHandler";
import { useToast } from "../shared/use-toast";


export const useAnnouncements = () => {
  const { toast } = useToast();
  const [updates, setUpdates] = useState<ConstructionUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  
  const properties = useMemo(() => propertyService.getAll(), []);

  const refreshUpdates = useCallback(() => {
    setIsLoading(true);
    try {
      setError(null);
      setUpdates(constructionService.getUpdates());
    } catch (err) {
      setError(err);
      errorHandler.handle(err, 'useAnnouncements:refreshUpdates');
    } finally {
      setIsLoading(false);
    }

  }, []);

  useEffect(() => {
    refreshUpdates();
  }, [refreshUpdates]);

  const createAnnouncement = useCallback(async (data: Omit<ConstructionUpdate, 'id' | 'date' | 'readBy'>) => {
    try {
      constructionService.createUpdate({
        ...data,
        date: new Date(),
      });
      refreshUpdates();
      toast({ title: "Sucesso", description: "Novo comunicado publicado." });
    } catch (err) {
      errorHandler.handle(err, 'useAnnouncements:createAnnouncement');
      throw err;
    }
  }, [refreshUpdates, toast]);


  const updateAnnouncement = useCallback(async (id: string, data: Partial<ConstructionUpdate>) => {
    try {
      constructionService.updateUpdate(id, data);
      refreshUpdates();
      toast({ title: "Sucesso", description: "Comunicado atualizado com sucesso." });
    } catch (err) {
      errorHandler.handle(err, 'useAnnouncements:updateAnnouncement');
      throw err;
    }
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
    refreshUpdates,
    error

  };
};
