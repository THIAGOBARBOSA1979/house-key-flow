import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Plus, Lock, CheckCircle, TrendingUp } from "lucide-react";
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
    <div className="space-y-layout-gap pb-20 md:pb-6 animate-in fade-in duration-slow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl">
              <ShieldCheck className="h-6 w-6 text-primary" strokeWidth={3} />
            </div>
            Assistência Técnica
            {!canRequestWarranty && <Lock className="h-5 w-5 text-muted-foreground ml-2" />}
          </h1>
          <p className="text-muted-foreground font-medium">
            {canRequestWarranty 
              ? "Gerencie suas garantias, acompanhe visitas técnicas e visualize laudos."
              : "As garantias serão liberadas automaticamente após a aprovação da vistoria final."
            }
          </p>
        </div>
        
        {canRequestWarranty ? (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Solicitação
          </Button>
        ) : (
          <GatedButton isAllowed={false} tooltipMessage="Garantias serão liberadas após aprovação da vistoria">
            <Plus className="mr-2 h-4 w-4" />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-layout-gap">
          <div className="space-y-layout-gap">
            <Card className="shadow-sm border-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  Minhas Solicitações
                </CardTitle>
                <CardDescription>Histórico de chamados de garantia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {claims.length > 0 ? (
                  claims.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedClaimId(c.id)}
                      className={cn(
                        "p-4 rounded-xl border cursor-pointer transition-all",
                        selectedClaimId === c.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:bg-muted/30"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold truncate">{c.title}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-black">
                        <span>#{c.id.slice(0, 8)}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    Nenhuma solicitação encontrada.
                  </div>
                )}
              </CardContent>
            </Card>
            <WarrantyGuide />
          </div>

          <div className="lg:col-span-2 space-y-layout-gap">
            {selectedClaim ? (
              <div className="space-y-layout-gap">
                <WarrantyStatus status={selectedClaim.status || 'pending'} />
                <WarrantyRequestTimeline request={selectedClaim} />
              </div>
            ) : (
              <Card className="h-full flex flex-col items-center justify-center p-12 text-center border-dashed">
                <ShieldCheck className="h-16 w-16 text-muted-foreground/20 mb-4" />
                <h3 className="text-xl font-bold text-muted-foreground">Selecione uma solicitação</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mt-2">Escolha uma solicitação na lista ao lado para ver os detalhes e acompanhamento.</p>
              </Card>
            )}
          </div>
        </div>
      </FeatureGate>
    </div>
  );
};

export default ClientWarranty;
