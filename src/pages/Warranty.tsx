import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarrantyKanban } from "@/components/Warranty/Kanban/WarrantyKanban";
import { WarrantyMetricsDashboard } from "@/components/Warranty/Dashboard/WarrantyMetricsDashboard";
import { SLAConfigurationPanel } from "@/components/Warranty/SLA/SLAConfigurationPanel";
import { WarrantyHeader } from "@/components/Warranty/WarrantyHeader";
import { WarrantyRequestFlow } from "@/types/warrantyFlow";
import { warrantyFlowService } from "@/services/WarrantyFlowService";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { WarrantyRequestTimeline } from "@/components/Warranty/ClientTimeline/WarrantyRequestTimeline";
import { AuditLogViewer } from "@/components/Admin/AuditLogViewer";
import { Kanban, BarChart3, Settings, History, Plus, AlertCircle, CheckCircle, MessageSquare, UserPlus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TECHNICIANS = [
  { id: "tech-1", name: "Carlos Técnico" },
  { id: "tech-2", name: "Ana Vistoriadora" },
  { id: "tech-3", name: "Roberto Santos" },
  { id: "tech-4", name: "Juliana Costa" }
];

const Warranty = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("kanban");
  const [selectedRequest, setSelectedRequest] = useState<WarrantyRequestFlow | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados serão enviados para seu e-mail quando estiverem prontos.",
    });
  };

  const handleSelectRequest = (request: WarrantyRequestFlow) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <WarrantyHeader onExportData={handleExportData} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-4 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="kanban" className="gap-2 rounded-lg py-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Kanban className="h-4 w-4" />
            <span className="hidden sm:inline">Kanban</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2 rounded-lg py-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Métricas</span>
          </TabsTrigger>
          <TabsTrigger value="sla" className="gap-2 rounded-lg py-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">SLA</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2 rounded-lg py-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="kanban" className="space-y-4">
          <WarrantyKanban onSelectRequest={handleSelectRequest} />
        </TabsContent>
        
        <TabsContent value="dashboard" className="space-y-4">
          <WarrantyMetricsDashboard />
        </TabsContent>
        
        <TabsContent value="sla" className="space-y-4">
          <SLAConfigurationPanel />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <AuditLogViewer entityType="warranty" title="Logs de Auditoria - Garantias" />
        </TabsContent>
      </Tabs>

      {/* Request Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              Detalhes da Solicitação
              {selectedRequest?.isPaused && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pausada</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <Tabs defaultValue="timeline" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger value="timeline" className="rounded-lg data-[state=active]:shadow-sm">Timeline</TabsTrigger>
                <TabsTrigger value="problems" className="rounded-lg data-[state=active]:shadow-sm">Problemas</TabsTrigger>
                <TabsTrigger value="costs" className="rounded-lg data-[state=active]:shadow-sm">Custos</TabsTrigger>
                <TabsTrigger value="chat" className="rounded-lg data-[state=active]:shadow-sm">Chat</TabsTrigger>
                <TabsTrigger value="logs" className="rounded-lg data-[state=active]:shadow-sm">Logs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="timeline" className="space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-muted/30 rounded-lg border gap-4">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Responsável</p>
                      <p className="text-base font-bold">{selectedRequest.assignedToName || "Não atribuído"}</p>
                    </div>
                  </div>
                  <Select 
                    value={selectedRequest.assignedTo || "unassigned"} 
                    onValueChange={(value) => {
                      const tech = TECHNICIANS.find(t => t.id === value);
                      if (tech) {
                        const result = warrantyFlowService.assignTechnician(selectedRequest.id, tech.id, tech.name, 'admin-1');
                        if (result.success && result.request) {
                          setSelectedRequest(result.request);
                          toast({ title: "Técnico alterado", description: `Responsável agora é ${tech.name}` });
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="w-full md:w-[240px]">
                      <SelectValue placeholder="Alterar responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Sem responsável</SelectItem>
                      {TECHNICIANS.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <WarrantyRequestTimeline request={selectedRequest} />
              </TabsContent>
              
              <TabsContent value="problems" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Itens da Solicitação</h3>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => {
                      const result = warrantyFlowService.addProblemToRequest(selectedRequest.id, {
                        description: "Novo problema identificado",
                        category: "Geral",
                        location: "A definir",
                        severity: "moderate"
                      }, 'admin-1');
                      if (result.success && result.request) {
                        setSelectedRequest(result.request);
                        toast({ title: "Item adicionado", description: "Um novo item foi adicionado à lista." });
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Item
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {selectedRequest.problems && selectedRequest.problems.length > 0 ? (
                    selectedRequest.problems.map((prob) => (
                      <Card key={prob.id} className="overflow-hidden border-none bg-muted/20 shadow-none ring-1 ring-border/50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-base font-bold text-foreground">{prob.description}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="secondary" className="text-[10px] uppercase">{prob.category}</Badge>
                                <Badge variant="outline" className={cn(
                                  "text-[10px] uppercase",
                                  prob.severity === 'severe' ? 'text-red-600 border-red-200 bg-red-50' : ''
                                )}>
                                  Prioridade: {prob.severity === 'severe' ? 'Alta' : prob.severity === 'moderate' ? 'Média' : 'Baixa'}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant={prob.status === 'resolved' ? 'default' : 'outline'}
                              className={cn(
                                "h-9 px-4 gap-2 font-bold",
                                prob.status === 'resolved' ? "bg-emerald-600 hover:bg-emerald-700" : "border-amber-500 text-amber-700 hover:bg-amber-100"
                              )}
                              onClick={() => {
                                const result = warrantyFlowService.toggleProblemStatus(selectedRequest.id, prob.id, 'admin-1');
                                if (result.success && result.request) {
                                  setSelectedRequest(result.request);
                                  toast({ title: "Status atualizado" });
                                }
                              }}
                            >
                              {prob.status === 'resolved' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                              {prob.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                            </Button>
                          </div>
                          
                          {/* Evidence placeholder */}
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {[1, 2].map(i => (
                              <div key={i} className="w-24 h-24 rounded-lg bg-background border border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground cursor-pointer hover:bg-primary/5 transition-colors">
                                <ImageIcon className="h-5 w-5" />
                                <span className="text-[10px]">Foto {i}</span>
                              </div>
                            ))}
                            <div className="w-24 h-24 rounded-lg bg-background border border-dashed flex flex-col items-center justify-center gap-1 text-primary cursor-pointer hover:bg-primary/5 transition-colors">
                              <Plus className="h-5 w-5" />
                              <span className="text-[10px]">Anexar</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-muted/10 rounded-xl border border-dashed">
                      <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">Nenhum item detalhado disponível.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="costs" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-none bg-muted/20 shadow-none ring-1 ring-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Financeiro</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-end border-b border-border/50 pb-2">
                        <span className="text-sm font-medium">Custo Estimado</span>
                        <span className="text-xl font-black">R$ {(selectedRequest.estimatedCost || 0).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-medium">Custo Atual</span>
                        <span className={cn(
                          "text-xl font-black",
                          (selectedRequest.actualCost || 0) > (selectedRequest.estimatedCost || 0) ? "text-red-600" : "text-emerald-600"
                        )}>
                          R$ {(selectedRequest.actualCost || 0).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-muted/20 shadow-none ring-1 ring-border/50">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Materiais</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-[10px] font-bold gap-1 text-primary"
                        onClick={() => {
                          const name = window.prompt("Nome do material:");
                          const quantity = Number(window.prompt("Quantidade:", "1"));
                          const unit = window.prompt("Unidade (un, m2, kg):", "un");
                          const cost = Number(window.prompt("Custo unitário:", "0"));
                          
                          if (name) {
                            const result = warrantyFlowService.addMaterial(
                              selectedRequest.id, 
                              { name, quantity, unit: unit || "un", cost: cost * quantity }, 
                              'admin-1'
                            );
                            if (result.success && result.request) setSelectedRequest(result.request);
                          }
                        }}
                      >
                        <Plus className="h-3 w-3" /> Registrar Material
                      </Button>
                    </CardHeader>
                    <CardContent className="max-h-[200px] overflow-y-auto">
                      {selectedRequest.materials && selectedRequest.materials.length > 0 ? (
                        <div className="space-y-2">
                          {selectedRequest.materials.map((m, i) => (
                            <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-background border shadow-sm">
                              <div>
                                <p className="text-xs font-bold">{m.name}</p>
                                <p className="text-[10px] text-muted-foreground font-medium">{m.quantity} {m.unit}</p>
                              </div>
                              <span className="text-xs font-bold">R$ {m.cost?.toLocaleString('pt-BR') || '0,00'}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic text-center py-6">Nenhum material registrado.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="chat" className="space-y-4">
                <div className="h-[400px] border rounded-xl p-4 bg-muted/10 overflow-y-auto flex flex-col gap-4">
                  <div className="bg-primary/10 self-start p-4 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">A2 Suporte</p>
                    <p className="text-sm font-medium leading-relaxed">Olá, registramos sua solicitação. O técnico Carlos foi designado e entrará em contato em breve para agendar a vistoria.</p>
                    <span className="text-[10px] text-muted-foreground/60 mt-2 block font-bold">Hoje, 10:45</span>
                  </div>
                  <div className="bg-background self-end p-4 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm ring-1 ring-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Cliente</p>
                    <p className="text-sm font-medium leading-relaxed">Perfeito! Fico no aguardo do contato dele. Obrigado pela rapidez.</p>
                    <span className="text-[10px] text-muted-foreground/60 mt-2 block font-bold">Hoje, 11:20</span>
                  </div>
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Textarea placeholder="Mensagem interna ou para o cliente..." className="min-h-[100px] rounded-xl resize-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="h-11 rounded-xl">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button className="h-11 px-6 rounded-xl gap-2 font-bold shadow-sem-md">
                      <MessageSquare className="h-4 w-4" />
                      Enviar
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="logs">
                <AuditLogViewer 
                  entityType="warranty" 
                  entityId={selectedRequest.id} 
                  title="Histórico Completo de Auditoria" 
                  compact 
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Warranty;