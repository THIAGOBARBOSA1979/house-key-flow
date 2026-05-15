
import React from "react";
import { cn } from "@/lib/utils";
import { PropertyUnit } from "@/services/PropertyService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PropertyUnitMapProps {
  units: PropertyUnit[];
  onUnitClick?: (unit: PropertyUnit) => void;
}

export function PropertyUnitMap({ units, onUnitClick }: PropertyUnitMapProps) {
  if (!units || units.length === 0) {
    // Generate some dummy units if none exist for visualization
    const dummyUnits: PropertyUnit[] = Array.from({ length: 24 }).map((_, i) => ({
      id: `d${i}`,
      number: `${100 + i + 1}`,
      status: i < 10 ? "delivered" : (i < 18 ? "sold" : "available"),
      floor: `${Math.floor(i / 4) + 1}`,
    }));
    units = dummyUnits;
  }

  const statusColors = {
    available: "bg-muted hover:bg-muted/80 text-muted-foreground",
    sold: "bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200",
    delivered: "bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-200",
  };

  const statusLabels = {
    available: "Disponível",
    sold: "Vendido",
    delivered: "Entregue",
  };

  // Group units by floor
  const floors = Array.from(new Set(units.map(u => u.floor || "Geral"))).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-4 flex-wrap">
        {Object.entries(statusLabels).map(([status, label]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded", statusColors[status as keyof typeof statusColors].split(' ')[0])} />
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-4">
        {floors.map(floor => (
          <div key={floor} className="flex items-center gap-4">
            <div className="w-12 text-xs font-black text-muted-foreground uppercase shrink-0">{floor}º Andar</div>
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                {units.filter(u => u.floor === floor).map(unit => (
                  <Tooltip key={unit.id}>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => onUnitClick?.(unit)}
                        className={cn(
                          "w-10 h-10 rounded-lg border flex items-center justify-center text-[10px] font-black cursor-pointer transition-all active:scale-95",
                          statusColors[unit.status]
                        )}
                      >
                        {unit.number}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-bold">Unidade {unit.number}</p>
                      <p className="text-xs">{statusLabels[unit.status]}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
