import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  Calendar, ClipboardCheck, User, MapPin, List, CheckCircle, Clock, 
  FileText, Lock, Info, TrendingUp, AlertTriangle, Activity, 
  History, ArrowRight, ChevronRight, MessageSquare, ShieldCheck
} from "lucide-react";
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
import { ClientTimeline, TimelineStep } from "@/components/client/ClientTimeline";
import { cn } from "@/lib/utils";

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
  const clientId = user?.id || "client-1";
  const { stage } = useClientStage(clientId);
  const { toast } = useToast();
  
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);
  const [inspections, setInspections] = useState<any[]>([]);
  const [startInspectionOpen, setStartInspectionOpen] = useState(false);
  const [activeInspection, setActiveInspection] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);

  const canScheduleInspection = stage === 'inspection_enabled' || stage === 'warranty_enabled';
  const permissions = {
    canStartInspection: user?.role === 'admin'
  };

  const loadInspections = () => {
    const rawInspections = inspectionService.getAll()
      .filter(i => i.client === (user?.name || "João Silva"));
    
    const formatted = rawInspections.map(i => {
      let checklistItems = [
        { id: "1", name: "Verificação de paredes e pinturas", completed: i.status === 'complete' },
        { id: "2", name: "Teste de esquadrias e vidros", completed: i.status === 'complete' },
        { id: "3", name: "Teste de tomadas e pontos elétricos", completed: i.status === 'complete' },
        { id: "4", name: "Verificação de revestimentos e pisos", completed: i.status === 'complete' },
        { id: "5", name: "Teste de metais e louças sanitárias", completed: i.status === 'complete' }
      ];

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

    setInspections(formatted);
    if (formatted.length > 0 && !selectedInspection) {
      setSelectedInspection(formatted[0].id);
    }
  };

  useEffect(() => {
    loadInspections();
  }, [user]);

  const inspection = useMemo(() => 
    selectedInspection 
      ? inspections.find(i => i.id === selectedInspection) 
      : null, 
    [selectedInspection, inspections]
  );

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
        loadInspections();
      }
    }
  };
  
  const handleRequestReschedule = () => {
    if (selectedInspection && user?.id) {
      setRescheduleDialogOpen(true);
    }
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

  const handleAcceptInspection = (inspectionId: string, signatureData: { method: string, evidence: any }) => {
    // Register signature in service
    inspectionService.signAcceptance(inspectionId, clientId, signatureData);
    
    setInspections(prev => prev.map(i => 
      i.id === inspectionId 
        ? { ...i, acceptanceStatus: "accepted" as InspectionAcceptanceStatus, acceptedAt: new Date(), signatureMethod: signatureData.method }
        : i
    ));
    eventAutomationService.onInspectionAccepted(inspectionId, clientId);
    
    toast({ title: "Vistoria aceita", description: "O termo de aceite foi assinado e registrado com sucesso." });
  };

  const handleRejectInspection = (inspectionId: string, reason: string) => {
    setInspections(prev => prev.map(i => 
      i.id === inspectionId 
        ? { ...i, acceptanceStatus: "rejected" as InspectionAcceptanceStatus, rejectedAt: new Date(), rejectionReason: reason }
        : i
    ));
    eventAutomationService.onInspectionRejected(inspectionId, clientId, reason);
    
    toast({ title: "Vistoria não aceita", description: "Sua contestação foi registrada e será analisada pela equipe técnica.", variant: "destructive" });
  };

  const inspectionSteps: TimelineStep[] = useMemo(() => [
    { id: '1', title: 'Agendamento', description: 'Escolha da data e horário para a visita.', status: 'completed' },
    { id: '2', title: 'Confirmação', description: 'Validação da presença do proprietário.', status: (inspection?.status === 'pending' || !inspection) ? 'current' : 'completed' },
    { id: '3', title: 'Vistoria em Campo', description: 'Verificação física dos itens da unidade.', status: inspection?.status === 'progress' ? 'current' : (inspection?.status === 'complete' ? 'completed' : 'pending') },
    { id: '4', title: 'Relatório & Aceite', description: 'Assinatura digital do termo de vistoria.', status: (inspection?.status === 'complete' && !inspection.acceptanceStatus) ? 'current' : (inspection?.acceptanceStatus === 'accepted' ? 'completed' : 'pending') },
  ], [inspection]);

  return (
    <div className="space-y-layout-gap pb-20 md:pb-6 animate-in fade-in duration-slow">
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
          onSuccess={loadInspections}
        />
      )}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl shadow-sm border border-primary/20">
              <ClipboardCheck className="h-8 w-8" />
            </div>
            Vistorias do Imóvel
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Gerencie seus agendamentos e acompanhe o checklist de entrega da sua unidade.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {canScheduleInspection ? (
            <ScheduleInspectionDialog 
              triggerButton={
                <Button className="h-11 rounded-xl font-black uppercase tracking-widest text-[11px] px-6 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar Nova Vistoria
                </Button>
              }
              onSuccess={loadInspections}
              clientId={clientId}
            />
          ) : (
            <GatedButton isAllowed={false} tooltipMessage="Agendar vistorias será liberado em breve">
              <Calendar className="mr-2 h-4 w-4" />
              Agendar Vistoria
            </GatedButton>
          )}
        </div>
      </div>

      <FeatureGate isAllowed={canScheduleInspection} requiredStage="inspection_enabled" variant="overlay">
        <ResponsiveGrid columns={4} gap="layout">
          <StatsCard label="Total Realizadas" value={inspections.filter(i => i.status === 'complete').length} icon={CheckCircle} variant="complete" />
          <StatsCard label="Agendadas" value={inspections.filter(i => i.status === 'pending').length} icon={Calendar} variant="brand" />
          <StatsCard label="Em Andamento" value={inspections.filter(i => i.status === 'progress').length} icon={Clock} variant="pending" />
          <StatsCard label="Taxa de Aprovação" value="100%" icon={TrendingUp} variant="brand" />
        </ResponsiveGrid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-layout-gap mt-6">
          <div className="space-y-layout-gap">
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 pb-4 p-6 border-b border-border/10">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Sua Jornada
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-6">
                <ClientTimeline steps={inspectionSteps} />
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <List className="h-5 w-5 text-primary" />
                  Lista de Vistorias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6 pt-2">
                {inspections.filter(i => i.status !== 'complete').length > 0 ? (
                  inspections.filter(i => i.status !== 'complete').map((item) => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "p-4 border rounded-2xl cursor-pointer transition-all duration-300 group hover:shadow-md relative",
                        selectedInspection === item.id 
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                          : "hover:bg-accent/50 border-border/50"
                      )}
                      onClick={() => setSelectedInspection(item.id)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold truncate text-foreground/90 group-hover:text-primary transition-colors">{item.title}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                              {safeFormat(item.scheduledDate, "dd/MM/yyyy")}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      {item.status === 'pending' && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[8px] h-4 bg-blue-50 text-blue-600 border-blue-200">
                             Presença Confirmada
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 px-4 bg-muted/20 rounded-2xl border border-dashed flex flex-col items-center">
                    <ClipboardCheck className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-bold text-muted-foreground">Nenhum agendamento pendente</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Histórico de Vistorias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6 pt-2">
                {inspections.filter(i => i.status === 'complete').length > 0 ? (
                  inspections.filter(i => i.status === 'complete').map((item) => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "p-4 border rounded-2xl cursor-pointer transition-all duration-300 group hover:shadow-md",
                        selectedInspection === item.id 
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                          : "hover:bg-accent/50 border-border/50"
                      )}
                      onClick={() => setSelectedInspection(item.id)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold truncate text-foreground/90 group-hover:text-primary transition-colors">{item.title}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                              {safeFormat(item.scheduledDate, "dd/MM/yyyy")}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 px-4 bg-muted/20 rounded-2xl border border-dashed">
                    <p className="text-xs font-bold text-muted-foreground">Nenhuma vistoria finalizada</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-xl rounded-[2rem] overflow-hidden group">
              <CardHeader className="bg-primary/5 pb-4 border-b border-border/10 p-6">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">Precisa de suporte?</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Caso tenha dúvidas sobre o agendamento ou o processo de vistoria, entre em contato com nossa equipe de suporte.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <Button variant="outline" className="w-full rounded-xl font-bold gap-2 h-11 border-primary/20 hover:bg-primary/5" asChild>
                    <a href="/client/support">
                      <MessageSquare size={16} className="text-primary" /> Abrir Chamado de Suporte
                    </a>
                  </Button>
                  <Button variant="default" className="w-full rounded-xl font-bold gap-2 h-11 shadow-md" asChild>
                    <a href="/client/warranty">
                      <ShieldCheck size={16} /> Abrir Chamado de Garantia
                    </a>
                  </Button>
                  {selectedInspection && inspection?.status === 'complete' && (
                    <Button 
                      variant="secondary" 
                      className="w-full rounded-xl font-bold gap-2 h-11 bg-amber-100 text-amber-700 hover:bg-amber-200"
                      onClick={() => {
                        window.location.href = `/client/warranty?inspectionId=${selectedInspection}`;
                      }}
                    >
                      <AlertTriangle size={16} /> Reportar Defeito na Vistoria
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            {inspection ? (
              <Tabs defaultValue="all_inspections" className="animate-in fade-in slide-in-from-right-4 duration-slow">
                <TabsList className="bg-muted/50 p-1 rounded-2xl w-full grid grid-cols-4">
                  <TabsTrigger value="all_inspections" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">Ações</TabsTrigger>
                  <TabsTrigger value="details" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">Detalhes</TabsTrigger>
                  <TabsTrigger value="checklist" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">Checklist</TabsTrigger>
                  <TabsTrigger 
                    value="report" 
                    className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest"
                    disabled={inspection.status !== 'complete'}
                  >
                    Relatório
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all_inspections" className="space-y-4 pt-4">
                  {inspection.status === 'pending' && (
                    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-primary/5">
                      <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xl font-black flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          Próxima Vistoria
                        </CardTitle>
                        <CardDescription className="font-medium">Confirme sua presença ou solicite alteração.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-8 pt-0 flex flex-col sm:flex-row gap-4">
                        <Button className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[11px]" onClick={handleConfirmPresence}>
                          Confirmar Presença
                        </Button>
                        <Button variant="outline" className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[11px]" onClick={handleRequestReschedule}>
                          Solicitar Reagendamento
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {inspection.status === 'reschedule_requested' && (
                    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-amber-50">
                      <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xl font-black text-amber-700 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Reagendamento Solicitado
                        </CardTitle>
                        <CardDescription className="text-amber-600 font-medium">Nossa equipe está analisando sua proposta de nova data.</CardDescription>
                      </CardHeader>
                    </Card>
                  )}

                  {inspection.status === 'complete' && !inspection.acceptanceStatus && (
                    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-indigo-50">
                      <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xl font-black text-indigo-700 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Vistoria Finalizada
                        </CardTitle>
                        <CardDescription className="text-indigo-600 font-medium">Por favor, assine o termo de aceite para liberar as chaves e garantia.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-8 pt-0">
                        <InspectionAcceptance
                          inspectionId={inspection.id}
                          status="pending_acceptance"
                          conformeCount={inspection.checklist.filter((i: any) => i.completed).length}
                          naoConformeCount={inspection.checklist.filter((i: any) => !i.completed).length}
                          onAccept={handleAcceptInspection}
                          onReject={handleRejectInspection}
                        />
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4 pt-4">
                  {inspection.status === "complete" && inspection.acceptanceStatus && (
                    <InspectionAcceptance
                      inspectionId={inspection.id}
                      status={inspection.acceptanceStatus}
                      conformeCount={inspection.checklist.filter((i: any) => i.completed).length}
                      naoConformeCount={inspection.checklist.filter((i: any) => !i.completed).length}
                      acceptedAt={inspection.acceptedAt}
                      rejectedAt={inspection.rejectedAt}
                      rejectionReason={inspection.rejectionReason}
                      onAccept={handleAcceptInspection}
                      onReject={handleRejectInspection}
                    />
                  )}

                  <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-2xl font-black tracking-tight">{inspection.title}</CardTitle>
                          <CardDescription className="font-medium mt-1">
                            {safeFormat(inspection.scheduledDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm")}
                          </CardDescription>
                        </div>
                        <StatusBadge status={inspection.status} size="lg" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 text-sm font-medium">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              <MapPin className="h-4 w-4" />
                            </div>
                            <span>{inspection.property} - Unidade {inspection.unit}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm font-medium">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              <User className="h-4 w-4" />
                            </div>
                            <span>Vistoriador: {inspection.inspector}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm font-medium">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              <Clock className="h-4 w-4" />
                            </div>
                            <span>Duração estimada: 1 hora</span>
                          </div>
                        </div>
                        <div className="p-6 bg-muted/30 rounded-2xl border border-dashed border-border/50">
                          <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground/60 mb-2">Descrição:</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed italic">{inspection.description}</p>
                        </div>
                      </div>
                      
                      {inspection.status === "complete" ? (
                        <div className="pt-8 border-t space-y-6">
                          <h3 className="font-black text-xl flex items-center gap-2 tracking-tight">
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                            Próximos Passos
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2 group hover:bg-emerald-100/50 transition-colors">
                              <h4 className="font-black text-sm uppercase tracking-widest text-emerald-700">Aceite Digital</h4>
                              <p className="text-xs text-emerald-600/80 leading-relaxed font-medium">
                                Se tudo estiver em ordem, realize o aceite digital para liberar o módulo de garantias e finalizar o processo.
                              </p>
                            </div>
                            <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl space-y-2 group hover:bg-amber-100/50 transition-colors">
                              <h4 className="font-black text-sm uppercase tracking-widest text-amber-700">Solicitar Ajustes</h4>
                              <p className="text-xs text-amber-600/80 leading-relaxed font-medium">
                                Caso identifique não conformidades, recuse a vistoria descrevendo os pontos para correção.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-8 border-t">
                          <h3 className="font-black text-lg mb-4 flex items-center gap-2 tracking-tight">
                            <Info className="h-5 w-5 text-primary" />
                            Orientações Importantes
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              <span className="text-xs font-bold uppercase tracking-widest">Documento com foto</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              <span className="text-xs font-bold uppercase tracking-widest">Pontualidade</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              <span className="text-xs font-bold uppercase tracking-widest">Disponibilidade</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-8 border-t gap-4 flex-wrap">
                        <Button variant="outline" className="h-12 px-6 rounded-xl font-bold border-primary/20" onClick={handleRequestReschedule} disabled={inspection.status === "complete"}>
                          Solicitar reagendamento
                        </Button>
                        
                        {inspection.status !== "complete" && (
                          <Button onClick={handleConfirmPresence} className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20">
                            Confirmar Presença
                          </Button>
                        )}
                        
                        {permissions.canStartInspection && (
                          <Button onClick={() => handleStartInspection(inspection.id)} className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg">
                            <ClipboardCheck className="h-4 w-4 mr-2" />
                            Iniciar Vistoria (Admin)
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="checklist" className="space-y-4 pt-4">
                  <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-2xl font-black tracking-tight">Itens de Verificação</CardTitle>
                      <CardDescription className="font-medium mt-1">Checklist completo para inspeção da unidade</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-2">
                      <div className="border rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full">
                          <thead className="bg-primary/5">
                            <tr>
                              <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Item</th>
                              <th className="py-4 px-6 text-right w-32 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {inspection.checklist.map((item: any) => (
                              <tr key={item.id} className="hover:bg-muted/5 transition-colors">
                                <td className="py-4 px-6 text-sm font-bold text-foreground/80">{item.name}</td>
                                <td className="py-4 px-6 text-right">
                                  <ChecklistBadge status={item.completed} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-6 p-4 bg-muted/30 rounded-2xl border border-dashed flex items-center gap-3">
                        <Info className="h-5 w-5 text-primary/60" />
                        <p className="text-xs text-muted-foreground font-medium italic">
                          Este checklist é preenchido pelo nosso vistoriador técnico durante a visita física à unidade.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="report" className="space-y-4 pt-4">
                  <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-2xl font-black tracking-tight">Relatório Final</CardTitle>
                      <CardDescription className="font-medium mt-1">Documentação técnica consolidada pós-vistoria</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-2 space-y-6">
                      <div className="bg-gradient-to-r from-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-white rounded-2xl shadow-sm border border-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <FileText className="h-8 w-8" />
                          </div>
                          <div>
                            <h3 className="font-black text-lg tracking-tight">Termo de Vistoria Consolidado</h3>
                            <p className="text-xs text-muted-foreground font-medium">Finalizado em {safeFormat(inspection.scheduledDate, "dd/MM/yyyy")}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleViewPdf} className="h-10 px-6 rounded-xl font-bold border-primary/20 hover:bg-primary hover:text-white transition-all">
                          Visualizar PDF
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="p-6 border rounded-2xl space-y-1 bg-muted/10">
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Itens Verificados</span>
                           <p className="text-2xl font-black text-primary">{inspection.checklist.length}</p>
                        </div>
                        <div className="p-6 border rounded-2xl space-y-1 bg-muted/10">
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Conformidade</span>
                           <p className="text-2xl font-black text-emerald-600">{Math.round((inspection.checklist.filter((i:any) => i.completed).length / inspection.checklist.length) * 100)}%</p>
                        </div>
                      </div>

                      {inspection.acceptanceStatus && (
                        <div className="mt-8">
                          <InspectionAcceptance
                            inspectionId={inspection.id}
                            status={inspection.acceptanceStatus}
                            conformeCount={inspection.checklist.filter((i: any) => i.completed).length}
                            naoConformeCount={inspection.checklist.filter((i: any) => !i.completed).length}
                            acceptedAt={inspection.acceptedAt}
                            rejectedAt={inspection.rejectedAt}
                            rejectionReason={inspection.rejectionReason}
                            onAccept={handleAcceptInspection}
                            onReject={handleRejectInspection}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="h-full flex flex-col justify-center items-center py-20 bg-muted/10 border-none shadow-none rounded-[2rem]">
                <div className="p-6 bg-white rounded-full shadow-sm mb-6">
                  <ClipboardCheck className="h-12 w-12 text-primary/20" />
                </div>
                <h3 className="text-xl font-black tracking-tight text-foreground/80">Selecione uma vistoria</h3>
                <p className="text-muted-foreground max-w-xs text-center mt-2 font-medium">
                  Escolha uma vistoria na lista ao lado para ver os detalhes, checklist e relatórios.
                </p>
              </Card>
            )}
          </div>
        </div>
      </FeatureGate>
      
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
