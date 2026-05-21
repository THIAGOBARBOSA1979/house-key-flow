
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { PropertyUnit, propertyService } from "@/services";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Plus, Settings2, Trash2, CheckCircle2, MoreVertical, LayoutPanelTop, ShoppingCart, Truck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PropertyUnitMapProps {
  propertyId: string;
  units: PropertyUnit[];
  onUnitClick?: (unit: PropertyUnit) => void;
  onUpdate?: () => void;
}

export function PropertyUnitMap({ propertyId, units, onUnitClick, onUpdate }: PropertyUnitMapProps) {
  const { toast } = useToast();
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [batchData, setBatchData] = useState({
    floorStart: 1,
    floorEnd: 10,
    unitsPerFloor: 4,
    prefix: ""
  });

  const handleBatchCreate = async () => {
    const result = await propertyService.batchCreateUnits(
      propertyId,
      batchData.floorStart,
      batchData.floorEnd,
      batchData.unitsPerFloor,
      batchData.prefix
    );

    if (result) {
      toast({
        title: "Unidades criadas",
        description: `Lote de unidades gerado com sucesso para o ${result.name}.`,
      });
      setIsBatchDialogOpen(false);
      onUpdate?.();
    }
  };


  const handleUpdateStatus = async (unitId: string, status: PropertyUnit['status']) => {
    const result = await propertyService.updateUnitStatus(propertyId, unitId, status);
    if (result) {
      toast({
        title: "Status atualizado",
        description: `Unidade movida para ${statusLabels[status]}.`,
      });
      onUpdate?.();
    }
  };


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

  const floors = Array.from(new Set(units.map(u => u.floor || "Geral"))).sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
    return b.localeCompare(a);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/10 pb-6">
        <div className="flex gap-4 flex-wrap">
          {Object.entries(statusLabels).map(([status, label]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded", statusColors[status as keyof typeof statusColors].split(' ')[0])} />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</span>
            </div>
          ))}
        </div>
        
        <Button 
          onClick={() => setIsBatchDialogOpen(true)}
          className="rounded-xl h-10 px-4 font-black uppercase text-[10px] tracking-widest gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-none"
        >
          <Plus size={16} strokeWidth={3} /> Criar Lote de Unidades
        </Button>
      </div>

      {units.length === 0 ? (
        <div className="py-20 text-center bg-muted/5 rounded-3xl border border-dashed border-border/20">
          <Settings2 size={48} className="mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-sem-body-sm font-black uppercase tracking-widest text-muted-foreground/40">Nenhuma unidade cadastrada</p>
          <Button 
            variant="ghost" 
            onClick={() => setIsBatchDialogOpen(true)}
            className="mt-4 text-primary font-bold hover:bg-primary/5 rounded-xl"
          >
            Gerar inventário agora
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {floors.map(floor => (
            <div key={floor} className="flex items-start gap-6 group">
              <div className="w-16 pt-2 shrink-0">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/30 px-2 py-1 rounded-lg border border-border/5">
                  Andar {floor}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <TooltipProvider>
                  {units.filter(u => u.floor === floor).sort((a, b) => a.number.localeCompare(b.number)).map(unit => (
                    <Tooltip key={unit.id}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "w-12 h-12 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90 hover:shadow-sem-md hover:-translate-y-0.5 relative group/unit overflow-hidden",
                                statusColors[unit.status]
                              )}
                            >
                              <span className="text-[11px] font-black tracking-tighter">{unit.number}</span>
                              {unit.status === 'delivered' && <CheckCircle2 size={10} className="absolute bottom-1 right-1 text-emerald-600" />}
                            </div>
                          </TooltipTrigger>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="p-2 rounded-2xl shadow-sem-xl border-none animate-in zoom-in-95 duration-200">
                          <DropdownMenuItem className="py-2 px-4 rounded-xl font-bold cursor-pointer focus:bg-primary/5 focus:text-primary" onClick={() => handleUpdateStatus(unit.id, 'available')}>
                            <LayoutPanelTop size={14} className="mr-2 opacity-50" /> {statusLabels.available}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="py-2 px-4 rounded-xl font-bold cursor-pointer focus:bg-primary/5 focus:text-primary" onClick={() => handleUpdateStatus(unit.id, 'sold')}>
                            <ShoppingCart size={14} className="mr-2 opacity-50" /> {statusLabels.sold}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="py-2 px-4 rounded-xl font-bold cursor-pointer focus:bg-primary/5 focus:text-primary" onClick={() => handleUpdateStatus(unit.id, 'delivered')}>
                            <Truck size={14} className="mr-2 opacity-50" /> {statusLabels.delivered}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <TooltipContent className="p-3 rounded-xl border-none shadow-sem-xl">
                        <div className="space-y-1">
                          <p className="font-black text-sm">Unidade {unit.number}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{statusLabels[unit.status]}</p>
                          <p className="text-[9px] font-bold text-primary/60">Clique para alterar status</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
        <DialogContent className="rounded-3xl border-none shadow-sem-xl sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">Criação de Unidades em Lote</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Andar Inicial</Label>
                <input 
                  type="number" 
                  value={batchData.floorStart}
                  onChange={e => setBatchData({...batchData, floorStart: parseInt(e.target.value)})}
                  className="w-full bg-background border border-border rounded-xl font-bold h-11 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Andar Final</Label>
                <input 
                  type="number" 
                  value={batchData.floorEnd}
                  onChange={e => setBatchData({...batchData, floorEnd: parseInt(e.target.value)})}
                  className="w-full bg-background border border-border rounded-xl font-bold h-11 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unidades por Andar</Label>
              <input 
                type="number" 
                value={batchData.unitsPerFloor}
                onChange={e => setBatchData({...batchData, unitsPerFloor: parseInt(e.target.value)})}
                className="w-full bg-background border border-border rounded-xl font-bold h-11 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Prefixo (Opcional)</Label>
              <Input 
                placeholder="Ex: Bloco A" 
                value={batchData.prefix}
                onChange={e => setBatchData({...batchData, prefix: e.target.value})}
                className="rounded-xl font-bold h-11"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsBatchDialogOpen(false)} className="rounded-xl h-11 font-bold">Cancelar</Button>
            <Button onClick={handleBatchCreate} className="rounded-xl h-11 font-black uppercase tracking-widest text-[11px]">Gerar Unidades</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
