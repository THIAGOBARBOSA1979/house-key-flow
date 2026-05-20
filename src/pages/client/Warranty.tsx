import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Plus, MessageSquare, Calendar, AlertTriangle, Clock, ArrowRight, Lock, History, Star, CheckCircle, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/Shared/StatsCard";
import { ResponsiveGrid } from "@/components/Shared/ResponsiveGrid";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/Shared/StatusBadge";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { isValid } from "date-fns";
import { safeFormat } from "@/lib/utils";
import { EnhancedWarrantyRequestForm } from "@/components/Warranty/EnhancedWarrantyRequestForm";
import { WarrantyItemSelector } from "@/components/Warranty/WarrantyItemSelector";
import { useToast } from "@/components/ui/use-toast";
import { WarrantyItem } from "@/types/warranty";
import { 
  warrantyValidationService, 
  eventAutomationService, 
  warrantyFlowService 
} from "@/services";
import { FeatureGate, GatedButton } from "@/components/ClientFlow/FeatureGate";
import { useClientStage } from "@/hooks";
import { WarrantyRequestTimeline, WarrantyRequestList } from "@/components/Warranty/ClientTimeline/WarrantyRequestTimeline";
import { useAuth } from "@/contexts/AuthContext";
import { SatisfactionSurvey } from "@/components/Warranty/SatisfactionSurvey";

// Warranty requests are fetched from warrantyFlowService

// Warranty categories
const categories = [
  "Hidráulica",
  "Elétrica",
  "Estrutural", 
  "Vedação e Impermeabilização",
  "Acabamento",
  "Esquadrias",
  "Equipamentos",
  "Outros"
];

const WarrantyGuide = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        Guia de Garantias
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <h3 className="font-medium">Garantias Cobertas:</h3>
        <ul className="mt-2 space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="font-medium">5 anos:</span> 
            <span className="text-muted-foreground">Problemas estruturais</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium">3 anos:</span> 
            <span className="text-muted-foreground">Impermeabilização</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium">2 anos:</span> 
            <span className="text-muted-foreground">Instalações hidráulicas e elétricas</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium">1 ano:</span> 
            <span className="text-muted-foreground">Acabamentos</span>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="font-medium">Não Cobertos:</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>Danos causados por uso inadequado</li>
          <li>Desgaste natural dos materiais</li>
          <li>Modificaç��es feitas pelo proprietário</li>
          <li>Manutenção inadequada</li>
        </ul>
      </div>
    </CardContent>
    <CardFooter>
      <Button variant="outline" className="w-full" onClick={() => {
        // Toast is not available in this static component
      }}>
        Ver manual completo de garantias
      </Button>
    </CardFooter>
  </Card>
);

const WarrantyStatus = ({ status }: { status: "pending" | "progress" | "complete" | "critical" }) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-status-pending",
      bg: "bg-status-pending/10",
      border: "border-status-pending/20",
      text: "Aguardando Análise",
      description: "Sua solicitação foi registrada e está aguardando análise da equipe técnica."
    },
    progress: {
      icon: MessageSquare,
      color: "text-status-progress",
      bg: "bg-status-progress/10",
      border: "border-status-progress/20",
      text: "Em Atendimento",
      description: "Um técnico foi designado e está trabalhando na sua solicitação."
    },
    complete: {
      icon: ShieldCheck,
      color: "text-status-complete",
      bg: "bg-status-complete/10",
      border: "border-status-complete/20",
      text: "Finalizado",
      description: "O atendimento foi concluído com sucesso."
    },
    critical: {
      icon: AlertTriangle,
      color: "text-status-critical",
      bg: "bg-status-critical/10",
      border: "border-status-critical/20",
      text: "Crítico",
      description: "Sua solicitação foi classificada como crítica e está sendo tratada com prioridade."
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`p-5 ${config.bg} border-2 ${config.border} rounded-2xl shadow-sm animate-in slide-in-from-top-2 duration-500`}>
      <div className="flex gap-4 items-center">
        <div className={cn("p-3 rounded-xl bg-white shadow-sm", config.color)}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-black text-base tracking-tight">{config.text}</h3>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">{config.description}</p>
        </div>
      </div>
    </div>
  );
};

