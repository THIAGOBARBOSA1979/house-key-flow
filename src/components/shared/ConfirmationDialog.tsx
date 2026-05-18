import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "Confirmar ação",
  description = "Tem certeza que deseja prosseguir? Esta ação não pode ser desfeita.",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "destructive"
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black">{title}</AlertDialogTitle>
          <AlertDialogDescription className="font-medium text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 sm:gap-0 mt-6">
          <AlertDialogCancel onClick={onCancel} className="rounded-xl font-bold h-11">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className={`${variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'} rounded-xl font-black uppercase tracking-widest text-xs h-11 px-6`}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
