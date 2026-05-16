
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { 
  Home, 
  FileText, 
  ClipboardCheck, 
  ShieldCheck, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Bell,
  ArrowRight,
  Lock,
  Building2,
  MapPin,
  TrendingUp,
  Clock,
  MessageSquare,
  DollarSign,
  LifeBuoy,
  Newspaper,
  Users,
  Gift
} from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { ClientTimeline } from "@/components/ClientFlow/ClientTimeline";
import { StageIndicator } from "@/components/ClientFlow/StageIndicator";
import { NextSteps } from "@/components/ClientFlow/NextSteps";
import { FeatureGate, GatedButton } from "@/components/ClientFlow/FeatureGate";
import { useClientStage } from "@/hooks/useClientStage";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { StatsCard } from "@/components/shared/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { useAuth } from "@/contexts/AuthContext";
import { documentService } from "@/services/DocumentService";
import { inspectionService } from "@/services/InspectionService";
import { warrantyFlowService } from "@/services/WarrantyFlowService";
import { ClientFAQ } from "@/components/ClientFlow/ClientFAQ";
import { financialService } from "@/services/FinancialService";
import { constructionService } from "@/services/ConstructionService";
import { ConstructionFeed } from "@/components/ClientArea/ConstructionFeed";
import { ReferralCard } from "@/components/ClientArea/ReferralCard";
import { useMemo } from "react";

