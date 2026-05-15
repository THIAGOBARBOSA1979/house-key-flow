

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Home, Users, MapPin, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";
import { Property } from "@/services/PropertyService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  className?: string;
}

/**
 * Enhanced PropertyCard following the new Design System tokens.
 */
export const PropertyCard = ({ property, onEdit, onDelete, onClick, className }: PropertyCardProps) => {
  const completionPercentage = Math.round((property.completedUnits / property.units) * 100);
  const completedMilestones = property.milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = property.milestones?.length || 0;
  
  return (
    <Card 
      onClick={onClick}
      className={cn("card-standard card-hover-effect overflow-hidden border-none bg-card/40 backdrop-blur-md flex flex-col h-full cursor-pointer group", className)}
    >
      <div className="h-40 bg-muted/30 relative group overflow-hidden">
        {property.imageUrl ? (
          <img 
            src={property.imageUrl} 
            alt={property.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/80">
            <Building className="text-muted-foreground/40" size={48} />
          </div>
        )}
        <div className="absolute top-3 right-3 shadow-lg">
          <StatusBadge status={property.status} showIcon size="sm" />
        </div>
      </div>

      <CardHeader className="pb-2 space-y-1">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <CardTitle className="text-lg font-bold truncate leading-tight group-hover:text-primary transition-colors">
              {property.name}
            </CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <MapPin size={12} className="text-primary/70" />
              <span className="truncate">{property.location}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2 flex-1">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/20 p-2.5 rounded-xl border border-border/10 flex flex-col justify-center">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1 opacity-70">Unidades</p>
            <div className="flex items-center gap-2">
              <Home size={13} className="text-primary opacity-70" />
              <span className="text-sm font-black">{property.units}</span>
            </div>
          </div>
          <div className="bg-muted/20 p-2.5 rounded-xl border border-border/10 flex flex-col justify-center">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1 opacity-70">Gerente</p>
            <div className="flex items-center gap-2">
              <Users size={13} className="text-emerald-500 opacity-70" />
              <span className="text-sm font-black truncate">{property.manager || "N/A"}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-[10px] font-black tracking-tighter">
            <span className="text-muted-foreground uppercase opacity-70">ENTREGA DE UNIDADES</span>
            <span className="text-primary">{completionPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden border border-border/5">
            <div 
              className={cn(
                "h-full transition-all duration-1000 ease-out rounded-full",
                property.status === 'complete' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.3)]"
              )} 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {totalMilestones > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-[10px] font-black tracking-tighter">
              <span className="text-muted-foreground uppercase opacity-70">CRONOGRAMA DE OBRA</span>
              <span className="text-emerald-500">{completedMilestones}/{totalMilestones} ETAPAS</span>
            </div>
            <div className="flex gap-1">
              {property.milestones?.map((m) => (
                <div 
                  key={m.id} 
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    m.completed ? "bg-emerald-500" : "bg-muted"
                  )} 
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 pt-4 border-t border-border/5 bg-muted/5">
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1 text-xs font-black uppercase tracking-widest h-9 bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none active:scale-95 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          Painel Geral
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted/50 border border-border/10">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-sem-lg border-none animate-in fade-in zoom-in-95">
            <DropdownMenuItem onClick={onEdit} className="text-xs font-black uppercase tracking-tight cursor-pointer py-3 rounded-xl focus:bg-primary/5 focus:text-primary">
              <Pencil className="mr-3 h-3.5 w-3.5 opacity-70" /> Editar Projeto
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs font-black uppercase tracking-tight text-destructive focus:text-destructive cursor-pointer py-3 rounded-xl focus:bg-destructive/5" onClick={onDelete}>
              <Trash2 className="mr-3 h-3.5 w-3.5 opacity-70" /> Remover Registro
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};

