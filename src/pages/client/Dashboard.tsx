import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorView } from "@/components/shared/ErrorView";

import { 
  TrendingUp, 
  Activity,
  ArrowRight,
  ShieldCheck,
  ClipboardCheck
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
    warrantyRequests
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

  const timeline: TimelineStep[] = [
    { id: '1', title: 'Contrato', description: 'Assinatura homologada.', date: '10/06/23', status: 'completed' },
    { id: '2', title: 'Obras', description: 'Acompanhamento estrutural.', date: 'Em curso', status: 'completed' },
    { id: '3', title: 'Vistoria', description: 'Checklist ABNT da unidade.', status: stage === 'inspection_enabled' ? 'current' : (stage === 'warranty_enabled' ? 'completed' : 'pending') },
    { id: '4', title: 'Chaves', description: 'Recebimento oficial.', status: stage === 'warranty_enabled' ? 'completed' : 'pending' },
    { id: '5', title: 'Garantia', description: 'Assistência técnica premium.', status: stage === 'warranty_enabled' ? 'current' : 'pending' },
  ];

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
    <div className="container-responsive py-8 space-y-12 animate-in fade-in duration-slow">
      {/* Welcome Header - Refined Hierarchy */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Command Center • Status: {stage === 'warranty_enabled' ? 'Operacional' : 'Em Construção'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
            <Card className="rounded-[2.5rem] border-none bg-primary/5 hover:bg-primary/10 transition-all p-8 group cursor-pointer border-l-4 border-l-primary shadow-sem-lg relative overflow-hidden h-full flex flex-col">
              <div className="absolute right-0 top-0 p-12 opacity-5 pointer-events-none rotate-12 group-hover:rotate-0 transition-all duration-700">
                <ClipboardCheck size={120} />
              </div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-primary group-hover:scale-110 transition-transform">
                  <ClipboardCheck size={24} />
                </div>
                <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest">
                  {upcomingInspections && upcomingInspections.length > 0 ? `${upcomingInspections.length} Agendadas` : "Aguardando"}
                </Badge>
              </div>
              <h3 className="text-xl font-black tracking-tight mb-2 relative z-10">
                {upcomingInspections && upcomingInspections.length > 0 ? "Vistoria em Andamento" : "Vistorias Técnicas"}
              </h3>
              <p className="text-sm text-muted-foreground font-medium mb-6 relative z-10">
                {upcomingInspections && upcomingInspections.length > 0 
                  ? `Você possui ${upcomingInspections.length} vistorias programadas para sua unidade.` 
                  : "Nenhum protocolo de vistoria agendado no momento para sua unidade."}
              </p>
              <Link to="/client/inspections" className="relative z-10 block mt-auto">
                <Button className="w-full rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 shadow-lg shadow-primary/20">
                  {upcomingInspections && upcomingInspections.length > 0 ? "Ver Vistorias" : "Acessar Módulo"} <ArrowRight size={14} className="ml-2" />
                </Button>
              </Link>
            </Card>

            <Card className="rounded-[2.5rem] border-none bg-indigo-50/50 hover:bg-indigo-50 transition-all p-8 group cursor-pointer border-l-4 border-l-indigo-500 shadow-sem-lg relative overflow-hidden h-full flex flex-col">
               <div className="absolute right-0 top-0 p-12 opacity-5 pointer-events-none rotate-12 group-hover:rotate-0 transition-all duration-700">
                <ShieldCheck size={120} />
              </div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-500 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <Badge className="bg-indigo-100 text-indigo-600 border-none font-black text-[10px] uppercase tracking-widest">
                  {warrantyRequests && warrantyRequests.length > 0 ? `${warrantyRequests.length} Ativas` : "Protegido"}
                </Badge>
              </div>
              <h3 className="text-xl font-black tracking-tight mb-2 relative z-10">Assistência Técnica</h3>
              <p className="text-sm text-muted-foreground font-medium mb-6 relative z-10">
                {warrantyRequests && warrantyRequests.length > 0 
                  ? `Existem ${warrantyRequests.length} solicitações de assistência técnica em processamento.` 
                  : "Seu imóvel está coberto. Nenhuma solicitação de reparo ativa no momento."}
              </p>
              <Link to="/client/warranty" className="relative z-10 block mt-auto">
                <Button variant="outline" className="w-full rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                  {warrantyRequests && warrantyRequests.length > 0 ? "Gerenciar Garantias" : "Solicitar Suporte"} <ArrowRight size={14} className="ml-2" />
                </Button>
              </Link>
            </Card>
          </div>

          <ConstructionFeed updates={constructionUpdates} />
        </div>

        <div className="lg:col-span-1 space-y-8">
          <TechnicalSheet 
            propertyArea={propertyData?.totalArea}
            deliveryDate={userInfo.deliveryDate?.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
          />
          
          <Card className="rounded-[2rem] border-none shadow-sem-lg bg-white p-8 overflow-hidden relative group">
            <div className="absolute right-[-10%] top-[-10%] opacity-5 group-hover:rotate-12 transition-transform duration-1000">
              <Activity size={180} />
            </div>
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-black tracking-tight">Jornada Digital</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ClientTimeline steps={timeline} />
            </CardContent>
          </Card>

          <ReferralCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;