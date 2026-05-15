
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Property, propertyService } from "@/services/PropertyService";
import { PropertyMilestones } from "./PropertyMilestones";
import { PropertyUnitMap } from "./PropertyUnitMap";
import { Building, MapPin, User, Ruler, Calendar, LayoutGrid, ListChecks, Info } from "lucide-react";
import { safeFormat } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface PropertyDetailsDialogProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function PropertyDetailsDialog({ property, open, onOpenChange, onUpdate }: PropertyDetailsDialogProps) {
  const { toast } = useToast();

  if (!property) return null;

  const handleToggleMilestone = (milestoneId: string, completed: boolean) => {
    if (!property.id) return;
    const result = propertyService.updateMilestone(property.id, milestoneId, completed);
    if (result) {
      toast({
        title: completed ? "Marco concluído!" : "Marco reaberto",
        description: `O status do marco foi atualizado com sucesso.`,
      });
      onUpdate?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 border-none shadow-2xl rounded-3xl">
        <div className="relative h-48 bg-muted">
          {property.imageUrl ? (
            <img src={property.imageUrl} alt={property.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Building size={64} className="text-primary/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-8">
            <h2 className="text-3xl font-black text-white tracking-tight">{property.name}</h2>
            <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
              <MapPin size={14} />
              <span>{property.location}</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-2xl">
              <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-background transition-all">
                <Info size={16} className="mr-2" /> Visão Geral
              </TabsTrigger>
              <TabsTrigger value="milestones" className="rounded-xl data-[state=active]:bg-background transition-all">
                <ListChecks size={16} className="mr-2" /> Cronograma
              </TabsTrigger>
              <TabsTrigger value="units" className="rounded-xl data-[state=active]:bg-background transition-all">
                <LayoutGrid size={16} className="mr-2" /> Unidades
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-black uppercase tracking-widest text-muted-foreground opacity-50">Dados Técnicos</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-4 rounded-2xl border border-border/10">
                      <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Área Construída</p>
                      <div className="flex items-center gap-2 text-foreground font-black">
                        <Ruler size={14} className="text-primary" />
                        <span>{property.totalArea?.toLocaleString()} m²</span>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-2xl border border-border/10">
                      <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Previsão Entrega</p>
                      <div className="flex items-center gap-2 text-foreground font-black">
                        <Calendar size={14} className="text-primary" />
                        <span>{property.deliveryDate ? safeFormat(property.deliveryDate, "MMM yyyy") : "N/A"}</span>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-2xl border border-border/10 col-span-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Gerente Responsável</p>
                      <div className="flex items-center gap-2 text-foreground font-black">
                        <User size={14} className="text-primary" />
                        <span>{property.manager || "Não atribuído"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-black uppercase tracking-widest text-muted-foreground opacity-50">Descrição</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description || "Nenhuma descrição adicional informada para este empreendimento."}
                  </p>
                  
                  <div className="pt-4 flex gap-3">
                    <Button className="flex-1 rounded-xl font-bold uppercase text-xs h-12 shadow-md">
                      Editar Detalhes
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-xl font-bold uppercase text-xs h-12 border-border/50">
                      Exportar Dossier
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="milestones" className="animate-in fade-in duration-300">
              <div className="max-w-2xl mx-auto">
                <PropertyMilestones 
                  milestones={property.milestones || []} 
                  onToggleMilestone={handleToggleMilestone}
                />
              </div>
            </TabsContent>

            <TabsContent value="units" className="animate-in fade-in duration-300">
              <PropertyUnitMap 
                units={property.unitsList || []} 
                onUnitClick={(unit) => {
                  toast({
                    title: `Unidade ${unit.number}`,
                    description: `Status atual: ${unit.status === 'available' ? 'Disponível' : unit.status === 'sold' ? 'Vendido' : 'Entregue'}`,
                  });
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
