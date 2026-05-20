import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Plus, Lock, CheckCircle, TrendingUp, Activity } from "lucide-react";
import { StatsCard } from "@/components/Shared/StatsCard";
import { ResponsiveGrid } from "@/components/Shared/ResponsiveGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { WarrantyItem } from "@/types/warranty";
import { FeatureGate, GatedButton } from "@/components/ClientFlow/FeatureGate";
import { useClientStage } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { WarrantyRequestTimeline } from "@/components/Warranty/ClientTimeline/WarrantyRequestTimeline";
import { cn } from "@/lib/utils";

import { useWarrantyClaims } from "@/hooks/warranty/useWarrantyClaims";
import { WarrantyGuide } from "@/components/Warranty/Client/WarrantyGuide";
import { WarrantyStatus } from "@/components/Warranty/Client/WarrantyStatus";
import { NewWarrantyRequestDialog } from "@/components/Warranty/Client/NewWarrantyRequestDialog";

const ClientWarranty = () => {
  const { user } = useAuth();
  const clientId = user?.id || "client-1";
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const inspectionId = searchParams.get("inspectionId");
  
  const { claims, metrics, cancelClaim, addInfo, createClaim } = useWarrantyClaims(clientId, user?.name);
  const { canRequestWarranty, stage, isLoading } = useClientStage(clientId);
  
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWarrantyItem, setSelectedWarrantyItem] = useState<WarrantyItem | null>(null);
  const [requestStep, setRequestStep] = useState<"select_item" | "fill_form">("select_item");

  useEffect(() => {
    if (inspectionId) {
      setIsDialogOpen(true);
      setRequestStep("fill_form");
      toast({
        title: "Reportando Defeito",
        description: `Iniciando chamado vinculado à vistoria #${inspectionId}`,
      });
    }
  }, [inspectionId, toast]);

  const selectedClaim = useMemo(() => 
    selectedClaimId ? claims.find(c => c.id === selectedClaimId) : null, 
  [selectedClaimId, claims]);

  const handleSubmit = (data: any) => {
    if (!selectedWarrantyItem) return;
    const success = createClaim(selectedWarrantyItem, data);
    if (success) {
      setIsDialogOpen(false);
      setSelectedWarrantyItem(null);
      setRequestStep("select_item");
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!canRequestWarranty && open) {
      toast({
        title: "Funcionalidade bloqueada",
        description: "Você ainda não tem permissão para solicitar garantias.",
        variant: "destructive"
      });
      return;
    }
    setIsDialogOpen(open);
    if (!open) {
      setSelectedWarrantyItem(null);
      setRequestStep("select_item");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container-responsive py-layout-gap space-y-layout-gap pb-20 md:pb-6 animate-in fade-in duration-slow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl shadow-inner">
              <ShieldCheck className="h-7 w-7 text-primary" strokeWidth={3} />
            </div>
            Assistência Técnica & Garantias
            {!canRequestWarranty && <Lock className="h-5 w-5 text-muted-foreground/40 ml-2" />}
          </h1>
          <p className="text-muted-foreground font-bold text-sm">
            {canRequestWarranty 
              ? "Governança técnica: solicite reparos, acompanhe visitas e visualize laudos ABNT."
              : "As garantias serão liberadas automaticamente após a aprovação da vistoria final de chaves."
            }
          </p>
        </div>
        
        {canRequestWarranty ? (
          <Button onClick={() => setIsDialogOpen(true)} className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 transition-all active:scale-95">
            <Plus className="mr-2 h-4 w-4" strokeWidth={3} />
            Abrir Chamado Técnico
          </Button>
        ) : (
          <GatedButton isAllowed={false} tooltipMessage="Garantias serão liberadas após aprovação da vistoria">
            <Plus className="mr-2 h-4 w-4" strokeWidth={3} />
            Nova Solicitação
          </GatedButton>
        )}
      </div>

      <NewWarrantyRequestDialog 
        isOpen={isDialogOpen}
        onOpenChange={handleDialogClose}
        clientId={clientId}
        requestStep={requestStep}
        setRequestStep={setRequestStep}
        selectedItem={selectedWarrantyItem}
        onSelectItem={setSelectedWarrantyItem}
        onSubmit={handleSubmit}
      />

      <FeatureGate
        isAllowed={canRequestWarranty}
        requiredStage="warranty_enabled"
        featureName="A funcionalidade de garantias"
        message="As garantias serão liberadas automaticamente após a aprovação da sua vistoria de pré-entrega."
        redirectTo="/client/inspections"
        redirectLabel="Ver minhas vistorias"
        variant="overlay"
      >
        <ResponsiveGrid columns={3} gap="layout" className="mb-6">
          <StatsCard 
            label="Total de Solicitações" 
            value={claims.length} 
            icon={ShieldCheck} 
            variant="brand"
            className="rounded-[2rem] border-none bg-card/40 backdrop-blur-md shadow-sem-sm"
          />
          <StatsCard 
            label="SLA de Atendimento" 
            value={`${metrics.slaComplianceRate}%`} 
            icon={TrendingUp} 
            variant="progress"
            description="Chamados dentro do prazo"
            className="rounded-[2rem] border-none bg-card/40 backdrop-blur-md shadow-sem-sm"
          />
          <StatsCard 
            label="Concluídas" 
            value={claims.filter(c => c.currentStage === 'completed').length} 
            icon={CheckCircle} 
            variant="complete"
            className="rounded-[2rem] border-none bg-card/40 backdrop-blur-md shadow-sem-sm"
          />
        </ResponsiveGrid>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-layout-gap">
          <div className="lg:col-span-4 space-y-layout-gap">
            <Card className="shadow-sem-lg border-none bg-white/60 backdrop-blur-md rounded-[2rem] overflow-hidden">
              <CardHeader className="pb-4 p-8 border-b border-border/5">
                <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                   <Activity className="h-5 w-5 text-primary" />
                   Minhas Solicitações
                </CardTitle>
                <CardDescription className="font-bold">Histórico de protocolos técnicos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                {claims.length > 0 ? (
                  claims.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedClaimId(c.id)}
                      className={cn(
                        "p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative group",
                        selectedClaimId === c.id 
                          ? "border-primary bg-primary/5 shadow-md scale-[1.02]" 
                          : "border-transparent bg-muted/20 hover:bg-muted/40"
                      )}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-black truncate text-foreground/80 group-hover:text-primary transition-colors">{c.title}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-60">
                        <span className="bg-muted px-2 py-0.5 rounded-md">#{c.id.slice(0, 8)}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      {selectedClaimId === c.id && (
                        <div className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-full" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 opacity-40">
                    <ShieldCheck size={48} className="mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Nenhum protocolo ativo</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <WarrantyGuide />
          </div>

          <div className="lg:col-span-8 space-y-layout-gap">
            {selectedClaim ? (
              <div className="space-y-layout-gap animate-in fade-in slide-in-from-bottom-4 duration-slow">
                <WarrantyStatus status={selectedClaim.status || 'pending'} />
                <WarrantyRequestTimeline request={selectedClaim} />
              </div>
            ) : (
              <Card className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-muted-foreground/10 bg-muted/5 rounded-[3rem]">
                <ShieldCheck className="h-20 w-20 text-muted-foreground/10 mb-6" />
                <h3 className="text-2xl font-black text-muted-foreground/60 tracking-tight">Selecione um Protocolo</h3>
                <p className="text-muted-foreground/40 max-w-xs mx-auto mt-2 font-bold text-sm">Escolha uma solicitação na lista lateral para realizar o acompanhamento técnico em tempo real.</p>
              </Card>
            )}
          </div>
        </div>
      </FeatureGate>
    </div>
  );
};

export default ClientWarranty;
