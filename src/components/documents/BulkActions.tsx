
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, Archive, Star, Download, Copy, CheckCircle, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { documentService, Document } from "@/services";

interface BulkActionsProps {
  documents: Document[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onActionComplete: () => void;
}

export function BulkActions({ documents, selectedIds, onSelectionChange, onActionComplete }: BulkActionsProps) {
  const [bulkAction, setBulkAction] = useState("");
  const { toast } = useToast();

  const isAllSelected = documents.length > 0 && selectedIds.length === documents.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < documents.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(documents.map(doc => doc.id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      const deletedCount = documentService.deleteMultipleDocuments(selectedIds);
      toast({
        title: "Documentos excluídos",
        description: `${deletedCount} documento(s) excluído(s) com sucesso`
      });
      onSelectionChange([]);
      onActionComplete();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir documentos",
        variant: "destructive"
      });
    }
  };

  const handleBulkStatusChange = async (status: "published" | "archived" | "draft") => {
    try {
      let updatedCount = 0;
      selectedIds.forEach(id => {
        if (documentService.updateDocument(id, { status })) {
          updatedCount++;
        }
      });
      
      toast({
        title: "Status atualizado",
        description: `${updatedCount} documento(s) atualizado(s) com sucesso`
      });
      onSelectionChange([]);
      onActionComplete();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status dos documentos",
        variant: "destructive"
      });
    }
  };

  const handleBulkFavorite = async () => {
    try {
      let updatedCount = 0;
      selectedIds.forEach(id => {
        if (documentService.toggleFavorite(id)) {
          updatedCount++;
        }
      });
      
      toast({
        title: "Favoritos atualizados",
        description: `${updatedCount} documento(s) atualizado(s) com sucesso`
      });
      onSelectionChange([]);
      onActionComplete();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar favoritos",
        variant: "destructive"
      });
    }
  };

  const handleBulkDuplicate = async () => {
    try {
      let duplicatedCount = 0;
      selectedIds.forEach(id => {
        if (documentService.duplicateDocument(id)) {
          duplicatedCount++;
        }
      });
      
      toast({
        title: "Documentos duplicados",
        description: `${duplicatedCount} documento(s) duplicado(s) com sucesso`
      });
      onSelectionChange([]);
      onActionComplete();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao duplicar documentos",
        variant: "destructive"
      });
    }
  };

  const executeBulkAction = () => {
    switch (bulkAction) {
      case "publish":
        handleBulkStatusChange("published");
        break;
      case "archive":
        handleBulkStatusChange("archived");
        break;
      case "draft":
        handleBulkStatusChange("draft");
        break;
      case "favorite":
        handleBulkFavorite();
        break;
      case "duplicate":
        handleBulkDuplicate();
        break;
    }
    setBulkAction("");
  };

  if (documents.length === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10 shadow-sem-sm animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={handleSelectAll}
          ref={(ref) => {
            if (ref) {
              const inputElement = ref.querySelector('input') as HTMLInputElement;
              if (inputElement) inputElement.indeterminate = isIndeterminate;
            }
          }}
        />
        <span className="text-sm font-medium">
          {selectedIds.length > 0 ? (
            <>
              {selectedIds.length} de {documents.length} selecionado(s)
              <Badge variant="secondary" className="ml-2">
                {selectedIds.length}
              </Badge>
            </>
          ) : (
            "Selecionar todos"
          )}
        </span>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select value={bulkAction} onValueChange={setBulkAction}>
            <SelectTrigger className="w-full sm:w-[220px] h-11 bg-background font-bold border-primary/20">
              <SelectValue placeholder="Ações em massa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="publish">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Publicar
                </div>
              </SelectItem>
              <SelectItem value="archive">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Arquivar
                </div>
              </SelectItem>
              <SelectItem value="draft">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Marcar como rascunho
                </div>
              </SelectItem>
              <SelectItem value="favorite">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Alternar favorito
                </div>
              </SelectItem>
              <SelectItem value="duplicate">
                <div className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  Duplicar
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {bulkAction && (
            <Button onClick={executeBulkAction} size="sm" className="h-11 px-6 font-black uppercase tracking-widest text-[10px] shadow-sem-sm">
              Executar
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="h-11 px-4 font-bold shadow-sem-sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Seleção
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão em Massa</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir {selectedIds.length} documento(s) selecionado(s)? 
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete}>
                  Excluir Todos
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button 
            variant="ghost" 
            size="sm" 
            className="h-11 px-4 font-bold text-muted-foreground hover:text-foreground"
            onClick={() => onSelectionChange([])}
          >
            Limpar
          </Button>
        </div>
      )}
    </div>
  );
}
