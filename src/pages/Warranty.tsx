
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarrantyKanban } from "@/components/Warranty/Kanban/WarrantyKanban";
import { WarrantyMetricsDashboard } from "@/components/Warranty/Dashboard/WarrantyMetricsDashboard";
import { SLAConfigurationPanel } from "@/components/Warranty/SLA/SLAConfigurationPanel";
import { WarrantyHeader } from "@/components/Warranty/WarrantyHeader";
import { WarrantyRequestFlow } from "@/types/warrantyFlow";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { WarrantyRequestTimeline } from "@/components/Warranty/ClientTimeline/WarrantyRequestTimeline";
import { AuditLogViewer } from "@/components/Admin/AuditLogViewer";
import { Kanban, BarChart3, Settings, History } from "lucide-react";

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
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="kanban" className="gap-2">
            <Kanban className="h-4 w-4" />
            <span className="hidden sm:inline">Kanban</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Métricas</span>
          </TabsTrigger>
          <TabsTrigger value="sla" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">SLA</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <Tabs defaultValue="timeline" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="timeline">Acompanhamento</TabsTrigger>
                <TabsTrigger value="problems">Problemas</TabsTrigger>
                <TabsTrigger value="costs">Custos/Materiais</TabsTrigger>
                <TabsTrigger value="logs">Histórico/Logs</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline">
                <WarrantyRequestTimeline request={selectedRequest} />
              </TabsContent>
              <TabsContent value="problems">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Detalhamento de Problemas</h3>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Item
                    </Button>
                  </div>
                  <div className="border rounded-md p-4 bg-muted/20">
                    {selectedRequest.problems && selectedRequest.problems.length > 0 ? (
                      <div className="space-y-3">
                        {selectedRequest.problems.map((prob) => (
                          <div key={prob.id} className="p-3 border rounded bg-background flex justify-between items-center">
                            <div>
                              <p className="font-medium">{prob.description}</p>
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                <span>{prob.category}</span>
                                <span>•</span>
                                <span className={prob.severity === 'severe' ? 'text-red-500 font-bold' : ''}>{prob.severity}</span>
                              </div>
                            </div>
                            <Badge variant={prob.status === 'resolved' ? 'default' : 'secondary'}>
                              {prob.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8 italic">Nenhum detalhamento de problema disponível.</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="costs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Controle Financeiro</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Custo Estimado:</span>
                        <span className="font-bold">R$ {(selectedRequest.estimatedCost || 0).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Custo Atual:</span>
                        <span className="font-bold text-red-600">R$ {(selectedRequest.actualCost || 0).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium">Margem de Erro:</span>
                          <span className="text-xs font-medium">
                            {selectedRequest.estimatedCost ? Math.round(((selectedRequest.actualCost || 0) / selectedRequest.estimatedCost) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Materiais Utilizados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedRequest.materials && selectedRequest.materials.length > 0 ? (
                        <ul className="space-y-1">
                          {selectedRequest.materials.map((m, i) => (
                            <li key={i} className="text-xs flex justify-between">
                              <span>{m.name} ({m.quantity} {m.unit})</span>
                              {m.cost && <span>R$ {m.cost}</span>}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Nenhum material registrado.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="logs">
                <AuditLogViewer 
                  entityType="warranty" 
                  entityId={selectedRequest.id} 
                  title="Logs de Auditoria" 
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
