import { useAuth } from "@/contexts/AuthContext";
import { 
  FileText, 
  ClipboardCheck, 
  ShieldCheck, 
  Bell, 
  ArrowRight, 
  Calendar, 
  MessageSquare,
  TrendingUp,
  DollarSign,
  LifeBuoy,
  CheckCircle,
  AlertCircle,
  Clock,
  Lock,
  ChevronRight,
  HardHat,
  Home,
  Building2,
  MapPin,
  Gift,
  Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useClientStage } from "@/hooks/useClientStage";
import { documentService } from "@/services/DocumentService";
import { financialService } from "@/services/FinancialService";
import { inspectionService } from "@/services/InspectionService";
import { warrantyFlowService } from "@/services/WarrantyFlowService";
import { useMemo, useState, useEffect } from "react";
import { ClientTimeline, TimelineStep } from "@/components/client/ClientTimeline";
import { ConstructionFeed, ConstructionUpdate } from "@/components/client/ConstructionFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { StatsCard } from "@/components/shared/StatsCard";
import { ClientBenefitCards } from "@/components/ClientArea/ClientBenefitCards";
import { ClientFAQ } from "@/components/ClientFlow/ClientFAQ";
import { StageIndicator } from "@/components/ClientFlow/StageIndicator";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { user } = useAuth();
  const clientId = user?.id || "client-1";
  const { stage, isLoading: stageLoading } = useClientStage(clientId);
  const [isLoading, setIsLoading] = useState(true);

  // Data fetching (simulated)
  const financialSummary = useMemo(() => financialService.getFinancialSummary(clientId), [clientId]);
  const allDocs = useMemo(() => documentService.getDocumentsByClient(user?.name || "João Silva"), [user?.name]);
  const allInspections = useMemo(() => inspectionService.getAll().filter(i => i.client === (user?.name || "João Silva")), [user?.name]);
  const upcomingInspections = useMemo(() => allInspections.filter(i => i.status !== 'complete'), [allInspections]);
  const warrantyRequests = useMemo(() => warrantyFlowService.getAllRequests().filter(r => r.clientId === clientId), [clientId]);
  
  const userInfo = {
    name: user?.name?.split(' ')[0] || "Cliente",
    property: "Residencial Aurora",
    unit: "204",
    deliveryDate: new Date(2025, 11, 15),
    contractDate: new Date(2023, 5, 10),
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = 3;
  const urgentNotifications = [
    { id: '1', title: 'Vistoria Agendada', message: 'Sua vistoria técnica está confirmada para o dia 20/05 às 14:00.' },
    { id: '2', title: 'Documento Pendente', message: 'Você tem um contrato aguardando sua assinatura digital.' }
  ];

  const canScheduleInspection = stage === 'inspection_enabled' || stage === 'warranty_enabled';
  const canRequestWarranty = stage === 'warranty_enabled';

  const timeline: TimelineStep[] = [
    { id: '1', title: 'Compra do Imóvel', description: 'Contrato assinado e primeira parcela paga.', date: '10/06/2023', status: 'completed' },
    { id: '2', title: 'Obras em Andamento', description: 'Acompanhe a evolução estrutural do seu empreendimento.', date: 'Em curso', status: 'completed' },
    { id: '3', title: 'Vistoria Técnica', description: 'Verificação detalhada da sua unidade finalizada.', status: stage === 'inspection_enabled' ? 'current' : (stage === 'warranty_enabled' ? 'completed' : 'pending') },
    { id: '4', title: 'Entrega das Chaves', description: 'O momento mais esperado! Recebimento das chaves.', status: stage === 'warranty_enabled' ? 'completed' : 'pending' },
    { id: '5', title: 'Pós-Venda e Garantia', description: 'Suporte especializado para qualquer ajuste necessário.', status: stage === 'warranty_enabled' ? 'current' : 'pending' },
  ];

  const constructionUpdates: ConstructionUpdate[] = [
    {
      id: '1',
      date: '15/04/2025',
      title: 'Finalização do Revestimento Externo',
      description: 'Concluímos a pintura da fachada e instalação de vidros nas varandas do bloco A.',
      percentage: 85,
      imageUrl: 'https://images.unsplash.com/photo-1503387762-592dee58c460?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '2',
      date: '02/04/2025',
      title: 'Instalações Elétricas e Hidráulicas',
      description: 'Avançamos para 95% das instalações internas em todas as unidades do 1º ao 15º andar.',
      percentage: 78,
      imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const getStatusLabel = (status: string) => {
    const labels = {
      disponivel: "Disponível",
      published: "Publicado",
      agendada: "Agendada",
      pending: "Pendente",
      progress: "Em Progresso",
      em_andamento: "Em Andamento",
      concluido: "Concluído",
      complete: "Concluído",
      completed: "Concluído",
      rejected: "Recusado"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const daysToDelivery = userInfo.deliveryDate ? Math.ceil((userInfo.deliveryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const contractProgress = userInfo.deliveryDate && userInfo.contractDate ? Math.min(((new Date().getTime() - userInfo.contractDate.getTime()) / (userInfo.deliveryDate.getTime() - userInfo.contractDate.getTime())) * 100, 100) : 0;

  if (isLoading || stageLoading) {
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground leading-tight">
            Bem-vindo, {userInfo.name}! 👋
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">
               Sua jornada com a A2 Incorporadora
             </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
          {stage && (
            <StageIndicator currentStage={stage} showDescription variant="badge" />
          )}
          <div className="hidden md:block h-12 w-px bg-border/40 mx-2" />
          <Card className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10 shadow-sm hover:bg-primary/10 transition-colors group cursor-pointer">
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-1.5 block">Status Geral</span>
            <div className="flex items-center gap-3">
               <span className="text-2xl font-black text-primary leading-none tracking-tighter">{Math.round(contractProgress)}%</span>
               <TrendingUp size={18} className="text-primary group-hover:translate-y-[-2px] transition-transform" />
            </div>
          </Card>
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
          <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">Sua Jornada</CardTitle>
                  <CardDescription className="font-medium">Acompanhe cada etapa do processo do seu imóvel</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <ClientTimeline steps={timeline} />
            </CardContent>
          </Card>
          
          <ConstructionFeed updates={constructionUpdates} />
        </div>
        
        <div className="space-y-8">
          <Card className="bg-emerald-600 text-white shadow-xl rounded-[2rem] overflow-hidden relative group border-none">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <CardHeader className="pb-4">
               <div className="p-3 bg-white/20 rounded-2xl w-fit mb-4">
                 <Gift className="h-6 w-6 text-white" />
               </div>
               <CardTitle className="text-2xl font-black leading-tight">Indique um Amigo</CardTitle>
               <CardDescription className="text-emerald-100 font-medium">Ganhe descontos exclusivos na sua parcela por cada indicação.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-white text-emerald-600 hover:bg-white/90 rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 shadow-lg">
                Conhecer Programa
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-muted/30 pb-4 p-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Ficha Técnica do Imóvel</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {[
                  { label: "Área Privativa", value: "72,50 m²" },
                  { label: "Vagas de Garagem", value: "2 Vagas" },
                  { label: "Pavimento", value: "12º Andar" },
                  { label: "Posição Solar", value: "Norte/Leste" }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center px-6 py-4 hover:bg-muted/10 transition-colors">
                    <span className="text-sm text-muted-foreground font-medium">{item.label}</span>
                    <span className="text-sm font-black">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-xl rounded-[2rem] overflow-hidden group">
            <CardHeader className="bg-primary/5 pb-6 border-b border-border/10 p-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">Seu Gestor Dedicado</CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center space-y-6">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full border-4 border-primary/10 overflow-hidden mx-auto transition-transform duration-500 group-hover:scale-105">
                   <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80" alt="Consultor" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Roberto Andrade</h3>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">Consultor de Relacionamento</p>
              </div>
              <div className="pt-4 border-t border-border/10 space-y-3">
                 <Button variant="outline" className="w-full rounded-xl font-bold gap-2 h-11 border-primary/20 hover:bg-primary/5">
                    <MessageSquare size={16} className="text-primary" /> Falar com Roberto
                 </Button>
                 <Button variant="ghost" className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
                    Ver agenda de reuniões
                 </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-black tracking-tight">Benefícios & Oportunidades</h2>
        </div>
        <ClientBenefitCards />
      </div>

      {/* Stats Grid */}
      <ResponsiveGrid columns={4} gap="layout">
        <StatsCard 
          label="Documentos" 
          value={allDocs.length} 
          icon={FileText} 
          description={`${allDocs.filter(d => d.status === 'published').length} disponíveis`}
          variant="brand"
          className="rounded-3xl shadow-sem-md border-none"
        />
        <StatsCard 
          label="Vistorias" 
          value={allInspections.length} 
          icon={ClipboardCheck} 
          description={upcomingInspections.length > 0 ? `${upcomingInspections.length} pendente(s)` : 'Nenhuma pendente'}
          variant={allInspections.filter(i => i.status === 'complete').length > 0 ? 'complete' : 'pending'}
          className="rounded-3xl shadow-sem-md border-none"
        />
        <StatsCard 
          label="Garantias" 
          value={canRequestWarranty ? warrantyRequests.length : 0} 
          icon={ShieldCheck} 
          description={canRequestWarranty ? `${warrantyRequests.filter(r => r.currentStage !== 'completed').length} em aberto` : 'Aguardando liberação'}
          variant={canRequestWarranty ? 'progress' : 'default'}
          className="rounded-3xl shadow-sem-md border-none"
        />
        <StatsCard 
          label="Notificações" 
          value={unreadCount} 
          icon={Bell} 
          description={urgentNotifications.length > 0 ? `${urgentNotifications.length} urgentes` : 'Nenhuma urgente'}
          variant={unreadCount > 0 ? 'critical' : 'default'}
          className="rounded-3xl shadow-sem-md border-none"
        />
      </ResponsiveGrid>

      {/* FAQ and Support Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-layout-gap">
        <div className="lg:col-span-2">
          <ClientFAQ />
        </div>
        <div className="space-y-6">
          <Card className="bg-primary/5 border-none shadow-sm rounded-3xl p-8 text-center border border-primary/10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <LifeBuoy className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-black tracking-tight mb-2">Central de Ajuda</h3>
            <p className="text-xs text-muted-foreground mb-6 font-medium leading-relaxed">Acesse manuais, tutoriais e tire suas dúvidas técnicas em nossa base de conhecimento.</p>
            <Link to="/client/support">
              <Button className="w-full rounded-xl font-black uppercase tracking-widest text-[9px] h-10 shadow-lg shadow-primary/20">
                Acessar Help Center
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="border-none bg-muted/30 rounded-[2rem]">
        <CardHeader className="pb-4 p-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-bold">Serviços e Atalhos</CardTitle>
          </div>
          <CardDescription>Acesso rápido aos principais recursos do seu portal</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
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
            
            <Link to="/client/inspections" className="group">
              <div className={cn(
                "h-full p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center shadow-sm",
                canScheduleInspection ? "bg-card hover:bg-primary hover:text-primary-foreground" : "bg-muted/50 cursor-not-allowed opacity-60"
              )}>
                <div className={cn(
                  "p-3 rounded-full",
                  canScheduleInspection ? "bg-primary/10 group-hover:bg-white/20" : "bg-muted"
                )}>
                  {canScheduleInspection ? <ClipboardCheck className={cn("h-6 w-6 text-primary", canScheduleInspection && "group-hover:text-white")} /> : <Lock className="h-6 w-6 text-muted-foreground" />}
                </div>
                <span className="font-bold text-sm">{canScheduleInspection ? "Vistorias" : "Vistorias (Bloqueado)"}</span>
              </div>
            </Link>
            
            <Link to="/client/warranty" className="group">
              <div className={cn(
                "h-full p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center shadow-sm",
                canRequestWarranty ? "bg-card hover:bg-primary hover:text-primary-foreground" : "bg-muted/50 cursor-not-allowed opacity-60"
              )}>
                <div className={cn(
                  "p-3 rounded-full",
                  canRequestWarranty ? "bg-primary/10 group-hover:bg-white/20" : "bg-muted"
                )}>
                  {canRequestWarranty ? <ShieldCheck className={cn("h-6 w-6 text-primary", canRequestWarranty && "group-hover:text-white")} /> : <Lock className="h-6 w-6 text-muted-foreground" />}
                </div>
                <span className="font-bold text-sm">{canRequestWarranty ? "Garantias" : "Garantias (Bloqueado)"}</span>
              </div>
            </Link>
            
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
