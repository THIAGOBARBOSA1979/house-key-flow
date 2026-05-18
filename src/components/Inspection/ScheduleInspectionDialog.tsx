
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
      <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden border-none shadow-sem-xl rounded-3xl bg-background/95 backdrop-blur-2xl">
        <DialogHeader className="px-10 pt-10 pb-8 bg-primary/5 border-b border-border/10">
          <DialogTitle className="text-display tracking-tighter flex items-center gap-4 text-3xl md:text-4xl">
            <Plus className="w-8 h-8 text-primary" strokeWidth={3} />
            Configurar Nova Vistoria
          </DialogTitle>
          <DialogDescription className="text-sem-body-base font-medium text-muted-foreground/60 mt-2 max-w-lg">
            Defina os parâmetros técnicos e cronograma para garantir uma entrega de excelência ao seu cliente.
          </DialogDescription>

        </DialogHeader>
        
        <div className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
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
