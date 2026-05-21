import React, { ReactNode } from "react";
import { FormDialog } from "@/components/shared/FormDialog";

interface EntityDialogsProps<T> {
  entityName: string;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingEntity: T | null;
  selectedEntity: T | null;
  setSelectedEntity: (entity: T | null) => void;
  formComponent: ReactNode;
  detailsComponent?: ReactNode;
  maxWidth?: string;
}

/**
 * A generic container for standard entity dialogs (Form and Details).
 * Reduces boilerplate in feature-specific Dialogs components.
 */
export function EntityDialogs<T>({
  entityName,
  isFormOpen,
  setIsFormOpen,
  editingEntity,
  selectedEntity,
  setSelectedEntity,
  formComponent,
  detailsComponent,
  maxWidth = "sm:max-w-[700px]"
}: EntityDialogsProps<T>) {
  return (
    <>
      <FormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={`${editingEntity ? "Editar" : "Novo(a)"} ${entityName}`}
        maxWidth={maxWidth}
      >
        {formComponent}
      </FormDialog>

      {selectedEntity && detailsComponent}
    </>
  );
}
