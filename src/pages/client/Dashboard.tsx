
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
  MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { ClientTimeline } from "@/components/ClientFlow/ClientTimeline";
import { StageIndicator } from "@/components/ClientFlow/StageIndicator";
import { FeatureGate, GatedButton } from "@/components/ClientFlow/FeatureGate";
import { useClientStage } from "@/hooks/useClientStage";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { documentService } from "@/services/DocumentService";
import { inspectionService } from "@/services/InspectionService";
import { warrantyFlowService } from "@/services/WarrantyFlowService";
import { ClientFAQ } from "@/components/ClientFlow/ClientFAQ";
import { financialService } from "@/services/FinancialService";
import { useMemo } from "react";

const Dashboard = () => {
  // Get client stage data
  const { user } = useAuth();
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

  const daysToDelivery = Math.ceil((userInfo.deliveryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const contractProgress = Math.min(((new Date().getTime() - userInfo.contractDate.getTime()) / (userInfo.deliveryDate.getTime() - userInfo.contractDate.getTime())) * 100, 100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        <div className="flex items-center gap-3">
          {stage && (
            <StageIndicator currentStage={stage} showDescription />
          )}
          <div className="h-10 w-px bg-border mx-2 hidden md:block" />
          <div className="flex flex-col items-end hidden lg:flex bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 shadow-sm">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status da Obra</span>
            <span className="text-lg font-black text-primary leading-none">{Math.round(contractProgress)}% Concluído</span>
          </div>
        </div>
      </div>

      {/* Property Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-layout-gap">
        <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 shadow-xl overflow-hidden relative rounded-3xl group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700 group-hover:scale-110">
            <Home className="h-32 w-32" />
          </div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black flex items-center gap-3 tracking-tight">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  {userInfo.property}
                </CardTitle>
                <CardDescription className="text-xl font-bold text-foreground/80 mt-2 flex items-center gap-2">
                  <span className="bg-muted px-2 py-0.5 rounded-lg text-sm font-black text-muted-foreground uppercase tracking-widest">Unidade</span>
                  {userInfo.unit}
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary text-primary-foreground border-none font-black uppercase tracking-tighter text-[10px] px-3 py-1.5 shadow-lg animate-pulse">
                {daysToDelivery > 0 ? `${daysToDelivery} dias para entrega` : "Imóvel Entregue"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Progresso Geral</span>
                  <p className="text-2xl font-black text-primary">{Math.round(contractProgress)}%</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Previsão de Entrega</span>
                  <p className="font-bold">{userInfo.deliveryDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <Progress value={contractProgress} className="h-4 bg-primary/10 rounded-full overflow-hidden" />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground bg-white/50 backdrop-blur-sm p-3 rounded-2xl border border-primary/5 shadow-sm group-hover:bg-white transition-colors">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground/60 leading-none mb-1">Assinatura</p>
                    <span className="font-bold text-foreground">{userInfo.contractDate.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground bg-white/50 backdrop-blur-sm p-3 rounded-2xl border border-primary/5 shadow-sm group-hover:bg-white transition-colors">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground/60 leading-none mb-1">Localização</p>
                    <span className="font-bold text-foreground">São Paulo, SP</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Summary Card */}
        <Card className="bg-primary text-primary-foreground shadow-lg flex flex-col justify-between border-none overflow-hidden relative group">
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
          <CardFooter className="pt-0">
            <Link to="/client/notifications" className="w-full">
              <Button variant="secondary" className="w-full font-black uppercase tracking-widest text-[10px] h-11 shadow-md">
                <Bell className="mr-2 h-4 w-4" />
                Notificações ({unreadCount})
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Timeline Section */}
      <ClientTimeline 
        timeline={timeline} 
        title="Sua Jornada"
        description="Acompanhe cada etapa do processo do seu imóvel"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-layout-gap">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label">Documentos</p>
                <p className="text-h1">{allDocs.length}</p>
                <p className="text-caption">{recentDocuments.length} recentes</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label">Vistorias</p>
                <p className="text-h1">{allInspections.length}</p>
                <p className="text-caption">
                  {upcomingInspections.length > 0 ? `${upcomingInspections.length} agendada(s)` : 'Nenhuma pendente'}
                </p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label">Garantias</p>
                <p className="text-h1">{canRequestWarranty ? warrantyRequests.length : '-'}</p>
                <p className="text-caption">
                  {canRequestWarranty ? 'Veja suas solicitações' : 'Aguardando liberação'}
                </p>
              </div>
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label">Notificações</p>
                <p className="text-h1">{unreadCount}</p>
                <p className="text-caption">
                  {urgentNotifications.length > 0 ? `${urgentNotifications.length} urgentes` : 'Nenhuma urgente'}
                </p>
              </div>
              <Bell className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ClientFAQ />
        </div>
        <Card className="bg-primary/5 border-primary/10 flex flex-col justify-center items-center p-6 text-center shadow-sm rounded-2xl">
          <div className="p-4 rounded-2xl bg-primary/10 mb-4 shadow-inner">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-foreground/90 tracking-tight">Suporte Especializado</h3>
          <p className="text-sm text-muted-foreground mb-6 font-medium leading-relaxed">
            Ainda tem dúvidas? Nossa equipe técnica está pronta para te atender via chat.
          </p>
          <Button className="w-full font-bold uppercase tracking-widest text-xs py-6 shadow-md rounded-xl">
            Falar com Consultor
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
