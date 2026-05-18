import { useNavigate } from "react-router-dom";
import { ChevronRight, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { PropertyCard } from "@/components/Properties/PropertyCard";
import { Property } from "@/services/PropertyService";

interface ActivePropertiesProps {
  properties: Property[];
}

export const ActiveProperties = ({ properties }: ActivePropertiesProps) => {
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h2 flex items-center gap-2">
          <Building size={24} className="text-primary" />
          Empreendimentos Ativos
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 font-bold text-primary" 
          onClick={() => navigate("/admin/properties")}
        >
          Ver todos
          <ChevronRight size={16} />
        </Button>
      </div>
      <ResponsiveGrid columns={2} mobileCols={1} tabletCols={2} gap="layout">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} onClick={() => navigate("/admin/properties")} />
        ))}

      </ResponsiveGrid>
    </section>
  );
};
