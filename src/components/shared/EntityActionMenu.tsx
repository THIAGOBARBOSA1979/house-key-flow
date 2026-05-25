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
        <Button variant="ghost" size="icon" className={triggerClassName || "h-10 w-10 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all duration-300"}>
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56 p-2 rounded-2xl shadow-sem-xl border-none bg-background/90 backdrop-blur-3xl ring-1 ring-black/5 dark:ring-white/10 animate-in zoom-in-95 slide-in-from-top-2 duration-300">
        {onView && (
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }} className="cursor-pointer gap-3 py-3 px-4 font-black uppercase tracking-widest text-[10px] rounded-xl focus:bg-primary/5 focus:text-primary transition-all duration-200">
            <Eye className="h-4 w-4 text-primary opacity-60" /> Visualizar Detalhes
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }} className="cursor-pointer gap-3 py-3 px-4 font-black uppercase tracking-widest text-[10px] rounded-xl focus:bg-primary/5 focus:text-primary transition-all duration-200">
            <Pencil className="h-4 w-4 opacity-40" /> Editar Registro
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
              className="text-destructive font-black uppercase tracking-widest text-[10px] gap-3 py-3 px-4 cursor-pointer rounded-xl focus:bg-destructive/5 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4 opacity-60" /> Excluir Registro
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
