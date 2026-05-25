import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Info, Clock, AlertCircle } from "lucide-react";

interface WarrantyTabProps {
  settings: any;
  updateSection: (section: string, data: any) => void;
  onSave: () => void;
}

export const WarrantyTab = ({ settings, updateSection, onSave }: WarrantyTabProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card className="card-standard border-none bg-card/40 backdrop-blur-md shadow-sem-lg rounded-[2rem]">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-primary" /> Prazos de Garantia & SLAs
          </CardTitle>
          <CardDescription>Defina os prazos legais e acordos de nível de serviço para atendimentos técnicos.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-8">
          <div className="space-y-6">
            <h3 className="text-xs font-black text-primary uppercase tracking-widest px-1 flex items-center gap-2">
              <Clock size={14} /> Prazos por Categoria (Anos)
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Estrutural", key: "Structural" },
                { label: "Impermeabilização", key: "Waterproofing" },
                { label: "Instalações", key: "Installations" },
                { label: "Acabamentos", key: "Finishings" }
              ].map((item) => (
                <div key={item.key} className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border/5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block text-center">{item.label}</Label>
                  <Input 
                    type="number" 
                    className="h-12 rounded-xl font-black text-center text-lg bg-background/50 border-none shadow-sm focus-visible:ring-primary/30" 
                    value={settings.warranty[item.key]} 
                    onChange={e => updateSection('warranty', { [item.key]: parseInt(e.target.value) })} 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-border/10 space-y-6">
            <h3 className="text-xs font-black text-primary uppercase tracking-widest px-1 flex items-center gap-2">
              <AlertCircle size={14} /> SLAs de Atendimento (Horas)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Emergência (Crítico)", key: "emergencySla", color: "text-status-critical", bg: "bg-status-critical/5" },
                { label: "Urgente (Alta)", key: "urgentSla", color: "text-status-pending", bg: "bg-status-pending/5" },
                { label: "Normal (Rotina)", key: "normalSla", color: "text-status-progress", bg: "bg-status-progress/5" }
              ].map((sla) => (
                <div key={sla.key} className={cn("space-y-3 p-6 rounded-3xl border border-border/5", sla.bg)}>
                   <div className="flex items-center justify-between">
                     <Label className={cn("text-[10px] font-black uppercase tracking-widest", sla.color)}>{sla.label}</Label>
                     <Clock className={cn("w-3.5 h-3.5 opacity-50", sla.color)} />
                   </div>
                   <div className="relative">
                    <Input 
                      type="number" 
                      className="h-14 rounded-2xl bg-background border-none shadow-sm font-black text-2xl pl-6" 
                      value={settings.warranty[sla.key]} 
                      onChange={e => updateSection('warranty', { [sla.key]: parseInt(e.target.value) })}
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">horas</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-8 pt-0 flex justify-end">
          <Button onClick={onSave} className="rounded-xl h-11 px-8 font-black uppercase text-[11px] tracking-widest shadow-lg shadow-primary/20">
            Salvar Regras de Negócio
          </Button>
        </CardFooter>
      </Card>

      <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
          <Info size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground mb-1">Nota Legal</p>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Estes prazos são utilizados para calcular a validade das garantias nas unidades dos clientes. 
            Qualquer alteração afetará novos chamados de assistência técnica. Os prazos seguem as diretrizes da norma NBR 15575.
          </p>
        </div>
      </div>
    </div>
  );
};
