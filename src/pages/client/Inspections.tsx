import { useState, useMemo, useEffect } from "react";
import { ErrorView } from "@/components/shared/ErrorView";
import { propertyService } from "@/services/operations/PropertyService";

import { Button } from "@/components/ui/button";
import { 
  Calendar, ClipboardCheck, User, MapPin, List, CheckCircle, Clock, 
  FileText, Lock, Info, TrendingUp, AlertTriangle, Activity, 
  History, ArrowRight, ChevronRight, MessageSquare, ShieldCheck, PenTool
} from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { safeFormat } from "@/lib/utils";
import { DocumentPreviewDialog } from "@/components/documents/DocumentPreviewDialog";
import { DigitalSignatureDialog } from "@/components/documents/DigitalSignatureDialog";
import { documentService } from "@/services";
import { useToast } from "@/hooks";
import { useClientStage } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { inspectionService } from "@/services";
import { ClientTimeline } from "@/components/ClientFlow/ClientTimeline";
import { TimelineItem } from "@/types/clientFlow";
import { cn } from "@/lib/utils";
import { FeatureGate } from "@/components/ClientFlow/FeatureGate";

export default function ClientInspections() {
  const { user } = useAuth();
  const clientId = user?.id || "client-1";
  const { profile, stage, isLoading, canScheduleInspection } = useClientStage(clientId);
  const { toast } = useToast();
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);
  const [inspections, setInspections] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");


  const loadInspections = () => {
    try {
      setError(null);
      const raw = inspectionService.getAll().filter(i => i && i.client === (user?.name || "João Silva"));
      setInspections(raw.map(i => ({ 
        ...i, 
        title: i.type === 'keyDelivery' ? 'Entrega de Chaves' : 'Vistoria Técnica', 
        scheduledDate: i.date 
      })));
      if (raw.length > 0 && !selectedInspection) setSelectedInspection(raw[0].id);
    } catch (err) {
      setError("Falha ao carregar vistorias.");
    }
  };


  useEffect(() => { loadInspections(); }, [user]);

  const inspection = useMemo(() => selectedInspection ? inspections.find(i => i.id === selectedInspection) : null, [selectedInspection, inspections]);

  const handleViewPdf = async () => {
    if (selectedInspection) {
      const generated = await documentService.generateDocument('inspection', {});
      if (generated) {
        setPreviewContent(generated.template || "");
        setIsPreviewOpen(true);
      }
    }
  };


  const handleOpenSignature = () => {
    setIsSignatureOpen(true);
  };

  const timelineItems: TimelineItem[] = [
    { id: '1', title: 'Agendamento Confirmado', date: inspection?.scheduledDate, status: 'completed', eventType: 'inspection_scheduled' },
    { id: '2', title: 'Realização da Vistoria', status: inspection?.status === 'complete' ? 'completed' : 'current', eventType: 'inspection_completed' },
    { id: '3', title: 'Assinatura do Termo', status: inspection?.signed ? 'completed' : 'pending', eventType: 'inspection_approved' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-responsive py-20">
        <ErrorView message={error} onRetry={loadInspections} fullScreen />
      </div>
    );
  }

  return (

    <div className="container-responsive py-layout-gap space-y-layout-gap pb-20 md:pb-6 animate-in fade-in duration-slow">
      <DigitalSignatureDialog
        isOpen={isSignatureOpen}
        onClose={() => setIsSignatureOpen(false)}
        documentId={selectedInspection || "insp-1"}
        documentTitle={`Relatório de Vistoria - ${inspection?.unit || ''}`}
      />
      <DocumentPreviewDialog 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        generatedContent={previewContent} 
        document={{ title: "Relatório de Vistoria", type: "auto" } as any} 
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Controle de Qualidade • ABNT</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
            Vistorias & Entrega <span className="text-primary">.</span>
          </h1>
        </div>
      </div>

      <FeatureGate
        isAllowed={canScheduleInspection}
        requiredStage="inspection_enabled"
        featureName="O módulo de vistorias"
        message="Aguardando liberação estratégica pela incorporadora para agendamento técnico da unidade."
        redirectTo="/client"
        redirectLabel="Voltar para Dashboard"
      >


      <ResponsiveGrid columns={4} gap="layout">
        <StatsCard 
          label="Realizadas" 
          value={inspections.filter(i => i.status === 'complete').length} 
          icon={CheckCircle} 
          variant="complete" 
          className="rounded-[2rem] border-none shadow-sem-sm"
        />
        <StatsCard 
          label="Agendadas" 
          value={inspections.filter(i => i.status === 'pending' || i.status === 'confirmed').length} 
          icon={Calendar} 
          variant="progress" 
          className="rounded-[2rem] border-none shadow-sem-sm"
        />
        <StatsCard 
          label="Documentos" 
          value={inspections.filter(i => i.status === 'complete').length} 
          icon={FileText} 
          variant="brand" 
          className="rounded-[2rem] border-none shadow-sem-sm"
        />
        <StatsCard 
          label="SLA de Análise Técnica" 
          value="48h" 
          icon={Clock} 
          variant="default" 
          className="rounded-[2rem] border-none shadow-sem-sm"
        />

      </ResponsiveGrid>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-layout-gap">
        <div className="lg:col-span-4 space-y-layout-gap">
          <ClientTimeline 
            timeline={timelineItems} 
            title="Evolução Técnica"
            description="Progresso da entrega da unidade"
          />
          
          <Card className="rounded-[2rem] border-none shadow-xl bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Info className="h-4 w-4" /> Dicas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-black">1</span></div>
                <p className="text-xs text-muted-foreground font-medium">Traga fita crepe para marcar pequenos detalhes de acabamento.</p>
              </div>
              <div className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-black">2</span></div>
                <p className="text-xs text-muted-foreground font-medium">A vistoria dura em média 45 a 60 minutos por unidade.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-layout-gap">
          {inspection ? (
            <Card className="rounded-[3rem] border-none shadow-sem-lg overflow-hidden group bg-white/70 backdrop-blur-md">
              <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent w-full relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
              </div>
              <CardHeader className="relative -mt-16 px-8 sm:px-10 pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-white rounded-[2rem] shadow-sem-lg border border-border/50 text-primary group-hover:scale-110 transition-transform duration-500">
                      <ClipboardCheck className="h-10 w-10" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <StatusBadge 
                          status={inspection.status === 'complete' ? 'complete' : (inspection.status === 'confirmed' ? 'progress' : 'pending')} 
                          label={inspection.status === 'complete' ? 'Protocolo Concluído' : (inspection.status === 'confirmed' ? 'Visita Confirmada' : 'Aguardando')}
                        />
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/10 h-6 px-3">{inspection.type === 'keyDelivery' ? 'Entrega de Chaves' : 'Vistoria Técnica ABNT'}</Badge>
                      </div>
                      <CardTitle className="text-3xl font-black tracking-tight leading-tight">{inspection.title} <span className="text-primary">•</span> {inspection.unit}</CardTitle>
                      <CardDescription className="font-bold flex items-center gap-2 mt-2 text-muted-foreground/80">
                        <MapPin size={16} className="text-primary" /> {inspection.property} {profile?.propertyId && propertyService.getById(profile.propertyId)?.location && ` • ${propertyService.getById(profile.propertyId)?.location}`}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="bg-primary text-white p-6 rounded-[2rem] shadow-xl shadow-primary/20 min-w-[160px] text-center transform group-hover:translate-y-[-5px] transition-transform duration-500">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Agenda Técnica</p>
                    <p className="text-2xl font-black tracking-tighter">{safeFormat(inspection.scheduledDate, "dd/MM/yyyy")}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-1 bg-white/20 rounded-full py-1">
                       <Clock size={12} strokeWidth={3} />
                       <p className="text-xs font-black">{inspection.time}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-8 sm:px-10 pb-10 pt-6">
                <Separator className="mb-10 opacity-40" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 border-l-4 border-primary pl-3">Equipe Técnica</h4>
                    <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-2xl border border-border/5 group/tech">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center font-black text-lg text-primary shadow-sm border border-border/50 group-hover/tech:scale-105 transition-transform duration-500">
                        {inspection.technician?.split(' ').map((n: string) => n[0]).join('') || "A2"}
                      </div>
                      <div>
                        <p className="text-base font-black text-foreground/90">{inspection.technician || "Engenheiro A2"}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">Responsável pela Homologação</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 border-l-4 border-emerald-500 pl-3">Ações de Conformidade</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-6 border-2 border-primary/10 hover:border-primary hover:bg-primary/5 transition-all shadow-sm" onClick={handleViewPdf}>
                        <FileText size={16} className="text-primary mr-2" strokeWidth={2.5} /> Laudo Técnico PDF
                      </Button>
                      <Button variant="ghost" className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-6 text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20">
                        <MessageSquare size={16} className="mr-2" strokeWidth={2.5} /> Consultar Suporte
                      </Button>
                    </div>
                  </div>
                </div>

                {inspection.status === 'complete' && !inspection.signed && (
                  <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-emerald-500/5 border-2 border-primary/20 rounded-[2.5rem] p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 animate-in zoom-in-95 duration-700 shadow-xl shadow-primary/5 relative overflow-hidden group/sign">
                    <div className="absolute right-[-2%] top-[-10%] opacity-5 pointer-events-none group-hover/sign:rotate-12 transition-transform duration-1000">
                      <PenTool size={120} />
                    </div>
                    <div className="flex items-center gap-6 relative z-10">
                      <div className="p-5 bg-primary text-white rounded-[1.5rem] shadow-xl shadow-primary/30 group-hover/sign:scale-110 group-hover/sign:rotate-3 transition-all duration-500">
                         <PenTool size={32} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h5 className="text-xl font-black tracking-tight text-foreground">Assinatura do Termo Pendente</h5>
                        <p className="text-sm text-muted-foreground font-bold leading-relaxed mt-1">Formalize o recebimento do laudo técnico com validade jurídica e segurança digital.</p>
                      </div>
                    </div>
                    <Button 
                      className="rounded-2xl font-black uppercase tracking-widest text-[11px] px-12 h-14 shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all w-full lg:w-auto relative z-10"
                      onClick={handleOpenSignature}
                    >
                      Assinar Protocolo Digital
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex flex-col items-center justify-center p-20 text-center border-dashed border-2 rounded-[2rem] bg-muted/5">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <ClipboardCheck className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-black text-muted-foreground tracking-tight">Nenhuma vistoria localizada</h3>
              <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto mt-2 font-medium">Assim que sua unidade estiver pronta para a entrega técnica, você será notificado para realizar o agendamento.</p>
            </Card>
          )}
        </div>
      </div>
      </FeatureGate>
    </div>
  );
}
