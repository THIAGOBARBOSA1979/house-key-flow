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
import { QuickSummaryCard } from "@/components/Dashboard/Client/QuickSummaryCard";
import { ReferralCard } from "@/components/Dashboard/Client/ReferralCard";
import { TechnicalSheet } from "@/components/Dashboard/Client/TechnicalSheet";

const Dashboard = () => {
  const { user } = useAuth();
  const userId = user?.id || "client-1";
  const { profile, stage, isLoading: stageLoading } = useClientStage(userId);
  
  const {
    isLoading,
    financialSummary,
    allDocs,
    allInspections,
    warrantyRequests
  } = useClientDashboardData(profile?.id || userId, user?.name);
  
  const userInfo = useMemo(() => ({
    name: user?.name?.split(' ')[0] || "Cliente",
    property: profile?.propertyName || "Seu Empreendimento",
    unit: profile?.unitNumber || "N/A",
    deliveryDate: new Date(2025, 11, 15),
    contractDate: new Date(2023, 5, 10),
  }), [user, profile]);

  const unreadCount = 3;

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
          <StageIndicator currentStage={stage || 'lead'} showDescription variant="badge" />

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
        <PropertyInfoCard 
          property={userInfo.property}
          unit={userInfo.unit}
          daysToDelivery={daysToDelivery}
          contractProgress={contractProgress}
          deliveryDate={userInfo.deliveryDate}
          contractDate={userInfo.contractDate}
        />

        {/* Quick Summary Card */}
        <QuickSummaryCard 
          allDocsCount={allDocs.length}
          completedInspectionsCount={allInspections.filter(i => i.status === 'complete').length}
          activeWarrantiesCount={warrantyRequests.filter(r => r.currentStage !== 'completed' && r.currentStage !== 'rejected').length}
          financialProgress={financialSummary.progress}
          unreadNotificationsCount={unreadCount}
        />
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
          <ReferralCard />
          <TechnicalSheet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
