import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorView } from "@/components/shared/ErrorView";

import { 
  TrendingUp, 
  Activity,
  ArrowRight,
  ShieldCheck,
  ClipboardCheck,
  Wrench,
  Receipt
} from "lucide-react";
import { propertyService } from "@/services/operations/PropertyService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientStage } from "@/hooks";
import { ClientTimeline, TimelineStep } from "@/components/client/ClientTimeline";
import { ConstructionFeed } from "@/components/client/ConstructionFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { StageIndicator } from "@/components/client-flow/StageIndicator";
import { useClientDashboardData } from "@/hooks/core/useClientDashboardData";
import { PropertyInfoCard } from "@/components/dashboard/client/PropertyInfoCard";
import { ReferralCard } from "@/components/dashboard/client/ReferralCard";
import { TechnicalSheet } from "@/components/dashboard/client/TechnicalSheet";
import { RecentDocumentsCard } from "@/components/dashboard/client/RecentDocumentsCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";


import { useAuditMarker } from "@/hooks/useAuditMarker";

const Dashboard = () => {
  const { user } = useAuth();
  const userId = user?.id || "";
  const { profile, stage, isLoading: stageLoading, error: stageError, refreshProfile } = useClientStage(userId);
  
  const {
    isLoading: dashboardLoading,
    error: dashboardError,
    constructionUpdates: serviceUpdates,
    upcomingInspections,
    warrantyRequests,
    maintenanceSchedules,
    invoices
  } = useClientDashboardData(profile?.id || userId, user?.name);

  
  const [propertyData, setPropertyData] = useState<any>(null);

  useEffect(() => {
    if (profile?.propertyId) {
      propertyService.getById(profile.propertyId).then(setPropertyData);
    }
  }, [profile?.propertyId]);

  const userInfo = useMemo(() => {
    const progress = propertyData?.units && propertyData?.completedUnits 
      ? Math.round((propertyData.completedUnits / propertyData.units) * 100) 
      : 85;

    return {
      name: user?.name?.split(' ')[0] || "Cliente",
      property: profile?.propertyName || "Seu Empreendimento",
      unit: profile?.unitNumber || "N/A",
      deliveryDate: propertyData?.deliveryDate || new Date(2025, 11, 15),
      contractDate: profile?.createdAt || new Date(2023, 5, 10),
      progress: progress
    };
  }, [user, profile, propertyData]);

  const timeline: TimelineStep[] = useMemo(() => {
    const history = profile?.stageHistory || [];
    const getStageDate = (targetStage: string) => {
      const entry = history.find(h => h.toStage === targetStage);
      return entry ? new Date(entry.changedAt).toLocaleDateString('pt-BR') : undefined;
    };

    return [
      { 
        id: '1', 
        title: 'Contrato', 
        description: 'Assinatura homologada.', 
        date: getStageDate('registered') || '10/06/23', 
        status: 'completed' 
      },
      { 
        id: '2', 
        title: 'Obras', 
        description: 'Acompanhamento estrutural.', 
        date: 'Em curso', 
        status: (stage === 'registered' || stage === 'lead') ? 'current' : 'completed' 
      },
      { 
        id: '3', 
        title: 'Vistoria', 
        description: 'Checklist ABNT da unidade.', 
        date: getStageDate('inspection_enabled'),
        status: stage === 'inspection_enabled' ? 'current' : (stage === 'warranty_enabled' ? 'completed' : 'pending') 
      },
      { 
        id: '4', 
        title: 'Chaves', 
        description: 'Recebimento oficial.', 
        date: getStageDate('warranty_enabled'),
        status: stage === 'warranty_enabled' ? 'completed' : 'pending' 
      },
      { 
        id: '5', 
        title: 'Garantia', 
        description: 'Assistência técnica premium.', 
        status: stage === 'warranty_enabled' ? 'current' : 'pending' 
      },
    ];
  }, [profile, stage]);

  const constructionUpdates = useMemo(() => {
    if (serviceUpdates && serviceUpdates.length > 0) {
      return serviceUpdates.map(u => ({
        id: u.id,
        date: new Date(u.date).toLocaleDateString('pt-BR'),
        title: u.title,
        description: u.description,
        percentage: (u as any).progressItems?.[0]?.percentage || 0,
        imageUrl: u.imageUrl
      }));
    }
    return [
      {
        id: '1',
        date: '15/04/2025',
        title: 'Fase de Acabamentos',
        description: 'Pintura final da fachada e instalação de esquadrias em andamento.',
        percentage: 85,
        imageUrl: 'https://images.unsplash.com/photo-1503387762-592dee58c460?auto=format&fit=crop&w=800&q=80'
      }
    ];
  }, [serviceUpdates]);

  const daysToDelivery = userInfo.deliveryDate ? Math.max(0, Math.ceil((userInfo.deliveryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const contractProgress = userInfo.progress;

  if (stageLoading || dashboardLoading) {
    return (
      <div className="container-responsive py-8 space-y-8 animate-pulse">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-80 rounded-[2rem]" />
          <Skeleton className="h-80 rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (stageError || dashboardError) {
    return (
      <div className="container-responsive py-20 flex items-center justify-center">
        <ErrorView 
          message={stageError || (dashboardError as any)?.message || "Ocorreu um erro ao carregar o painel administrativo."} 
          onRetry={refreshProfile}
          fullScreen
        />
      </div>
    );
  }


  return (
    <div className="container-responsive py-4 sm:py-8 space-y-8 sm:space-y-12 animate-in fade-in duration-slow">
      {/* Welcome Header - Refined Hierarchy */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
             <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Command Center • Status: {stage === 'warranty_enabled' ? 'Operacional' : 'Em Construção'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-foreground">
            Olá, <span className="text-primary">{userInfo.name}</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <StageIndicator currentStage={stage || 'lead'} showDescription variant="badge" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <PropertyInfoCard 
            property={userInfo.property}
            unit={userInfo.unit}
            daysToDelivery={daysToDelivery}
            contractProgress={contractProgress}
            deliveryDate={userInfo.deliveryDate}
            contractDate={userInfo.contractDate}
            location={profile?.propertyName ? propertyService.getAllSync().find(p => p.id === profile.propertyId)?.location : undefined}
            block={profile?.block}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch">
            <Card className="rounded-[3rem] border-none bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transition-all p-10 group cursor-pointer border-l-8 border-l-primary shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
              <div className="absolute right-[-10%] top-[-10%] p-12 opacity-5 pointer-events-none rotate-12 group-hover:rotate-0 transition-all duration-700">
                <ClipboardCheck size={240} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-white rounded-2xl shadow-xl text-primary group-hover:scale-110 transition-transform duration-500">
                    <ClipboardCheck size={32} strokeWidth={2.5} />
                  </div>
                  <Badge className="bg-primary text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-lg shadow-primary/20">
                    {upcomingInspections && upcomingInspections.length > 0 ? `${upcomingInspections.length} Pendentes` : "Atualizado"}
                  </Badge>
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-4 text-foreground">
                  Vistorias ABNT
                </h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-8">
                  {upcomingInspections && upcomingInspections.length > 0 
                    ? `Existem vistorias técnicas programadas para validar a conformidade da sua unidade.` 
                    : "Sua unidade está em conformidade com os protocolos técnicos ABNT vigentes."}
                </p>
              </div>
              <Link to="/client/inspections" className="relative z-10 block w-full mt-auto">
                <Button className="w-full rounded-2xl font-black uppercase tracking-widest text-[11px] h-14 shadow-2xl shadow-primary/30 group-hover:translate-y-[-2px] transition-transform">
                  {upcomingInspections && upcomingInspections.length > 0 ? "Acessar Protocolos" : "Ver Histórico"} <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </Card>

            <Card className="rounded-[3rem] border-none bg-gradient-to-br from-indigo-50/50 to-indigo-100/50 hover:from-indigo-100 hover:to-indigo-200 transition-all p-10 group cursor-pointer border-l-8 border-l-indigo-600 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
               <div className="absolute right-[-10%] top-[-10%] p-12 opacity-5 pointer-events-none rotate-12 group-hover:rotate-0 transition-all duration-700">
                <ShieldCheck size={240} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-white rounded-2xl shadow-xl text-indigo-600 group-hover:scale-110 transition-transform duration-500">
                    <ShieldCheck size={32} strokeWidth={2.5} />
                  </div>
                  <Badge className="bg-indigo-600 text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-lg shadow-indigo-600/20">
                    {warrantyRequests && warrantyRequests.length > 0 ? `${warrantyRequests.length} Chamados` : "Protegido"}
                  </Badge>
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-4 text-foreground">Assistência Técnica</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-8">
                  {warrantyRequests && warrantyRequests.length > 0 
                    ? `Sua unidade possui protocolos de assistência técnica ativos em fase de execução.` 
                    : "Aproveite a segurança da nossa garantia premium com suporte especializado 24/7."}
                </p>
              </div>
              <Link to="/client/warranty" className="relative z-10 block w-full mt-auto">
                <Button variant="outline" className="w-full rounded-2xl font-black uppercase tracking-widest text-[11px] h-14 border-2 border-indigo-200 text-indigo-600 hover:bg-white/80 group-hover:translate-y-[-2px] transition-transform">
                  {warrantyRequests && warrantyRequests.length > 0 ? "Monitorar Garantias" : "Solicitar Reparo"} <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch">
            <Card className="rounded-[3rem] border-none bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 transition-all p-10 group cursor-pointer border-l-8 border-l-emerald-500 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
              <div className="absolute right-[-10%] top-[-10%] p-12 opacity-5 pointer-events-none rotate-12 group-hover:rotate-0 transition-all duration-700">
                <Wrench size={240} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-white rounded-2xl shadow-xl text-emerald-600 group-hover:scale-110 transition-transform duration-500">
                    <Wrench size={32} strokeWidth={2.5} />
                  </div>
                  <Badge className="bg-emerald-600 text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl">
                    {maintenanceSchedules?.length || 0} Agendas
                  </Badge>
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-4 text-foreground">
                  Manutenção
                </h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-8">
                  Acompanhe o cronograma de manutenção preventiva ISO 9001 do seu empreendimento.
                </p>
              </div>
              <Link to="/client/maintenance" className="relative z-10 block w-full mt-auto">
                <Button variant="outline" className="w-full rounded-2xl font-black uppercase tracking-widest text-[11px] h-14 border-2 border-emerald-200 text-emerald-600 hover:bg-white/80 transition-transform">
                  Ver Cronograma <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </Card>

            <Card className="rounded-[3rem] border-none bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 transition-all p-10 group cursor-pointer border-l-8 border-l-amber-500 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
              <div className="absolute right-[-10%] top-[-10%] p-12 opacity-5 pointer-events-none rotate-12 group-hover:rotate-0 transition-all duration-700">
                <Receipt size={240} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-white rounded-2xl shadow-xl text-amber-600 group-hover:scale-110 transition-transform duration-500">
                    <Receipt size={32} strokeWidth={2.5} />
                  </div>
                  <Badge className="bg-amber-600 text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl">
                    {invoices?.filter((i: any) => i.status === 'pending')?.length || 0} Pendentes
                  </Badge>
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-4 text-foreground">
                  Financeiro
                </h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-8">
                  Gerencie seus boletos, pagamentos e histórico financeiro com total transparência.
                </p>
              </div>
              <Link to="/client/financial" className="relative z-10 block w-full mt-auto">
                <Button variant="outline" className="w-full rounded-2xl font-black uppercase tracking-widest text-[11px] h-14 border-2 border-amber-200 text-amber-600 hover:bg-white/80 transition-transform">
                  Ver Boletos <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </Card>
          </div>

          <ConstructionFeed updates={constructionUpdates} />
          <RecentDocumentsCard />
        </div>

        <div className="lg:col-span-1 space-y-8">
          <TechnicalSheet 
            propertyArea={propertyData?.totalArea}
            deliveryDate={userInfo.deliveryDate?.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
          />
          
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white p-8 overflow-hidden relative group">
            <div className="absolute right-[-10%] top-[-10%] opacity-5 group-hover:rotate-12 transition-transform duration-1000">
              <Activity size={240} />
            </div>
            <CardHeader className="p-0 mb-8">
              <CardTitle className="text-xl font-black tracking-tighter flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Activity size={20} strokeWidth={3} />
                </div>
                Jornada do Sonho
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ClientTimeline steps={timeline} />
            </CardContent>
          </Card>

          <div className="lg:col-span-1">
            <ReferralCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;