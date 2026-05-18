import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  className?: string;
  showFooter?: boolean;
  onSave?: () => void;
  saveLabel?: string;
  isSaving?: boolean;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "sm:max-w-[600px]",
  className,
  showFooter = false,
  onSave,
  saveLabel = "Salvar",
  isSaving = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(maxWidth, "p-0 overflow-hidden border-none shadow-2xl", className)}>
        <DialogHeader className="px-8 pt-8 pb-6 border-b bg-muted/5">
          <DialogTitle className="text-2xl font-black tracking-tight">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm font-medium">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        
        {showFooter && (
          <DialogFooter className="p-8 border-t border-border/10 bg-muted/5">
            {footer || (
              <>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                  Cancelar
                </Button>
                {onSave && (
                  <Button 
                    type="submit" 
                    onClick={onSave} 
                    disabled={isSaving}
                    className="px-10 font-black uppercase tracking-widest text-xs"
                  >
                    {isSaving ? "Salvando..." : saveLabel}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
