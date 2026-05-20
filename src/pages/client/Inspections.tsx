import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Calendar, ClipboardCheck, User, MapPin, List, CheckCircle, Clock, 
  FileText, Lock, Info, TrendingUp, AlertTriangle, Activity, 
  History, ArrowRight, ChevronRight, MessageSquare, ShieldCheck, PenTool
} from "lucide-react";
import { StatsCard } from "@/components/Shared/StatsCard";
import { ResponsiveGrid } from "@/components/Shared/ResponsiveGrid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/Shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { safeFormat } from "@/lib/utils";
import { DocumentPreviewDialog } from "@/components/Documents/DocumentPreviewDialog";
import { DigitalSignatureDialog } from "@/components/Documents/DigitalSignatureDialog";
import { documentService } from "@/services";
import { useToast } from "@/hooks";
import { useClientStage } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { inspectionService } from "@/services";
import { ClientTimeline } from "@/components/ClientFlow/ClientTimeline";
import { TimelineItem } from "@/types/clientFlow";
import { cn } from "@/lib/utils";

export default function ClientInspections() {
  const { user } = useAuth();
  const clientId = user?.id || "client-1";
  const { stage } = useClientStage(clientId);
  const { toast } = useToast();
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);
  const [inspections, setInspections] = useState<any[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  const loadInspections = () => {
    const raw = inspectionService.getAll().filter(i => i && i.client === (user?.name || "João Silva"));
    setInspections(raw.map(i => ({ 
      ...i, 
      title: i.type === 'keyDelivery' ? 'Entrega de Chaves' : 'Vistoria Técnica', 
      scheduledDate: i.date 
    })));
    if (raw.length > 0 && !selectedInspection) setSelectedInspection(raw[0].id);
  };

  useEffect(() => { loadInspections(); }, [user]);

  const inspection = useMemo(() => selectedInspection ? inspections.find(i => i.id === selectedInspection) : null, [selectedInspection, inspections]);

  const handleViewPdf = () => {
    if (selectedInspection) {
      const generated = documentService.generateDocument('inspection', {});
      setPreviewContent(generated.template || "");
      setIsPreviewOpen(true);
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

  return (
    <div className="container-responsive py-layout-gap space-y-layout-gap pb-20 animate-in fade-in duration-slow">
      <DocumentPreviewDialog 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        generatedContent={previewContent} 
        document={{ title: "Relatório de Vistoria", type: "auto" } as any} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-primary flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl shadow-sm border border-primary/20">
              <ClipboardCheck className="h-7 w-7" />
            </div>
            Vistorias Técnicas
          </h1>
          <p className="text-muted-foreground font-medium">Acompanhe seus agendamentos, laudos e status de aprovação da sua unidade.</p>
        </div>
        {(stage !== 'inspection_enabled' && stage !== 'warranty_enabled') && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200 animate-in slide-in-from-right-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800 font-bold leading-tight">Módulo aguardando liberação estratégica pela incorporadora.</p>
          </div>
        )}
      </div>

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
          label="SLA de Retorno" 
          value="48h" 
          icon={Clock} 
          variant="default" 
          className="rounded-[2rem] border-none shadow-sem-sm"
        />
      </ResponsiveGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-layout-gap">
        <div className="space-y-6">
          <ClientTimeline 
            timeline={timelineItems} 
            title="Evolução da Vistoria"
            description="Progresso técnico da sua entrega"
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

        <div className="lg:col-span-2 space-y-layout-gap">
          {inspection ? (
            <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden group bg-card/50 backdrop-blur-sm">
              <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent w-full" />
              <CardHeader className="relative -mt-12 px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-background rounded-2xl shadow-xl border border-border/50 text-primary group-hover:scale-110 transition-transform">
                      <ClipboardCheck className="h-8 w-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge 
                          status={inspection.status === 'complete' ? 'complete' : (inspection.status === 'confirmed' ? 'progress' : 'pending')} 
                          label={inspection.status === 'complete' ? 'Concluída' : (inspection.status === 'confirmed' ? 'Confirmada' : 'Aguardando')}
                        />
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-muted border-none">{inspection.type === 'keyDelivery' ? 'Entrega de Chaves' : 'Vistoria de Unidade'}</Badge>
                      </div>
                      <CardTitle className="text-2xl font-black tracking-tight">{inspection.title} - {inspection.unit}</CardTitle>
                      <CardDescription className="font-bold flex items-center gap-1.5 mt-1">
                        <MapPin size={14} className="text-primary" /> {inspection.property}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Data Agendada</p>
                    <p className="text-xl font-black text-foreground">{safeFormat(inspection.scheduledDate, "dd/MM/yyyy")}</p>
                    <p className="text-sm font-bold text-primary">{inspection.time}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8 pt-6">
                <Separator className="mb-8 opacity-50" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Responsáveis</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-black text-xs text-muted-foreground">TP</div>
                      <div>
                        <p className="text-sm font-black">Técnico Responsável</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{inspection.technician || "Engenheiro A2"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ações Estratégicas</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="rounded-xl font-bold h-9 gap-2" onClick={handleViewPdf}>
                        <FileText size={14} className="text-primary" /> Ver Laudo Técnico
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-xl font-bold h-9 gap-2 text-primary hover:bg-primary/5">
                        <MessageSquare size={14} /> Falar com Suporte
                      </Button>
                    </div>
                  </div>
                </div>

                {inspection.status === 'complete' && !inspection.signed && (
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl text-primary"><PenTool size={24} /></div>
                      <div>
                        <h5 className="text-sm font-black">Assinatura do Termo Pendente</h5>
                        <p className="text-xs text-muted-foreground font-medium">Formalize o recebimento do laudo técnico com segurança digital.</p>
                      </div>
                    </div>
                    <Button className="rounded-xl font-black uppercase tracking-widest text-[10px] px-8 h-11 shadow-lg shadow-primary/20">Assinar Agora</Button>
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
    </div>
  );
}
