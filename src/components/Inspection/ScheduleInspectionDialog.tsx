
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Agendar Vistoria
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar Nova Vistoria</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para agendar uma vistoria.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <ScheduleInspectionForm 
            onSuccess={handleSuccess} 
            clientId={clientId}
            propertyInfo={propertyInfo}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
