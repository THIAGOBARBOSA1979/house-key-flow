import { Property } from "@/types/property";
import { PropertyForm } from "./PropertyForm";
import { PropertyDetailsDialog } from "./PropertyDetailsDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface PropertyDialogsProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingProperty: Property | null;
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  propertyToDelete: Property | null;
  setPropertyToDelete: (property: Property | null) => void;
  onSave: (id: string | undefined, data: any) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export const PropertyDialogs = ({
  isFormOpen,
  setIsFormOpen,
  editingProperty,
  selectedProperty,
  setSelectedProperty,
  propertyToDelete,
  setPropertyToDelete,
  onSave,
  onDelete,
  onRefresh
}: PropertyDialogsProps) => {
  return (
    <>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2rem] border-none shadow-2xl p-8 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-black tracking-tight">{editingProperty ? "Editar" : "Novo"} Empreendimento</DialogTitle>
          </DialogHeader>
          <PropertyForm 
            onSubmit={(data) => {
              onSave(editingProperty?.id, data);
              setIsFormOpen(false);
            }}
            onCancel={() => setIsFormOpen(false)}
            initialData={editingProperty || undefined}
          />
        </DialogContent>
      </Dialog>

      {selectedProperty && (
        <PropertyDetailsDialog 
          open={!!selectedProperty} 
          onOpenChange={(open) => !open && setSelectedProperty(null)} 
          property={selectedProperty} 
          onUpdate={onRefresh}
        />
      )}

      <AlertDialog open={!!propertyToDelete} onOpenChange={(open) => !open && setPropertyToDelete(null)}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="font-medium">
              Deseja realmente excluir o empreendimento <span className="font-black text-foreground">"{propertyToDelete?.name}"</span>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-0">
            <AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => propertyToDelete?.id && onDelete(propertyToDelete.id)} className="bg-destructive hover:bg-destructive/90 rounded-xl font-black uppercase tracking-widest text-xs">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
