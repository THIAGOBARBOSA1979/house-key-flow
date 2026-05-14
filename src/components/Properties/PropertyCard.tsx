
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Home, Users, MapPin, Calendar } from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";
import { Badge } from "@/components/ui/badge";

import { Property } from "@/services/PropertyService";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PropertyCardProps {
  property: Property;
  onEdit?: () => void;
  onDelete?: () => void;
}


export const PropertyCard = ({ property, onEdit, onDelete }: PropertyCardProps) => {
  const completionPercentage = Math.round((property.completedUnits / property.units) * 100);
  
  return (
    <Card className="overflow-hidden card-hover">
      <div className="h-32 sm:h-40 bg-muted relative">
        {property.imageUrl ? (
          <img 
            src={property.imageUrl} 
            alt={property.name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building className="text-slate-400" size={48} />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <StatusBadge status={property.status} />
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-xl">{property.name}</CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin size={14} />
              {property.location}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Unidades</p>
            <div className="flex items-center gap-2">
              <Home size={16} className="text-company" />
              <span className="text-sm font-medium">{property.units}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Entregues</p>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-emerald-600" />
              <span className="text-sm font-medium">{property.completedUnits}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>Progresso da Entrega</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-company transition-all duration-500" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2 pt-0">
        <Button variant="outline" size="sm" className="flex-1">
          Ver detalhes
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreHorizontal size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>

    </Card>
  );
};
