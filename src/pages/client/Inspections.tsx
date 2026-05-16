import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ClipboardCheck, User, MapPin, List, CheckCircle, Clock, FileText, Lock, Info, TrendingUp, AlertTriangle } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { safeFormat } from "@/lib/utils";
import { StartInspectionDialog } from "@/components/Inspection/StartInspectionDialog";
import { ScheduleInspectionDialog } from "@/components/Inspection/ScheduleInspectionDialog";
import { RescheduleInspectionDialog } from "@/components/Inspection/RescheduleInspectionDialog";
import { DocumentPreviewDialog } from "@/components/Documents/DocumentPreviewDialog";
import { documentService } from "@/services/DocumentService";
import { useToast } from "@/hooks/use-toast";
import { FeatureGate, GatedButton } from "@/components/ClientFlow/FeatureGate";
import { useClientStage } from "@/hooks/useClientStage";
import { InspectionAcceptance } from "@/components/Inspection/InspectionAcceptance";
import { InspectionAcceptanceStatus } from "@/types/clientFlow";
import { eventAutomationService } from "@/services/EventAutomationService";
import { useAuth } from "@/contexts/AuthContext";
import { inspectionService, Inspection } from "@/services/InspectionService";
import { checklistService } from "@/services/ChecklistService";

// Inspections are fetched from inspectionService

// Helper component for the checklist status badges
const ChecklistBadge = ({ status }: { status: boolean }) => {
  return (
    <StatusBadge 
      status={status ? "complete" : "pending"} 
      label={status ? "Concluído" : "Pendente"} 
      size="sm"
    />
  );
};

