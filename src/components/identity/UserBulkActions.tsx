import { UserCheck, UserMinus, Trash2 } from "lucide-react";
import { BulkActions, BulkActionItem } from "@/components/shared/BulkActions";

interface UserBulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: string) => void;
  onExport: () => void;
}

export const UserBulkActions = ({ selectedCount, onBulkAction, onExport }: UserBulkActionsProps) => {
  const actions: BulkActionItem[] = [
    { label: "Ativar usuários", icon: UserCheck, action: "activate" },
    { label: "Desativar usuários", icon: UserMinus, action: "deactivate" },
    { label: "Remover permanentemente", icon: Trash2, action: "delete", variant: "destructive" },
  ];

  return (
    <BulkActions 
      selectedCount={selectedCount}
      onBulkAction={onBulkAction}
      onExport={onExport}
      actions={actions}
    />
  );
};

