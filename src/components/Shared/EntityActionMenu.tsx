import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export interface ActionMenuItem {
  label: string;
  icon?: any;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}

interface EntityActionMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  extraActions?: ActionMenuItem[];
  triggerClassName?: string;
  align?: 'start' | 'center' | 'end';
}

export const EntityActionMenu = ({
  onEdit,
  onDelete,
  onView,
  extraActions = [],
  triggerClassName,
  align = 'end'
}: EntityActionMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className={triggerClassName || "h-9 w-9 rounded-lg hover:bg-primary/5"}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-44 shadow-sem-lg border-border/10">
        {onView && (
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }} className="cursor-pointer gap-2 py-2.5 font-bold">
            <Eye className="h-4 w-4 text-primary" /> Visualizar Detalhes
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }} className="cursor-pointer gap-2 py-2.5 font-bold">
            <Pencil className="h-4 w-4" /> Editar Registro
          </DropdownMenuItem>
        )}
        
        {extraActions.length > 0 && (
          <>
            <DropdownMenuSeparator className="opacity-50" />
            {extraActions.map((action, idx) => (
              <DropdownMenuItem
                key={idx}
                onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                className={`cursor-pointer gap-2 py-2.5 font-bold ${action.variant === 'destructive' ? 'text-destructive' : ''}`}
              >
                {action.icon && <action.icon className="h-4 w-4" />}
                {action.label}
              </DropdownMenuItem>
            ))}
          </>
        )}

        {onDelete && (
          <>
            <DropdownMenuSeparator className="opacity-50" />
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-destructive font-bold gap-2 py-2.5 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" /> Excluir permanentemente
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
