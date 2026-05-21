
import React from "react";
import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ScheduleInspectionForm } from "./ScheduleInspectionForm";

interface ScheduleInspectionDialogProps {
  triggerButton?: React.ReactNode;
  clientId?: string;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  propertyInfo?: {
    property: string;
    unit: string;
    client: string;
  };
}

export function ScheduleInspectionDialog({ 
  triggerButton, 
  clientId,
  onSuccess,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  propertyInfo 
}: ScheduleInspectionDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange !== undefined ? externalOnOpenChange : setInternalOpen;
  
  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setOpen(true)}>{triggerButton}</div>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agendar Vistoria
        </Button>
      )}

      <FormDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Configurar Nova Vistoria"
        description="Defina os parâmetros técnicos e cronograma para garantir uma entrega de excelência ao seu cliente."
        maxWidth="sm:max-w-[750px]"
      >
        <ScheduleInspectionForm 
          onSuccess={handleSuccess} 
          clientId={clientId}
          propertyInfo={propertyInfo}
        />
      </FormDialog>
    </>
  );
}
