import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { WarrantyItemSelector } from "@/components/warranty/WarrantyItemSelector";
import { EnhancedWarrantyRequestForm } from "@/components/warranty/EnhancedWarrantyRequestForm";
import { WarrantyItem } from "@/types/warranty";

interface NewWarrantyRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  requestStep: "select_item" | "fill_form";
  setRequestStep: (step: "select_item" | "fill_form") => void;
  selectedItem: WarrantyItem | null;
  onSelectItem: (item: WarrantyItem | null) => void;
  onSubmit: (data: any) => void;
}

export const NewWarrantyRequestDialog = ({
  isOpen,
  onOpenChange,
  clientId,
  requestStep,
  setRequestStep,
  selectedItem,
  onSelectItem,
  onSubmit
}: NewWarrantyRequestDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-dialog-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {requestStep === "select_item" 
            ? "Selecione o Item de Garantia" 
            : `Nova Solicitação - ${selectedItem?.name}`}
        </DialogTitle>
        <p className="text-sm text-muted-foreground">
          {requestStep === "select_item" 
            ? "Escolha o item para o qual deseja abrir uma solicitação de garantia. Apenas itens com garantia ativa estão disponíveis."
            : "Preencha os detalhes da sua solicitação para que possamos analisar e atender da melhor forma."}
        </p>
      </DialogHeader>
      
      {requestStep === "select_item" ? (
        <div className="space-y-4">
          <WarrantyItemSelector
            clientId={clientId}
            selectedItemId={selectedItem?.id || null}
            onSelectItem={onSelectItem}
            showIneligible={true}
          />
          
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => setRequestStep("fill_form")}
              disabled={!selectedItem}
            >
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setRequestStep("select_item")}
            className="mb-2"
          >
            ← Voltar para seleção
          </Button>
          <EnhancedWarrantyRequestForm 
            onSubmit={onSubmit} 
            onCancel={() => setRequestStep("select_item")}
            selectedItem={selectedItem}
          />
        </div>
      )}
    </DialogContent>
  </Dialog>
);
