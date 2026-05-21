import { useAuth } from "@/contexts/AuthContext";
import { 
  TrendingUp, 
  Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientStage } from "@/hooks";
import { useMemo } from "react";
import { ClientTimeline, TimelineStep } from "@/components/Client/ClientTimeline";
import { ConstructionFeed, ConstructionUpdate } from "@/components/Client/ConstructionFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveGrid } from "@/components/Shared/ResponsiveGrid";
import { StageIndicator } from "@/components/ClientFlow/StageIndicator";

import { useClientDashboardData } from "@/hooks/core/useClientDashboardData";
import { PropertyInfoCard } from "@/components/Dashboard/Client/PropertyInfoCard";
import { ReferralCard } from "@/components/Dashboard/Client/ReferralCard";
import { TechnicalSheet } from "@/components/Dashboard/Client/TechnicalSheet";

const Dashboard = () => {
  const { user } = useAuth();
  const userId = user?.id || "client-1";
  const { profile, stage, isLoading: stageLoading } = useClientStage(userId);
  
  const {
    isLoading,
    allDocs,
    allInspections,
    warrantyRequests,
    constructionUpdates: serviceUpdates
  } = useClientDashboardData(profile?.id || userId, user?.name);
  
  const userInfo = useMemo(() => ({
    name: user?.name?.split(' ')[0] || "Cliente",
    property: profile?.propertyName || "Seu Empreendimento",
    unit: profile?.unitNumber || "N/A",
    deliveryDate: new Date(2025, 11, 15),
    contractDate: new Date(2023, 5, 10),
  }), [user, profile]);

  const timeline: TimelineStep[] = [
    { id: '1', title: 'Compra do Imóvel', description: 'Contrato assinado.', date: '10/06/2023', status: 'completed' },
    { id: '2', title: 'Obras em Andamento', description: 'Acompanhe a evolução estrutural do seu empreendimento.', date: 'Em curso', status: 'completed' },
    { id: '3', title: 'Vistoria Técnica', description: 'Verificação detalhada da sua unidade finalizada.', status: stage === 'inspection_enabled' ? 'current' : (stage === 'warranty_enabled' ? 'completed' : 'pending') },
    { id: '4', title: 'Entrega das Chaves', description: 'O momento mais esperado! Recebimento das chaves.', status: stage === 'warranty_enabled' ? 'completed' : 'pending' },
    { id: '5', title: 'Pós-Venda e Garantia', description: 'Suporte especializado para qualquer ajuste necessário.', status: stage === 'warranty_enabled' ? 'current' : 'pending' },
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
        title: 'Finalização do Revestimento Externo',
        description: 'Concluímos a pintura da fachada e instalação de vidros nas varandas do bloco A.',
        percentage: 85,
        imageUrl: 'https://images.unsplash.com/photo-1503387762-592dee58c460?auto=format&fit=crop&w=800&q=80'
      }
    ];
  }, [serviceUpdates]);

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
    <div className="container-responsive py-layout-gap space-y-layout-gap pb-20 md:pb-6 animate-in fade-in duration-slow">
      {/* Header with Stage Indicator */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground leading-tight">
            Bem-vindo ao Portal Técnico, {userInfo.name}! 👋
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">
               Gestão de Ativos e Conformidade Técnica (ABNT)
             </p>
          </div>

        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <StageIndicator currentStage={stage || 'lead'} showDescription variant="badge" />

          <div className="hidden md:block h-10 w-px bg-border/40 mx-1" />
          <Card className="bg-primary/5 px-5 py-2.5 rounded-2xl border border-primary/10 shadow-sm hover:bg-primary/10 transition-all hover:scale-105 active:scale-95 group cursor-pointer border-l-4 border-l-primary">
            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-1 block">Status Estratégico</span>
            <div className="flex items-center gap-3">
               <span className="text-xl font-black text-primary leading-none tracking-tighter">{Math.round(contractProgress)}%</span>
               <TrendingUp size={16} className="text-primary group-hover:translate-y-[-2px] transition-transform" />
            </div>
          </Card>
        </div>
      </div>


      {/* Property Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-layout-gap">
        <div className="lg:col-span-2">
          <PropertyInfoCard 
            property={userInfo.property}
            unit={userInfo.unit}
            daysToDelivery={daysToDelivery}
            contractProgress={contractProgress}
            deliveryDate={userInfo.deliveryDate}
            contractDate={userInfo.contractDate}
          />
        </div>
        <div className="lg:col-span-1">
          <ReferralCard />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-layout-gap">
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-sem-lg rounded-[2.5rem] overflow-hidden bg-white/60 backdrop-blur-md">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight">Sua Jornada Digital</CardTitle>
                  <CardDescription className="font-bold text-muted-foreground/80">Acompanhe a evolução estratégica do seu imóvel</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-8">
              <ClientTimeline steps={timeline} />
            </CardContent>
          </Card>
          
          <ConstructionFeed updates={constructionUpdates} />
        </div>
        
        <div className="lg:col-span-4 space-y-8">
          <TechnicalSheet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;