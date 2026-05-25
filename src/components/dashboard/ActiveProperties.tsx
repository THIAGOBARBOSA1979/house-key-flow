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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-h2 flex items-center gap-2.5 font-black uppercase tracking-tighter">
          <Building className="text-primary h-5 w-5" />
          Portfólio Estratégico
        </h2>

        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 font-bold text-primary hover:bg-primary/5 rounded-xl" 
          onClick={() => navigate("/admin/properties")}
        >
          Explorar Ativos
          <ChevronRight size={14} />
        </Button>
      </div>

      <DataView
        items={activeProperties}
        viewMode="grid"
        gridClassName="animate-in fade-in slide-in-from-left-4 duration-slow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-layout-gap"
        renderGrid={(property) => (
          <PropertyCard key={property.id} property={property} onClick={() => navigate("/admin/properties")} />
        )}
      />

    </section>
  );
};
