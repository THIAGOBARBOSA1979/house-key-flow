
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
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-6 bg-muted/5 border-b">
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Plus className="w-6 h-6 text-primary" />
            Agendar Nova Vistoria
          </DialogTitle>
          <DialogDescription className="text-sm font-medium">
            Preencha os dados abaixo para organizar o cronograma de entrega ou verificação técnica.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-8 max-h-[70vh] overflow-y-auto">
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
