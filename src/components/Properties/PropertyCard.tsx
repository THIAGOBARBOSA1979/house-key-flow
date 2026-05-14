

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
  className?: string;
}

/**
 * Enhanced PropertyCard following the new Design System tokens.
 */
export const PropertyCard = ({ property, onEdit, onDelete, className }: PropertyCardProps) => {
  const completionPercentage = Math.round((property.completedUnits / property.units) * 100);
  
  return (
    <Card className={cn("card-standard card-hover-effect overflow-hidden border-none bg-background/50 backdrop-blur-sm", className)}>
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

      <CardContent className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 p-2.5 rounded-lg border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Unidades</p>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-primary/10 rounded">
                <Home size={14} className="text-primary" />
              </div>
              <span className="text-sm font-bold">{property.units}</span>
            </div>
          </div>
          <div className="bg-muted/30 p-2.5 rounded-lg border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Entregues</p>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-emerald-500/10 rounded">
                <Users size={14} className="text-emerald-500" />
              </div>
              <span className="text-sm font-bold">{property.completedUnits}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px] font-bold">
            <span className="text-muted-foreground">PROGRESSO DA ENTREGA</span>
            <span className="text-primary">{completionPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/20">
            <div 
              className={cn(
                "h-full transition-all duration-1000 ease-out rounded-full",
                property.status === 'complete' ? "bg-emerald-500" : "bg-primary"
              )} 
              style={{ width: `${completionPercentage}%` }}
              role="progressbar"
              aria-valuenow={completionPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2 pt-2 border-t border-border/10">
        <Button variant="ghost" size="sm" className="flex-1 text-xs font-bold hover:bg-primary/10 hover:text-primary active:scale-95 transition-all">
          Gerenciar
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onEdit} className="text-xs font-medium cursor-pointer">
              <Pencil className="mr-2 h-3.5 w-3.5" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs font-medium text-destructive focus:text-destructive cursor-pointer" onClick={onDelete}>
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};

