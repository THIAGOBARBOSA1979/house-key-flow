import React from "react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/Shared/StatusBadge";
import { cn } from "@/lib/utils";
import { Property } from "@/types/property";

interface PropertyTimelineProps {
  items: Property[];
}

export const PropertyTimeline: React.FC<PropertyTimelineProps> = ({ items }) => {
  return (
    <div className="space-y-6">
      {items.map((property) => {
        const progress = property.units ? Math.round((property.completedUnits / property.units) * 100) : 0;
        
        return (
          <Card 
            key={property.id} 
            className="card-standard border-none bg-card/40 backdrop-blur-md overflow-hidden p-6 rounded-3xl shadow-sem-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-full md:w-1/4">
                <h4 className="text-lg font-black tracking-tight">{property.name}</h4>
                <p className="text-xs text-muted-foreground font-medium">{property.location}</p>
                <div className="mt-4">
                  <StatusBadge status={property.status} size="sm" />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <span>Cronograma de Obra</span>
                  <span>{progress}% Concluído</span>
                </div>
                <div className="relative h-12 w-full bg-muted/30 rounded-2xl border border-border/5 overflow-hidden p-1 flex gap-1">
                  {property.milestones && property.milestones.length > 0 ? (
                    property.milestones.map((m) => (
                      <div 
                        key={m.id} 
                        className={cn(
                          "h-full rounded-xl flex-1 flex items-center justify-center transition-all group relative", 
                          m.completed 
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                            : "bg-muted/50"
                        )}
                      >
                         <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold px-2 py-1 rounded shadow-lg z-10 border border-border whitespace-nowrap">
                           {m.title}
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground italic">
                      Nenhum marco definido
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
