import { useNavigate } from "react-router-dom";
import { ChevronRight, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataView } from "@/components/shared/DataView";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { useProperties } from "@/hooks";


export const ActiveProperties = () => {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const activeProperties = properties.filter(p => p.status === 'progress').slice(0, 4);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-h2 flex items-center gap-2 font-black">
          <Building className="text-primary h-5 w-5 md:h-6 md:w-6" />
          Portfólio Estratégico
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
      <DataView
        items={activeProperties}
        viewMode="grid"
        gridClassName="animate-in fade-in slide-in-from-left-4 duration-slow"
        renderGrid={(property) => (
          <PropertyCard key={property.id} property={property} onClick={() => navigate("/admin/properties")} />
        )}
      />

    </section>
  );
};
