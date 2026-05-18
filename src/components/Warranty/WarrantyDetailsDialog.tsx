import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Clock, Printer, UserPlus, AlertCircle, Plus } from "lucide-react";
import { WarrantyRequestFlow, WARRANTY_STAGES, STAGE_ORDER, WarrantyStage } from "@/types/warrantyFlow";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WarrantyRequestTimeline } from "@/components/Warranty/ClientTimeline/WarrantyRequestTimeline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TECHNICIANS = [
  { id: "tech-1", name: "Carlos Técnico" },
  { id: "tech-2", name: "Ana Vistoriadora" },
  { id: "tech-3", name: "Roberto Santos" },
  { id: "tech-4", name: "Juliana Costa" }
];

interface WarrantyDetailsDialogProps {
  request: WarrantyRequestFlow | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (requestId: string, stage: WarrantyStage) => void;
  onTogglePause: (requestId: string, isPaused: boolean, reason: string) => void;
  onAssignTech: (requestId: string, techId: string, techName: string) => void;
  onAddProblem: (requestId: string) => void;
  onGenerateReport: (request: WarrantyRequestFlow) => void;
}

export const WarrantyDetailsDialog = ({
  request,
  isOpen,
  onOpenChange,
  onStatusChange,
  onTogglePause,
  onAssignTech,
  onAddProblem,
  onGenerateReport
}: WarrantyDetailsDialogProps) => {
  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[92vh] flex flex-col p-0 overflow-hidden border-none shadow-sem-xl rounded-[2.5rem] bg-background/95 backdrop-blur-2xl">
        <DialogHeader className="px-10 pt-10 pb-8 bg-primary/5 border-b border-border/10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sem-sm">
                <ShieldCheck className="w-8 h-8 text-primary" strokeWidth={3} />
              </div>
              Solicitação #{request.id.split('-')[0].toUpperCase()}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "rounded-xl font-bold gap-2 h-10 border-primary/30",
                  request.isPaused ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : ""
                )}
                onClick={() => {
                  const reason = request.isPaused ? "" : window.prompt("Motivo da pausa:", "Aguardando material");
                  if (reason !== null) onTogglePause(request.id, !request.isPaused, reason);
                }}
              >
                <Clock size={16} /> {request.isPaused ? "Retomar SLA" : "Pausar SLA"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl font-bold gap-2 h-10 border-primary/30"
                onClick={() => onGenerateReport(request)}
              >
                <Printer size={16} /> Gerar Laudo
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8">
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList className="flex w-full overflow-x-auto no-scrollbar p-1 bg-muted/50 rounded-xl h-auto min-h-10">
              <TabsTrigger value="timeline" className="rounded-lg">Timeline</TabsTrigger>
              <TabsTrigger value="problems" className="rounded-lg">Itens Breakdown</TabsTrigger>
              <TabsTrigger value="assignment" className="rounded-lg">Atribuição</TabsTrigger>
              <TabsTrigger value="costs" className="rounded-lg">Custos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="space-y-4">
              <div className="p-6 bg-muted/20 rounded-2xl border border-border/10 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Etapa Atual</p>
                    <p className="text-lg font-black">{WARRANTY_STAGES[request.currentStage].label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {STAGE_ORDER.filter(s => s !== request.currentStage).slice(0, 3).map((stage: WarrantyStage) => (
                      <Button 
                        key={stage}
                        size="sm"
                        variant="outline"
                        onClick={() => onStatusChange(request.id, stage)}
                      >
                        {WARRANTY_STAGES[stage].label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <WarrantyRequestTimeline request={request} />
            </TabsContent>

            <TabsContent value="assignment">
              <Card>
                <CardHeader>
                  <CardTitle>Atribuição de Responsável</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={request.assignedTo || "unassigned"} 
                    onValueChange={(val: string) => {
                      const tech = TECHNICIANS.find(t => t.id === val);
                      if (tech) onAssignTech(request.id, tech.id, tech.name);
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione um técnico" /></SelectTrigger>
                    <SelectContent>
                      {TECHNICIANS.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
