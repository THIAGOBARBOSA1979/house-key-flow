import React from "react";
import { Settings, Trash2, Download, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export interface BulkActionItem {
  label: string;
  icon: LucideIcon;
  action: string;
  variant?: "default" | "destructive";
}

interface BulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: string) => void;
  onExport?: () => void;
  actions: BulkActionItem[];
  exportLabel?: string;
}

export const BulkActions: React.FC<BulkActionsProps> = ({ 
  selectedCount, 
  onBulkAction, 
  onExport, 
  actions,
  exportLabel = "Exportar Planilha"
}) => {
  return (
    <div className="flex items-center gap-3">
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 animate-in zoom-in-95 duration-200">
          <Badge className="h-9 px-4 rounded-xl bg-primary/10 text-primary border-none font-bold">
            {selectedCount} selecionado(s)
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="rounded-xl h-11 px-6 font-black uppercase text-[10px] tracking-widest shadow-sem-md">
                <Settings className="mr-2 h-4 w-4" /> Ações em lote
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-sem-xl border-none animate-in zoom-in-95">
              {actions.map((item, index) => (
                <React.Fragment key={item.action}>
                  {item.variant === "destructive" && index > 0 && <DropdownMenuSeparator className="my-2" />}
                  <DropdownMenuItem 
                    className={`py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary ${item.variant === 'destructive' ? 'text-destructive focus:text-destructive focus:bg-destructive/5' : ''}`}
                    onClick={() => onBulkAction(item.action)}
                  >
                    <item.icon className="mr-3 h-4 w-4 opacity-50" /> {item.label}
                  </DropdownMenuItem>
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      
      {onExport && (
        <Button 
          variant="outline" 
          className="rounded-xl h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95" 
          onClick={onExport}
        >
          <Download className="mr-2 h-4 w-4" /> {exportLabel}
        </Button>
      )}
    </div>
  );
};
