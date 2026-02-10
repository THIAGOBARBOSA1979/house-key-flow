
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ClipboardCheck, User, MapPin, List, CheckCircle, Clock, FileText, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { StartInspectionDialog } from "@/components/Inspection/StartInspectionDialog";
import { useToast } from "@/hooks/use-toast";
import { FeatureGate, GatedButton } from "@/components/ClientFlow/FeatureGate";
import { useClientStage } from "@/hooks/useClientStage";
import { InspectionAcceptance } from "@/components/Inspection/InspectionAcceptance";
import { InspectionAcceptanceStatus } from "@/types/clientFlow";
import { eventAutomationService } from "@/services/EventAutomationService";

// Mock data
const initialInspections = [
  {
    id: "1",
    title: "Vistoria de Pré-entrega",
    property: "Edifício Aurora",
    unit: "204",
    scheduledDate: new Date(2025, 4, 15, 10, 0),
    status: "pending" as const,
    inspector: "Carlos Andrade",
    description: "Vistoria para verificação das condições da unidade antes da entrega oficial.",
    checklist: [
      { id: "1", name: "Verificação de paredes e pinturas", completed: false },
      { id: "2", name: "Teste de instalações elétricas", completed: false },
      { id: "3", name: "Teste de instalações hidráulicas", completed: false },
      { id: "4", name: "Verificação de esquadrias e vidros", completed: false },
      { id: "5", name: "Verificação de pisos e revestimentos", completed: false },
    ],
    canStart: true,
    acceptanceStatus: undefined as InspectionAcceptanceStatus | undefined,
    acceptedAt: undefined as Date | undefined,
    rejectedAt: undefined as Date | undefined,
    rejectionReason: undefined as string | undefined,
  },
  {
    id: "2",
    title: "Entrega de Chaves",
    property: "Edifício Aurora",
    unit: "204",
    scheduledDate: new Date(2025, 4, 20, 14, 30),
    status: "pending" as const,
    inspector: "Luiza Mendes",
    description: "Vistoria final e entrega oficial das chaves do imóvel.",
    checklist: [
      { id: "1", name: "Verificação final de acabamentos", completed: false },
      { id: "2", name: "Conferência de documentação", completed: false },
      { id: "3", name: "Demonstração de funcionamento de equipamentos", completed: false },
      { id: "4", name: "Entrega de manuais e garantias", completed: false },
      { id: "5", name: "Assinatura de termo de recebimento", completed: false },
    ],
    canStart: false,
    acceptanceStatus: undefined as InspectionAcceptanceStatus | undefined,
    acceptedAt: undefined as Date | undefined,
    rejectedAt: undefined as Date | undefined,
    rejectionReason: undefined as string | undefined,
  },
  {
    id: "3",
    title: "Vistoria de Reparo",
    property: "Edifício Aurora",
    unit: "204",
    scheduledDate: new Date(2025, 3, 10, 9, 0),
    status: "complete" as const,
    inspector: "Roberto Santos",
    description: "Vistoria para verificar a correção dos itens identificados na vistoria anterior.",
    checklist: [
      { id: "1", name: "Verificação do reparo da infiltração no banheiro", completed: true },
      { id: "2", name: "Verificação do reparo da maçaneta da porta", completed: true },
    ],
    canStart: false,
    report: "https://example.com/report.pdf",
    acceptanceStatus: "pending_acceptance" as InspectionAcceptanceStatus | undefined,
    acceptedAt: undefined as Date | undefined,
    rejectedAt: undefined as Date | undefined,
    rejectionReason: undefined as string | undefined,
  }
];

// Helper component for the checklist status badges
const ChecklistBadge = ({ status }: { status: boolean }) => {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      status 
        ? "bg-green-100 text-green-800" 
        : "bg-amber-100 text-amber-800"
    }`}>
      {status ? "Concluído" : "Pendente"}
    </span>
  );
};

const ClientInspections = () => {
  const [inspections, setInspections] = useState(initialInspections);
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);
  const [startInspectionOpen, setStartInspectionOpen] = useState(false);
  const [activeInspection, setActiveInspection] = useState<string | null>(null);
  const { toast } = useToast();
  
  const clientId = "client-1";
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
    toast({ title: "Presença confirmada", description: "Obrigado por confirmar sua presença na vistoria." });
  };

  const handleRequestReschedule = () => {
    toast({ title: "Solicitação de remarcação enviada", description: "Em breve entraremos em contato para agendar uma nova data." });
  };

  const handleContactTeam = () => {
    toast({ title: "Mensagem enviada", description: "Nossa equipe receberá sua mensagem e entrará em contato em breve." });
  };

  const handleViewPdf = () => {
    toast({ title: "Abrindo documento", description: "O relatório em PDF será aberto em uma nova aba." });
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
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8" />
            Minhas Vistorias
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe as vistorias agendadas para o seu imóvel
          </p>
        </div>
        
        {canScheduleInspection ? (
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Agendar Vistoria
          </Button>
        ) : (
          <GatedButton isAllowed={false} tooltipMessage="Agendar vistorias será liberado em breve">
            <Calendar className="mr-2 h-4 w-4" />
            Agendar Vistoria
          </GatedButton>
        )}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inspections list */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vistorias Agendadas</CardTitle>
                <CardDescription>Selecione uma vistoria para ver detalhes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {inspections.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedInspection === item.id ? "border-primary bg-primary/5" : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedInspection(item.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{item.title}</h3>
                      <div className="flex items-center gap-1.5">
                        {item.acceptanceStatus === "pending_acceptance" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">Aceite pendente</span>
                        )}
                        {item.acceptanceStatus === "accepted" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">Aceita</span>
                        )}
                        {item.acceptanceStatus === "rejected" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800">Recusada</span>
                        )}
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(item.scheduledDate, "dd/MM/yyyy 'às' HH:mm")}</span>
                    </div>
                  </div>
                ))}
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
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="checklist">Checklist</TabsTrigger>
                  {inspection.status === "complete" && (
                    <TabsTrigger value="report">Relatório</TabsTrigger>
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
                            {format(inspection.scheduledDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm")}
                          </CardDescription>
                        </div>
                        <StatusBadge status={inspection.status} />
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
                      
                      {inspection.status !== "complete" && (
                        <div className="pt-2 border-t">
                          <h3 className="font-medium mb-2">Próximos passos:</h3>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Compareça no horário agendado</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Traga um documento com foto</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Anote todas as observações durante a vistoria</span>
                            </li>
                          </ul>
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
                                Finalizado em {format(new Date(2025, 3, 10), "dd/MM/yyyy")}
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
                            <p><span className="font-medium">Data da vistoria:</span> {format(inspection.scheduledDate, "dd/MM/yyyy")}</p>
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
    </div>
  );
};

export default ClientInspections;
