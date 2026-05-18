import { Property } from "@/types/property";
import { PropertyForm } from "./PropertyForm";
import { PropertyDetailsDialog } from "./PropertyDetailsDialog";
import { FormDialog } from "@/components/shared/FormDialog";

interface PropertyDialogsProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingProperty: Property | null;
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  onSave: (id: string | undefined, data: any) => void;
  onRefresh: () => void;
}

export const PropertyDialogs = ({
  isFormOpen,
  setIsFormOpen,
  editingProperty,
  selectedProperty,
  setSelectedProperty,
  onSave,
  onRefresh
}: PropertyDialogsProps) => {
  return (
    <>
      <FormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={`${editingProperty ? "Editar" : "Novo"} Empreendimento`}
        maxWidth="sm:max-w-[700px]"
      >
        <PropertyForm 
          onSubmit={(data) => {
            onSave(editingProperty?.id, data);
            setIsFormOpen(false);
          }}
          onCancel={() => setIsFormOpen(false)}
          initialData={editingProperty || undefined}
        />
      </FormDialog>

      {selectedProperty && (
        <PropertyDetailsDialog 
          open={!!selectedProperty} 
          onOpenChange={(open) => !open && setSelectedProperty(null)} 
          property={selectedProperty} 
          onUpdate={onRefresh}
        />
      )}
    </>
  );
};