const ClientInspections = () => {
  const { user } = useAuth();
  const allInspections = useMemo(() => {
    const rawInspections = inspectionService.getAll()
      .filter(i => i.client === (user?.name || "João Silva"));
    
    return rawInspections.map(i => {
      // Get items from checklist service if ID exists, else use defaults
      let checklistItems = [
        { id: "1", name: "Verificação de paredes e pinturas", completed: i.status === 'complete' },
        { id: "2", name: "Teste de instalações elétricas", completed: i.status === 'complete' },
        { id: "3", name: "Teste de instalações hidráulicas", completed: i.status === 'complete' },
      ];

      if (i.checklistId) {
        const template = checklistService.getTemplateById(i.checklistId);
        if (template) {
          checklistItems = template.groups.flatMap(g => g.items.map(item => ({
            id: item.id,
            name: item.description,
            completed: i.status === 'complete'
          })));
        }
      }

      return {
        ...i,
        title: i.type === 'technicalInspection' ? 'Vistoria Técnica' : i.type === 'keyDelivery' ? 'Entrega de Chaves' : 'Vistoria de Reparo',
        scheduledDate: i.date,
        inspector: i.technician,
        description: i.notes || "Vistoria para verificação das condições da unidade.",
        checklist: checklistItems,
        canStart: i.status === 'pending'
      };
    });
  }, [user?.name]);

  const [inspections, setInspections] = useState<any[]>(allInspections);
  
  // Keep local state in sync with memoized data when it changes
  useEffect(() => {
    setInspections(allInspections);
  }, [allInspections]);
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);
  const [startInspectionOpen, setStartInspectionOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [activeInspection, setActiveInspection] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const { toast } = useToast();
  
  // const { user } = useAuth();
  const clientId = user?.id || "client-1";
  const { canScheduleInspection, permissions } = useClientStage(clientId);
  
  const inspection = selectedInspection 
    ? inspections.find(i => i.id === selectedInspection) 
    : null;

  const handleStartInspection = (inspectionId: string) => {
    if (!permissions.canStartInspection) {
      toast({ title: "Funcionalidade bloqueada", description: "Você ainda não tem permissão para iniciar vistorias.", variant: "destructive" });
      return;
    }
    setActiveInspection(inspectionId);
    setStartInspectionOpen(true);
  };

  const handleInspectionComplete = (data: any) => {
    toast({ title: "Vistoria concluída com sucesso", description: "O relatório será processado e estará disponível em breve." });
    setStartInspectionOpen(false);
  };

  const handleConfirmPresence = () => {
    if (selectedInspection && user?.id) {
      const success = inspectionService.confirmPresence(selectedInspection, user.id);
      if (success) {
        toast({ title: "Presença confirmada", description: "Obrigado por confirmar sua presença na vistoria." });
      }
    }
  };
  
  const handleRequestReschedule = () => {
    if (selectedInspection && user?.id) {
      setRescheduleDialogOpen(true);
    }
  };
  
  const handleContactTeam = () => {
    // In a real app, this could open a chat or send a notification
    toast({ title: "Mensagem enviada", description: "Nossa equipe receberá sua mensagem e entrará em contato em breve." });
  };
  
  const handleViewPdf = () => {
    if (selectedInspection) {
      const report = inspectionService.getReport(selectedInspection);
      if (report) {
        const clientData = {
          nome_cliente: user?.name || "Cliente",
          endereco: `${report.inspection.property} - Unit ${report.inspection.unit}`,
          data_vistoria: report.inspection.date.toLocaleDateString(),
          responsavel_vistoria: report.inspection.technician,
          estado_geral: report.inspection.status === 'complete' ? "Concluído" : "Em andamento",
          instalacoes_eletricas: "Verificadas",
          instalacoes_hidraulicas: "Verificadas",
          observacoes: report.inspection.notes || "Nenhuma observação adicional."
        };
        
        // Find a report template
        const templates = documentService.getAllDocuments().filter(d => d.category === 'relatorio');
        const templateId = templates.length > 0 ? templates[0].id : "3";
        
        try {
          const preview = documentService.generateDocument(templateId, clientData);
          setPreviewContent(preview);
          setIsPreviewOpen(true);
        } catch (error) {
          toast({ title: "Erro ao gerar preview", description: "Não foi possível gerar o preview do relatório.", variant: "destructive" });
        }
      }
    }
  };

  const handleAcceptInspection = (inspectionId: string) => {
    setInspections(prev => prev.map(i => 
      i.id === inspectionId 
        ? { ...i, acceptanceStatus: "accepted" as InspectionAcceptanceStatus, acceptedAt: new Date() }
        : i
    ));
    eventAutomationService.onInspectionAccepted(inspectionId, clientId);
  };

  const handleRejectInspection = (inspectionId: string, reason: string) => {
    setInspections(prev => prev.map(i => 
      i.id === inspectionId 
        ? { ...i, acceptanceStatus: "rejected" as InspectionAcceptanceStatus, rejectedAt: new Date(), rejectionReason: reason }
        : i
    ));
    eventAutomationService.onInspectionRejected(inspectionId, clientId, reason);
  };

  return (
    <div className="space-y-layout-gap pb-20 md:pb-6">
      <DocumentPreviewDialog 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)}
        generatedContent={previewContent}
        document={{ title: "Relatório de Vistoria", type: "auto" } as any}
      />
      
      {selectedInspection && (
        <RescheduleInspectionDialog
          isOpen={rescheduleDialogOpen}
          onClose={() => setRescheduleDialogOpen(false)}
          inspectionId={selectedInspection}
          clientId={user?.id || "client-1"}
          onSuccess={() => {
            // Trigger a refresh of the inspections list
            const updatedInspections = inspectionService.getAll()
              .filter(i => i.client === (user?.name || "João Silva"));
            setInspections(updatedInspections.map(i => {
              // ... existing mapping logic or just re-fetch
              return {
                ...i,
                title: i.type === 'technicalInspection' ? 'Vistoria Técnica' : i.type === 'keyDelivery' ? 'Entrega de Chaves' : 'Vistoria de Reparo',
                scheduledDate: i.date,
                inspector: i.technician,
                description: i.notes || "Vistoria para verificação das condições da unidade.",
                checklist: [], 
                canStart: i.status === 'pending'
              };
            }));
          }}
        />
      )}

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            Minhas Vistorias
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe as vistorias agendadas para o seu imóvel e aprove os resultados.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {canScheduleInspection ? (
            <Button onClick={() => setScheduleDialogOpen(true)} className="font-bold">
              <Calendar className="mr-2 h-4 w-4" />
              Agendar Nova Vistoria
            </Button>
          ) : (
            <GatedButton isAllowed={false} tooltipMessage="Agendar vistorias será liberado em breve">
              <Calendar className="mr-2 h-4 w-4" />
              Agendar Vistoria
            </GatedButton>
          )}
        </div>
      </div>

      <FeatureGate
        isAllowed={canScheduleInspection}
        requiredStage="inspection_enabled"
        featureName="A funcionalidade de vistorias"
        message="As vistorias serão liberadas pelo administrador quando seu imóvel estiver pronto para vistoria."
        redirectTo="/client"
        redirectLabel="Voltar ao painel"
        variant="overlay"
      >
        <ResponsiveGrid columns={3} gap="layout" className="mb-6">
          <StatsCard 
            label="Total de Vistorias" 
            value={inspections.length} 
            icon={ClipboardCheck} 
            variant="brand"
          />
          <StatsCard 
            label="Concluídas" 
            value={inspections.filter(i => i.status === 'complete').length} 
            icon={CheckCircle} 
            variant="complete"
          />
          <StatsCard 
            label="Pendentes" 
            value={inspections.filter(i => i.status === 'pending').length} 
            icon={Clock} 
            variant="pending"
          />
        </ResponsiveGrid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-layout-gap">
          {/* Inspections list */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vistorias Agendadas</CardTitle>
                <CardDescription>Selecione uma vistoria para ver detalhes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2-sem">
                {inspections.length > 0 ? (
                  inspections.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                        selectedInspection === item.id 
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                          : "hover:bg-accent border-border/50"
                      }`}
                      onClick={() => setSelectedInspection(item.id)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold truncate text-foreground/90">{item.title}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter bg-muted/50">
                              {item.type === 'technicalInspection' ? 'Técnica' : 'Chaves'}
                            </Badge>
                            {item.acceptanceStatus === "pending_acceptance" && (
                              <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-black uppercase tracking-tighter border-none">
                                Aceite Pendente
                              </Badge>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      <div className="flex items-center justify-between mt-4 text-[11px] font-medium text-muted-foreground">
                        <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-1 rounded-lg">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          <span className="font-bold text-foreground/80">{safeFormat(item.scheduledDate, "dd/MM/yyyy HH:mm")}</span>
                        </div>
                        <span className="text-[9px] font-black uppercase text-muted-foreground/60 italic">#{item.id.substring(0, 6)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 px-4 bg-muted/20 rounded-2xl border border-dashed flex flex-col items-center animate-in fade-in duration-700">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                      <ClipboardCheck className="h-10 w-10 text-primary/30" />
                    </div>
                    <p className="text-base font-bold text-foreground/80">Nenhuma vistoria agendada</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[250px] mx-auto">
                      Sua agenda de vistorias aparecerá aqui assim que seu imóvel estiver pronto para a primeira visita.
                    </p>
                    <Button variant="outline" className="mt-6 font-bold" disabled>
                      Agendar em breve
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Precisa de ajuda?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Se você precisar remarcar uma vistoria ou tiver dúvidas sobre o processo, entre em contato com nossa equipe.
                </p>
                <Button variant="outline" className="w-full" onClick={handleContactTeam}>
                  Falar com a equipe
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Inspection details */}
          <div className="lg:col-span-2">
            {inspection ? (
              <Tabs defaultValue="details" className="animate-in fade-in slide-in-from-right-4 duration-slow">
                <TabsList className="bg-muted/50 p-1 rounded-2xl">
                  <TabsTrigger value="details" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">Detalhes</TabsTrigger>
                  <TabsTrigger value="checklist" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">Checklist</TabsTrigger>
                  {inspection.status === "complete" && (
                    <TabsTrigger value="report" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">Relatório</TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 pt-4">
                  {/* Acceptance component for completed inspections */}
                  {inspection.status === "complete" && inspection.acceptanceStatus && (
                    <InspectionAcceptance
                      inspectionId={inspection.id}
                      status={inspection.acceptanceStatus}
                      conformeCount={inspection.checklist.filter(i => i.completed).length}
                      naoConformeCount={inspection.checklist.filter(i => !i.completed).length}
                      acceptedAt={inspection.acceptedAt}
                      rejectedAt={inspection.rejectedAt}
                      rejectionReason={inspection.rejectionReason}
                      onAccept={handleAcceptInspection}
                      onReject={handleRejectInspection}
                    />
                  )}

                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-2xl">{inspection.title}</CardTitle>
                          <CardDescription>
                            {safeFormat(inspection.scheduledDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm")}
                          </CardDescription>
                        </div>
                        <StatusBadge status={inspection.status} size="lg" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{inspection.property} - Unidade {inspection.unit}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>Vistoriador: {inspection.inspector}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Duração estimada: 1 hora</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-medium">Descrição:</h3>
                          <p className="text-sm text-muted-foreground">{inspection.description}</p>
                        </div>
                      </div>
                      
                      {inspection.status === "complete" ? (
                        <div className="pt-4 border-t space-y-4">
                          <h3 className="font-bold text-lg flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-status-complete" />
                            Próximos Passos
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-status-complete/5 border border-status-complete/20 rounded-xl space-y-2">
                              <h4 className="font-bold text-sm">Aceite Digital</h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Se tudo estiver em ordem, realize o aceite digital para liberar o módulo de garantias e finalizar o processo.
                              </p>
                            </div>
                            <div className="p-4 bg-status-pending/5 border border-status-pending/20 rounded-xl space-y-2">
                              <h4 className="font-bold text-sm">Solicitar Ajustes</h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Caso identifique não conformidades, recuse a vistoria descrevendo os pontos para que nossa equipe técnica possa corrigi-los.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-4 border-t">
                          <h3 className="font-bold mb-3 flex items-center gap-2">
                            <Info className="h-4 w-4 text-primary" />
                            Preparação para a Vistoria
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-xs font-medium">Documento com foto</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-xs font-medium">Pontualidade</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-xs font-medium">Caneta e Papel</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={handleRequestReschedule} disabled={inspection.status === "complete"}>
                          Solicitar remarcação
                        </Button>
                        
                        {inspection.canStart && permissions.canStartInspection ? (
                          <Button onClick={() => handleStartInspection(inspection.id)}>
                            <ClipboardCheck className="h-4 w-4 mr-2" />
                            Iniciar Vistoria
                          </Button>
                        ) : inspection.canStart ? (
                          <GatedButton isAllowed={false} tooltipMessage="Aguarde a liberação para iniciar">
                            <ClipboardCheck className="h-4 w-4 mr-2" />
                            Iniciar Vistoria
                          </GatedButton>
                        ) : inspection.status !== "complete" ? (
                          <Button onClick={handleConfirmPresence}>
                            Confirmar presença
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="checklist" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Checklist da Vistoria</CardTitle>
                      <CardDescription>Itens que serão verificados durante a vistoria</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-muted">
                              <tr>
                                <th className="py-3 px-4 text-left">Item</th>
                                <th className="py-3 px-4 text-right w-24">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {inspection.checklist.map(item => (
                                <tr key={item.id}>
                                  <td className="py-3 px-4">{item.name}</td>
                                  <td className="py-3 px-4 text-right">
                                    <ChecklistBadge status={item.completed} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Este checklist é apenas informativo. Os itens serão verificados pelo vistoriador durante o processo.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {inspection.status === "complete" && (
                  <TabsContent value="report" className="space-y-4 pt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Relatório de Vistoria</CardTitle>
                        <CardDescription>Documentação completa com os resultados da vistoria</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="border rounded-md p-4 space-y-2">
                          <div className="flex items-start">
                            <FileText className="h-10 w-10 text-primary mr-3 mt-1" />
                            <div>
                              <h3 className="font-medium">Relatório de Vistoria - {inspection.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                Finalizado em {safeFormat(new Date(2025, 3, 10), "dd/MM/yyyy")}
                              </p>
                              <div className="mt-2">
                                <Button variant="outline" size="sm" onClick={handleViewPdf}>
                                  Visualizar PDF
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <h3 className="font-medium mb-2">Resumo</h3>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Vistoria realizada por:</span> {inspection.inspector}</p>
                            <p><span className="font-medium">Data da vistoria:</span> {safeFormat(inspection.scheduledDate, "dd/MM/yyyy")}</p>
                            <p><span className="font-medium">Total de itens verificados:</span> {inspection.checklist.length}</p>
                            <p><span className="font-medium">Itens conformes:</span> {inspection.checklist.filter(i => i.completed).length}</p>
                            <p><span className="font-medium">Itens não conformes:</span> {inspection.checklist.filter(i => !i.completed).length}</p>
                          </div>
                        </div>

                        {/* Acceptance status in report tab */}
                        {inspection.acceptanceStatus && (
                          <InspectionAcceptance
                            inspectionId={inspection.id}
                            status={inspection.acceptanceStatus}
                            conformeCount={inspection.checklist.filter(i => i.completed).length}
                            naoConformeCount={inspection.checklist.filter(i => !i.completed).length}
                            acceptedAt={inspection.acceptedAt}
                            rejectedAt={inspection.rejectedAt}
                            rejectionReason={inspection.rejectionReason}
                            onAccept={handleAcceptInspection}
                            onReject={handleRejectInspection}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            ) : (
              <Card className="h-full flex flex-col justify-center items-center py-12">
                <List className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Selecione uma vistoria</h3>
                <p className="text-muted-foreground max-w-md text-center mt-1">
                  Escolha uma vistoria na lista ao lado para ver os detalhes completos e o checklist de items
                </p>
              </Card>
            )}
          </div>
        </div>
      </FeatureGate>
      
      {/* Start Inspection Dialog */}
      {activeInspection && (
        <StartInspectionDialog
          open={startInspectionOpen}
          onOpenChange={setStartInspectionOpen}
          inspectionId={activeInspection}
          inspectionTitle={inspections.find(i => i.id === activeInspection)?.title || "Vistoria"}
          onComplete={handleInspectionComplete}
        />
      )}

      {scheduleDialogOpen && (
        <ScheduleInspectionDialog 
          triggerButton={<div className="hidden" />} 
          onSuccess={() => setScheduleDialogOpen(false)}
          clientId={clientId}
        />
      )}
    </div>
  );
};

export default ClientInspections;
