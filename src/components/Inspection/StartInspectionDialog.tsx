
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StartInspection } from "./StartInspection";

interface StartInspectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspectionId: string;
  inspectionTitle: string;
  onComplete?: (data: any) => void;
}

export function StartInspectionDialog({
  open,
  onOpenChange,
  inspectionId,
  inspectionTitle,
  onComplete
}: StartInspectionDialogProps) {
  const handleComplete = (data: any) => {
    if (onComplete) {
      onComplete(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{inspectionTitle}</DialogTitle>
          <DialogDescription>
            Verifique todos os itens abaixo e indique se estão conformes ou não.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <StartInspection 
            inspectionId={inspectionId} 
            onComplete={handleComplete}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
