
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
      <DialogContent className="max-w-screen-md max-h-[95vh] overflow-y-auto p-0 sm:rounded-2xl border-none shadow-2xl">
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b p-4 sm:p-6">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <ClipboardCheck size={20} />
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">{inspectionTitle}</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground font-medium">
              Verifique os itens do checklist com atenção. O progresso é salvo automaticamente.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-4 sm:p-8 pt-2">
          <StartInspection 
            inspectionId={inspectionId} 
            onComplete={handleComplete}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { ClipboardCheck } from "lucide-react";