const Dashboard = () => {
  // Get client stage data
  const { user } = useAuth();
  const { toast } = useToast();
  const clientId = user?.id || "client-1"; // Get from auth context
  const { 
    profile, 
    stage, 
    permissions, 
    timeline, 
    isLoading,
    canScheduleInspection,
    canRequestWarranty 
  } = useClientStage(clientId);
  
  const { unreadCount, urgentNotifications } = useNotifications(clientId);

  // Get user info from profile
  const userInfo = {
    name: user?.name || profile?.name || "Maria Oliveira",
    property: profile?.propertyName || "Edifício Aurora",
    unit: profile?.unitNumber || "204",
    deliveryDate: new Date(2025, 5, 15),
    contractDate: new Date(2024, 10, 20)
  };

  const allDocs = useMemo(() => documentService.getDocumentsByClient(user?.name || "João Silva"), [user?.name]);
  const recentDocuments = allDocs.slice(0, 3).map(doc => ({
    ...doc,
    date: doc.createdAt,
    status: doc.status === "published" ? "disponivel" : "pendente"
  }));

  const allInspections = useMemo(() => inspectionService.getAll().filter(i => i.client === (user?.name || "João Silva")), [user?.name]);
  const upcomingInspections = allInspections
    .filter(i => i.status === "pending")
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 2);

  const warrantyRequests = useMemo(() => warrantyFlowService.getClientRequests(clientId).slice(0, 2), [clientId]);
  const financialSummary = useMemo(() => financialService.getFinancialSummary(clientId), [clientId]);
  const constructionUpdates = useMemo(() => constructionService.getUpdates(), []);
  const latestProgress = useMemo(() => constructionService.getLatestProgress(), []);

  const getStatusColor = (status: string) => {
    const colors = {
      disponivel: "default",
      published: "default",
      agendada: "default",
      pending: "secondary",
      progress: "secondary",
      em_andamento: "secondary",
      concluido: "outline",
      complete: "outline"
    };
    return colors[status as keyof typeof colors] || "outline";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      disponivel: "Disponível",
      published: "Publicado",
      agendada: "Agendada",
      pending: "Pendente",
      progress: "Em Progresso",
      em_andamento: "Em Andamento",
      concluido: "Concluído",
      complete: "Concluído"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const daysToDelivery = userInfo.deliveryDate ? Math.ceil((userInfo.deliveryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const contractProgress = userInfo.deliveryDate && userInfo.contractDate ? Math.min(((new Date().getTime() - userInfo.contractDate.getTime()) / (userInfo.deliveryDate.getTime() - userInfo.contractDate.getTime())) * 100, 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-2 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-layout-gap pb-20 md:pb-6 animate-in fade-in duration-slow">
      {/* Header with Stage Indicator */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Bem-vindo, {userInfo.name}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o progresso do seu imóvel e acesse seus serviços exclusivos.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
          {stage && (
            <StageIndicator currentStage={stage} showDescription />
          )}
          <div className="h-10 w-px bg-border mx-2 hidden md:block" />
          <div className="flex flex-col items-end bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 shadow-sm hover:bg-primary/10 transition-colors">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status da Obra</span>
            <span className="text-lg font-black text-primary leading-none">{Math.round(contractProgress)}% Concluído</span>
          </div>
        </div>
      </div>


      {/* Property Info Card */}
      <ResponsiveGrid columns={3} gap="layout">
        <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 shadow-xl overflow-hidden relative rounded-3xl group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700 group-hover:scale-110">
            <Home className="h-32 w-32" />
          </div>
          <CardHeader className="relative z-10 pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-2xl font-black flex items-center gap-3 tracking-tight">
                  <div className="p-2.5 bg-primary/10 rounded-2xl">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  {userInfo.property}
                </CardTitle>
                <div className="flex items-center gap-3 mt-3">
                  <div className="bg-muted px-2.5 py-1 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-widest border border-border/50">
                    Unidade {userInfo.unit}
                  </div>
                  <div className="bg-primary/5 px-2.5 py-1 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest border border-primary/10">
                    Bloco A
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="bg-primary text-primary-foreground border-none font-black uppercase tracking-tighter text-[11px] px-4 py-2 shadow-lg shadow-primary/20 animate-pulse rounded-full">
                {daysToDelivery > 0 ? `${daysToDelivery} dias para entrega` : "Imóvel Entregue"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Evolução da Obra</span>
                  </div>
                  <p className="text-3xl font-black text-primary tracking-tighter">{Math.round(contractProgress)}%</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Previsão</span>
                  <p className="font-bold text-foreground">{userInfo.deliveryDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="relative pt-1">
                <Progress value={contractProgress} className="h-3 bg-primary/10 rounded-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-4 text-sm text-muted-foreground bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-primary/5 shadow-sm group-hover:bg-white/80 transition-all duration-500">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground/60 leading-none mb-1.5 tracking-wider">Assinatura</p>
                    <span className="font-bold text-foreground">{userInfo.contractDate.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-primary/5 shadow-sm group-hover:bg-white/80 transition-all duration-500">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground/60 leading-none mb-1.5 tracking-wider">Endereço</p>
                    <span className="font-bold text-foreground">Av. Principal, 1000 - SP</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Summary Card */}
        <Card className="bg-primary text-primary-foreground shadow-lg flex flex-col justify-between border-none overflow-hidden relative group rounded-3xl">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <CardHeader>
            <CardTitle className="text-lg font-bold">Resumo Geral</CardTitle>
            <CardDescription className="text-primary-foreground/70">Status dos seus serviços ativos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-white/70" />
                <span className="text-sm font-medium">Documentos</span>
              </div>
              <span className="font-black">{allDocs.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-white/70" />
                <span className="text-sm font-medium">Vistorias</span>
              </div>
              <span className="font-black">{allInspections.filter(i => i.status === 'complete').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-white/70" />
                <span className="text-sm font-medium">Garantias</span>
              </div>
              <span className="font-black">{warrantyRequests.filter(r => r.currentStage !== 'completed' && r.currentStage !== 'rejected').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-white/70" />
                <span className="text-sm font-medium">Financeiro</span>
              </div>
              <span className="font-black">{Math.round(financialSummary.progress)}%</span>
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-6">
            <Link to="/client/notifications" className="w-full">
              <Button variant="secondary" className="w-full font-black uppercase tracking-widest text-[10px] h-11 shadow-md rounded-xl">
                <Bell className="mr-2 h-4 w-4" />
                Notificações ({unreadCount})
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </ResponsiveGrid>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-layout-gap">
        <div className="lg:col-span-2 space-y-8">
          <ClientTimeline 
            timeline={timeline} 
            title="Sua Jornada"
            description="Acompanhe cada etapa do processo do seu imóvel"
          />
          
          <ConstructionFeed updates={constructionUpdates} />
        </div>
        <div className="space-y-8">
          <ReferralCard className="rounded-3xl" />

          <NextSteps 
            steps={useMemo(() => {
              const baseSteps = [];
              
              if (stage === 'registered') {
                baseSteps.push({
                  id: '1',
                  title: 'Aguardar liberação de vistoria',
                  description: 'Estamos finalizando os últimos detalhes da sua unidade.',
                  status: 'current' as const
                });
              } else if (stage === 'inspection_enabled') {
                const pendingInsp = upcomingInspections.length > 0;
                baseSteps.push({
                  id: '1',
                  title: pendingInsp ? 'Confirmar presença na vistoria' : 'Agendar primeira vistoria',
                  description: pendingInsp ? 'Sua vistoria está agendada.' : 'Agende o melhor horário para visitar seu imóvel.',
                  status: 'current' as const,
                  link: '/client/inspections'
                });
                baseSteps.push({
                  id: '2',
                  title: 'Realizar vistoria técnica',
                  description: 'Acompanhe nosso técnico na unidade.',
                  status: 'upcoming' as const
                });
              } else if (stage === 'warranty_enabled') {
                baseSteps.push({
                  id: '1',
                  title: 'Vistoria concluída e aprovada',
                  description: 'Parabéns! Seu imóvel foi entregue.',
                  status: 'completed' as const
                });
                baseSteps.push({
                  id: '2',
                  title: 'Acessar manual do proprietário',
                  description: 'Documento disponível na central de ajuda.',
                  status: 'current' as const,
                  link: '/client/support'
                });
              }

              // Always show financial step if pending
              if (financialSummary.nextPayment) {
                baseSteps.push({
                  id: 'fin-1',
                  title: 'Pagamento da próxima parcela',
                  description: `Vencimento em ${financialSummary.nextPayment.dueDate.toLocaleDateString()}`,
                  status: 'upcoming' as const,
                  link: '/client/financial'
                });
              }

              return baseSteps;
            }, [stage, upcomingInspections, financialSummary])} 
          />

          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Ficha Técnica do Imóvel</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {[
                  { label: "Área Privativa", value: "72,50 m²" },
                  { label: "Vagas de Garagem", value: "2 Vagas" },
                  { label: "Pavimento", value: "12º Andar" },
                  { label: "Posição Solar", value: "Norte/Leste" }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center px-6 py-4">
                    <span className="text-sm text-muted-foreground font-medium">{item.label}</span>
                    <span className="text-sm font-black">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Grid */}
      <ResponsiveGrid columns={4} gap="layout">
        <StatsCard 
          label="Documentos" 
          value={allDocs.length} 
          icon={FileText} 
          description={`${allDocs.filter(d => d.status === 'published').length} disponíveis`}
          variant="brand"
        />
        <StatsCard 
          label="Vistorias" 
          value={allInspections.length} 
          icon={ClipboardCheck} 
          description={upcomingInspections.length > 0 ? `${upcomingInspections.length} pendente(s)` : 'Nenhuma pendente'}
          variant={allInspections.filter(i => i.status === 'complete').length > 0 ? 'complete' : 'pending'}
        />
        <StatsCard 
          label="Garantias" 
          value={canRequestWarranty ? warrantyRequests.length : 0} 
          icon={ShieldCheck} 
          description={canRequestWarranty ? `${warrantyRequests.filter(r => r.currentStage !== 'completed').length} em aberto` : 'Aguardando liberação'}
          variant={canRequestWarranty ? 'progress' : 'default'}
        />
        <StatsCard 
          label="Notificações" 
          value={unreadCount} 
          icon={Bell} 
          description={urgentNotifications.length > 0 ? `${urgentNotifications.length} urgentes` : 'Nenhuma urgente'}
          variant={unreadCount > 0 ? 'critical' : 'default'}
        />
      </ResponsiveGrid>

      {/* FAQ and Support Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-layout-gap">
        <div className="lg:col-span-2">
          <ClientFAQ />
        </div>
        <div>
          <Card className="bg-muted/30 border-none shadow-sm rounded-3xl h-full flex flex-col justify-center p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LifeBuoy className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Precisa de Ajuda?</h3>
            <p className="text-sm text-muted-foreground mb-6">Nossa equipe de suporte está pronta para atender você e tirar todas as suas dúvidas.</p>
            <Link to="/client/support">
              <Button className="w-full rounded-xl font-black uppercase tracking-widest text-[10px] h-12">
                Acessar Central de Ajuda
              </Button>
            </Link>
          </Card>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-layout-gap">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-layout-gap">
        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos Recentes
              </CardTitle>
              <Link to="/client/documents">
                <Button variant="ghost" size="sm">
                  Ver todos <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDocuments.length > 0 ? (
              recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[150px] md:max-w-[200px]">{doc.title}</p>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase">{new Intl.DateTimeFormat('pt-BR').format(doc.date)}</p>
                    </div>
                  </div>
                  <StatusBadge 
                    status={doc.status === "disponivel" || doc.status === "published" ? "complete" : (doc.status === "processando" ? "progress" : "pending")} 
                    label={getStatusLabel(doc.status)}
                    size="sm"
                  />
                </div>
              ))
            ) : (
              <div className="py-8 text-center bg-muted/20 rounded-xl border border-dashed">
                <p className="text-sm text-muted-foreground">Nenhum documento disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Inspections with Gate */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Próximas Vistorias
                {!canScheduleInspection && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
              <Link to="/client/inspections">
                <Button variant="ghost" size="sm">
                  Ver todas <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {canScheduleInspection ? (
              upcomingInspections.map((inspection) => (
                <div key={inspection.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{inspection.type === 'technicalInspection' ? 'Vistoria Técnica' : 'Vistoria de Chaves'}</p>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase">{new Intl.DateTimeFormat('pt-BR').format(inspection.date)}</p>
                    </div>
                  </div>
                  <StatusBadge 
                    status={inspection.status === "complete" ? "complete" : "pending"} 
                    label={getStatusLabel(inspection.status)}
                    size="sm"
                  />
                </div>
              ))
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  As vistorias serão liberadas em breve pelo administrador.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warranty Requests with Gate */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Solicitações de Garantia
                {!canRequestWarranty && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
              <Link to="/client/warranty">
                <Button variant="ghost" size="sm">
                  Ver todas <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {canRequestWarranty ? (
              warrantyRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[150px]">{request.title}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{request.priority}</p>
                    </div>
                  </div>
                  <StatusBadge 
                    status={request.currentStage === "completed" ? "complete" : (request.currentStage === "rejected" ? "critical" : "progress")} 
                    label={getStatusLabel(request.currentStage)}
                    size="sm"
                  />
                </div>
              ))
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  As garantias serão liberadas após a aprovação da vistoria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentNotifications.length > 0 ? (
              urgentNotifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all group">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-primary/10 text-primary">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{notification.title}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{notification.message}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary/40 group-hover:translate-x-1 transition-transform" />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 bg-muted/20 rounded-xl border border-dashed">
                <CheckCircle className="h-8 w-8 text-green-600/30 mb-2" />
                <p className="text-xs font-bold text-muted-foreground uppercase">Tudo em dia!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="border-none bg-muted/30">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-bold">Serviços e Atalhos</CardTitle>
          </div>
          <CardDescription>Acesso rápido aos principais recursos do seu portal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link to="/client/support" className="group">
              <div className="h-full p-4 rounded-xl border bg-card hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-white/20">
                  <LifeBuoy className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <span className="font-bold text-sm">Suporte</span>
              </div>
            </Link>
            <Link to="/client/financial" className="group">
              <div className="h-full p-4 rounded-xl border bg-card hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-white/20">
                  <DollarSign className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <span className="font-bold text-sm">Financeiro</span>
              </div>
            </Link>
            <Link to="/client/documents" className="group">
              <div className="h-full p-4 rounded-xl border bg-card hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-white/20">
                  <FileText className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <span className="font-bold text-sm">Meus Documentos</span>
              </div>
            </Link>
            
            {canScheduleInspection ? (
              <Link to="/client/inspections" className="group">
                <div className="h-full p-4 rounded-xl border bg-card hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center shadow-sm">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-white/20">
                    <ClipboardCheck className="h-6 w-6 text-primary group-hover:text-white" />
                  </div>
                  <span className="font-bold text-sm">Vistorias Agendadas</span>
                </div>
              </Link>
            ) : (
              <div className="h-full p-4 rounded-xl border bg-muted/50 cursor-not-allowed flex flex-col items-center justify-center gap-3 text-center opacity-60">
                <div className="p-3 rounded-full bg-muted">
                  <Lock className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="font-bold text-sm text-muted-foreground">Vistorias (Bloqueado)</span>
              </div>
            )}
            
            {canRequestWarranty ? (
              <Link to="/client/warranty" className="group">
                <div className="h-full p-4 rounded-xl border bg-card hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center shadow-sm">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-white/20">
                    <ShieldCheck className="h-6 w-6 text-primary group-hover:text-white" />
                  </div>
                  <span className="font-bold text-sm">Solicitar Garantia</span>
                </div>
              </Link>
            ) : (
              <div className="h-full p-4 rounded-xl border bg-muted/50 cursor-not-allowed flex flex-col items-center justify-center gap-3 text-center opacity-60">
                <div className="p-3 rounded-full bg-muted">
                  <Lock className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="font-bold text-sm text-muted-foreground">Garantias (Bloqueado)</span>
              </div>
            )}
            
            <Link to="/client/properties" className="group">
              <div className="h-full p-4 rounded-xl border bg-card hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center shadow-sm">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-white/20">
                  <Building2 className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <span className="font-bold text-sm">Dados do Imóvel</span>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default Dashboard;
