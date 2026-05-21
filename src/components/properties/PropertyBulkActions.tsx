import { Trash2 } from "lucide-react";
import { BulkActions, BulkActionItem } from "@/components/shared/BulkActions";

interface PropertyBulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: string) => void;
  onExport: () => void;
}

export const PropertyBulkActions = ({ selectedCount, onBulkAction, onExport }: PropertyBulkActionsProps) => {
  const actions: BulkActionItem[] = [
    { label: "Excluir permanentemente", icon: Trash2, action: "delete", variant: "destructive" },
  ];

  return (
    <BulkActions 
      selectedCount={selectedCount}
      onBulkAction={onBulkAction}
      onExport={onExport}
      actions={actions}
      exportLabel="Exportar Portfólio"
    />
  );
};
