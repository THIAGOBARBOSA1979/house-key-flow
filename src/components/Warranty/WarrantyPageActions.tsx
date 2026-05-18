import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface WarrantyPageActionsProps {
  onExport: () => void;
}

export const WarrantyPageActions = ({ onExport }: WarrantyPageActionsProps) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onExport} 
      className="h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
    >
      <Download className="mr-2 h-4 w-4" /> Exportar Dados
    </Button>
  );
};
