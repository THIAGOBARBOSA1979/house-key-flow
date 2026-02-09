
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Home, Users } from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";

interface PropertyCardProps {
  property: {
    id: string;
    name: string;
    location: string;
    units: number;
    completedUnits: number;
    status: "pending" | "progress" | "complete";
    imageUrl?: string;
  };
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
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
      <CardHeader>
        <CardTitle>{property.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{property.location}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Home size={16} className="text-muted-foreground" />
          <span className="text-sm">
            {property.completedUnits} de {property.units} unidades entregues
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-company" 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-right">{completionPercentage}% concluído</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          Ver detalhes
        </Button>
      </CardFooter>
    </Card>
  );
};