const ClientWarranty = () => {
  const [searchParams] = useSearchParams();
  const inspectionId = searchParams.get("inspectionId");
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWarrantyItem, setSelectedWarrantyItem] = useState<WarrantyItem | null>(null);
  const [requestStep, setRequestStep] = useState<"select_item" | "fill_form">("select_item");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [addInfoDialogOpen, setAddInfoDialogOpen] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState("");

  useEffect(() => {
    if (inspectionId) {
      setIsDialogOpen(true);
      setRequestStep("fill_form");
      toast({
        title: "Reportando Defeito",
        description: `Iniciando chamado vinculado à vistoria #${inspectionId}`,
      });
    }
  }, [inspectionId]);
  const [commentText, setCommentText] = useState("");
  const [surveyDone, setSurveyDone] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const allClaims = useMemo(() => warrantyFlowService.getClientRequests(user?.id || "client-1").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [user?.id]);
  const [claims, setClaims] = useState<any[]>(allClaims);
  const { toast } = useToast();
  
  // Mock client ID - in real app, get from auth context
  // const { user } = useAuth();
  const clientId = user?.id || "client-1";
  
  // Get client stage permissions
  const { canRequestWarranty, permissions, stage, isLoading } = useClientStage(clientId);
  
  const claim = selectedClaim 
    ? claims.find(c => c.id === selectedClaim) 
    : null;

  const handleCancelClaim = () => {
    if (!selectedClaim || !user?.id) return;
    const success = warrantyFlowService.cancelRequest(selectedClaim, user.id);
    if (success) {
      setClaims(prev => prev.filter(c => c.id !== selectedClaim));
      setSelectedClaim(null);
      setCancelDialogOpen(false);
      toast({ title: "Solicitação cancelada", description: "Sua solicitação de garantia foi cancelada com sucesso." });
    }
  };

  const handleAddInfo = () => {
    if (!additionalInfo.trim() || !selectedClaim || !user?.id) return;
    const result = warrantyFlowService.addUpdate(
      selectedClaim, 
      user.id, 
      user.name || "Cliente", 
      additionalInfo
    );
    if (result.success) {
      setClaims(prev => prev.map(c => c.id === selectedClaim ? result.request : c));
      setAdditionalInfo("");
      setAddInfoDialogOpen(false);
      toast({ title: "Informações adicionadas", description: "As informações foram anexadas à sua solicitação." });
    }
  };

  const handleSendComment = () => {
    if (!commentText.trim() || !selectedClaim || !user?.id) return;
    const result = warrantyFlowService.addUpdate(
      selectedClaim, 
      user.id, 
      user.name || "Cliente", 
      commentText
    );
    if (result.success) {
      setClaims(prev => prev.map(c => c.id === selectedClaim ? result.request : c));
      setCommentText("");
      toast({ title: "Comentário enviado", description: "Seu comentário foi adicionado ao histórico." });
    }
  };

  // Handle form submission with validation
  const handleSubmit = (data: any) => {
    if (!selectedWarrantyItem) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um item de garantia.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate with service
    const result = warrantyValidationService.validateAndCreateRequest(
      selectedWarrantyItem.id,
      clientId,
      {
        title: data.title,
        problems: data.problems,
        additionalInfo: data.additionalInfo,
      }
    );
    
    if (!result.success) {
      toast({
        title: "Erro na solicitação",
        description: (result as { success: false; error: { error: string } }).error.error,
        variant: "destructive"
      });
      return;
    }
    
    // Trigger event automation for warranty request
    eventAutomationService.onWarrantyRequested(
      result.request.id,
      clientId,
      selectedWarrantyItem.name
    );
    
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação de garantia foi enviada com sucesso."
    });
    console.log("Created request:", result.request);
    
    // Reset and close dialog
    setIsDialogOpen(false);
    setSelectedWarrantyItem(null);
    setRequestStep("select_item");
  };
  
  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    if (!canRequestWarranty) {
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
  
  // Handle item selection
  const handleItemSelect = (item: WarrantyItem | null) => {
    setSelectedWarrantyItem(item);
  };
  
  // Proceed to form step
  const handleProceedToForm = () => {
    if (selectedWarrantyItem) {
      setRequestStep("fill_form");
    }
  };
  
  // Go back to item selection
  const handleBackToSelection = () => {
    setRequestStep("select_item");
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
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl">
              <ShieldCheck className="h-6 w-6 text-primary" strokeWidth={3} />
            </div>
            Assistência Técnica
            {!canRequestWarranty && (
              <Lock className="h-5 w-5 text-muted-foreground ml-2" />
            )}
          </h1>
          <p className="text-muted-foreground font-medium">
            {canRequestWarranty 
              ? "Gerencie suas garantias, acompanhe visitas técnicas e visualize laudos."
              : "As garantias serão liberadas automaticamente após a aprovação da vistoria final."
            }
          </p>
        </div>
        
        {/* Conditionally render button based on permissions */}
        {canRequestWarranty ? (
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Solicitação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-dialog-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {requestStep === "select_item" 
                  ? "Selecione o Item de Garantia" 
                  : `Nova Solicitação - ${selectedWarrantyItem?.name}`}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {requestStep === "select_item" 
                  ? "Escolha o item para o qual deseja abrir uma solicitação de garantia. Apenas itens com garantia ativa estão disponíveis."
                  : "Preencha os detalhes da sua solicitação para que possamos analisar e atender da melhor forma."}
              </p>
            </DialogHeader>
            
            {requestStep === "select_item" ? (
              <div className="space-y-4">
                <WarrantyItemSelector
                  clientId={clientId}
                  selectedItemId={selectedWarrantyItem?.id || null}
                  onSelectItem={handleItemSelect}
                  showIneligible={true}
                />
                
                <div className="flex justify-end gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleDialogClose(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleProceedToForm}
                    disabled={!selectedWarrantyItem}
                  >
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToSelection}
                  className="mb-2"
                >
                  ← Voltar para seleção
                </Button>
                <EnhancedWarrantyRequestForm 
                  onSubmit={handleSubmit} 
                  onCancel={handleBackToSelection}
                  selectedItem={selectedWarrantyItem}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
        ) : (
          <GatedButton 
            isAllowed={false} 
            tooltipMessage="Garantias serão liberadas após aprovação da vistoria"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Solicitação
          </GatedButton>
        )}
      </div>

      {/* Feature Gate for warranty content */}
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
            value={`${warrantyFlowService.calculateMetrics().slaComplianceRate}%`} 
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
          {/* Left column */}
          <div className="space-y-layout-gap">
            <Card className="shadow-sm border-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Minhas Solicitações
                </CardTitle>
                <CardDescription>
                  Histórico de chamados de garantia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {claims.length > 0 ? (
                  claims.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedClaim === item.id 
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                          : "hover:bg-accent/50 border-border/50"
                      }`}
                      onClick={() => setSelectedClaim(item.id)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold truncate text-foreground/90">{item.title}</h3>
                          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1">{item.category}</p>
                        </div>
                        <StatusBadge status={item.currentStage || item.status} />
                      </div>
                      <div className="flex items-center justify-between mt-4 text-[11px] font-medium text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{safeFormat(item.createdAt, "dd/MM/yyyy")}</span>
                        </div>
                        <span className="bg-muted px-1.5 py-0.5 rounded italic">#{item.id.substring(0, 6)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 px-4 bg-muted/20 rounded-2xl border border-dashed flex flex-col items-center">
                    <ShieldCheck className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-bold text-muted-foreground">Nenhuma solicitação aberta</p>
                    <p className="text-xs text-muted-foreground/60 mt-1 text-center">Quando você abrir um chamado de garantia, ele aparecerá aqui para acompanhamento.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          
          <WarrantyGuide />
        </div>
        
        {/* Right column - Claim Details */}
        <div className="lg:col-span-2">
          {claim ? (
            <Tabs defaultValue="details" className="animate-in fade-in slide-in-from-right-4 duration-500">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-2xl">
                <TabsTrigger value="details" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Detalhes</TabsTrigger>
                <TabsTrigger value="timeline" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Linha do Tempo</TabsTrigger>
                <TabsTrigger value="updates" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Atualizações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                          {claim.title}
                        </CardTitle>
                        <CardDescription>
                          Solicitação criada em {safeFormat(claim.createdAt, "dd 'de' MMMM 'de' yyyy")}
                        </CardDescription>
                      </div>
                      <StatusBadge status={claim.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <WarrantyStatus status={claim.status} />
                    
                    {claim.status === 'complete' && !surveyDone[claim.id] && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <SatisfactionSurvey 
                          requestId={claim.id} 
                          onComplete={() => setSurveyDone(prev => ({ ...prev, [claim.id]: true }))} 
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Detalhes da Solicitação</h3>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="p-3 bg-muted/30 rounded-xl">
                              <span className="text-[10px] font-black uppercase text-muted-foreground block">Categoria</span>
                              <p className="font-bold text-sm">{claim.category}</p>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-xl">
                              <span className="text-[10px] font-black uppercase text-muted-foreground block">Imóvel</span>
                              <p className="font-bold text-sm">{claim.propertyName || claim.property} - Unidade {claim.unitNumber || claim.unit}</p>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-xl">
                              <span className="text-[10px] font-black uppercase text-muted-foreground block">Protocolo</span>
                              <p className="font-bold text-sm">#{claim.id.substring(0, 8).toUpperCase()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Breakdown de Problemas</h3>
                          <div className="space-y-2">
                            {claim.problems && claim.problems.length > 0 ? (
                              claim.problems.map((prob: any) => (
                                <div key={prob.id} className="p-4 border border-border/50 rounded-xl bg-card flex justify-between items-center shadow-sm">
                                  <div>
                                    <p className="font-bold text-sm">{prob.description}</p>
                                    <div className="flex gap-2 mt-1">
                                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase">{prob.location}</span>
                                      <span className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                                        prob.severity === 'severe' ? "text-red-600 bg-red-50" : "text-amber-600 bg-amber-50"
                                      )}>
                                        {prob.severity === 'severe' ? 'Alta' : 'Média'}
                                      </span>
                                    </div>
                                  </div>
                                  <Badge variant={prob.status === 'resolved' ? 'default' : 'outline'} className={cn(
                                    "font-black text-[10px] uppercase h-6",
                                    prob.status === 'resolved' ? "bg-emerald-500" : "text-amber-600 border-amber-200"
                                  )}>
                                    {prob.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                                  </Badge>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground italic bg-muted/10 p-4 rounded-xl border border-dashed text-center">Nenhum detalhe adicional informado.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Descrição Original</h3>
                          <div className="p-4 bg-muted/20 rounded-2xl border border-border/50">
                            <p className="text-sm leading-relaxed font-medium text-foreground/80 italic">"{claim.description}"</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Próximos passos</h3>
                          <div className="space-y-2">
                            {[
                              "Aguarde a análise da equipe técnica em até 72h",
                              "Um técnico poderá entrar em contato via WhatsApp/Telefone",
                              "Você receberá notificações em tempo real sobre o status"
                            ].map((step, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-white border border-border/30 rounded-xl">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">{i+1}</div>
                                <span className="text-sm font-medium">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-border/40 pt-6 px-6 pb-6">
                    <Button variant="ghost" className="text-status-critical hover:bg-red-50 hover:text-red-700 font-bold" onClick={() => setCancelDialogOpen(true)}>
                      Cancelar chamado
                    </Button>
                    <Button onClick={() => setAddInfoDialogOpen(true)} className="rounded-xl font-bold shadow-sem-md">
                      Adicionar informações
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="timeline" className="pt-4">
                <WarrantyRequestTimeline request={claim} />
              </TabsContent>
              
              <TabsContent value="updates" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Atualizações</CardTitle>
                    <CardDescription>
                      Acompanhe as atualizações da sua solicitação
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {claim.updates.map((update, index) => (
                        <div key={update.id} className="relative pl-6 pb-4">
                          {index < claim.updates.length - 1 && (
                            <div className="absolute top-6 bottom-0 left-3 w-px bg-border -translate-x-1/2" />
                          )}
                          
                          <div className="absolute top-1 left-0 w-5 h-5 rounded-full border-2 border-primary bg-background" />
                          
                          <div className="space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <p className="font-medium">{update.author}</p>
                              <p className="text-sm text-muted-foreground">
                                {safeFormat(update.date, "dd/MM/yyyy 'às' HH:mm")}
                              </p>
                            </div>
                            <p className="text-sm">
                              {update.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t">
                      <h3 className="font-medium mb-2">Adicionar comentário</h3>
                      <div className="space-y-3">
                        <Textarea 
                          placeholder="Digite seu comentário ou dúvida..." 
                          rows={3}
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                        />
                        <Button className="w-full" onClick={handleSendComment} disabled={!commentText.trim()}>
                          Enviar comentário
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="h-full flex flex-col justify-center items-center py-12">
              <ShieldCheck className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhuma solicitação selecionada</h3>
              <p className="text-muted-foreground max-w-md text-center mt-1">
                Selecione uma solicitação na lista ao lado ou crie uma nova solicitação de garantia para seu imóvel.
              </p>
              <Button 
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Solicitação
              </Button>
            </Card>
          )}
        </div>
      </div>
      </FeatureGate>

      {/* Cancel confirmation dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Solicitação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar esta solicitação de garantia? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Voltar</Button>
            <Button variant="destructive" onClick={handleCancelClaim}>Confirmar Cancelamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add info dialog */}
      <Dialog open={addInfoDialogOpen} onOpenChange={setAddInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Informações</DialogTitle>
            <DialogDescription>
              Adicione informações complementares à sua solicitação de garantia.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Descreva as informações adicionais..."
            value={additionalInfo}
            onChange={e => setAdditionalInfo(e.target.value)}
            rows={4}
          />
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setAddInfoDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddInfo} disabled={!additionalInfo.trim()}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientWarranty;
