import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Plus, MessageSquare, Calendar, AlertTriangle, Clock, ArrowRight, Lock, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { EnhancedWarrantyRequestForm } from "@/components/Warranty/EnhancedWarrantyRequestForm";
import { WarrantyItemSelector } from "@/components/Warranty/WarrantyItemSelector";
import { useToast } from "@/components/ui/use-toast";
import { WarrantyItem } from "@/types/warranty";
import { warrantyValidationService } from "@/services/WarrantyValidationService";
import { FeatureGate, GatedButton } from "@/components/ClientFlow/FeatureGate";
import { useClientStage } from "@/hooks/useClientStage";
import { eventAutomationService } from "@/services/EventAutomationService";
import { warrantyFlowService } from "@/services/WarrantyFlowService";
import { WarrantyRequestTimeline, WarrantyRequestList } from "@/components/Warranty/ClientTimeline/WarrantyRequestTimeline";

// Mock data
const warrantyClaims = [
  {
    id: "1",
    title: "Infiltração no banheiro",
    description: "Identificada infiltração na parede do box do banheiro social. Já está causando mofo e descascamento da pintura.",
    property: "Edifício Aurora",
    unit: "204",
    createdAt: new Date(2025, 4, 5),
    status: "pending" as const,
    category: "Hidráulica",
    priority: "medium",
    updates: [
      {
        id: "1",
        date: new Date(2025, 4, 5),
        author: "Sistema",
        text: "Solicitação registrada com sucesso.",
      },
      {
        id: "2",
        date: new Date(2025, 4, 6),
        author: "Técnico",
        text: "Solicitação em análise pela equipe técnica.",
      }
    ]
  }
];

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
      <Button variant="outline" className="w-full">
        Ver manual completo de garantias
      </Button>
    </CardFooter>
  </Card>
);

const WarrantyStatus = ({ status }: { status: "pending" | "progress" | "complete" | "critical" }) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50",
      text: "Aguardando Análise",
      description: "Sua solicitação foi registrada e está aguardando análise da equipe técnica."
    },
    progress: {
      icon: MessageSquare,
      color: "text-blue-500",
      bg: "bg-blue-50",
      text: "Em Atendimento",
      description: "Um técnico foi designado e está trabalhando na sua solicitação."
    },
    complete: {
      icon: ShieldCheck,
      color: "text-green-500",
      bg: "bg-green-50",
      text: "Finalizado",
      description: "O atendimento foi concluído com sucesso."
    },
    critical: {
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-50",
      text: "Crítico",
      description: "Sua solicitação foi classificada como crítica e está sendo tratada com prioridade."
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`p-4 ${config.bg} rounded-lg`}>
      <div className="flex gap-3 items-center">
        <Icon className={`h-8 w-8 ${config.color}`} />
        <div>
          <h3 className="font-medium">{config.text}</h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
      </div>
    </div>
  );
};

const ClientWarranty = () => {
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWarrantyItem, setSelectedWarrantyItem] = useState<WarrantyItem | null>(null);
  const [requestStep, setRequestStep] = useState<"select_item" | "fill_form">("select_item");
  const { toast } = useToast();
  
  // Mock client ID - in real app, get from auth context
  const clientId = "client-1";
  
  // Get client stage permissions
  const { canRequestWarranty, permissions, stage, isLoading } = useClientStage(clientId);
  
  const claim = selectedClaim 
    ? warrantyClaims.find(c => c.id === selectedClaim) 
    : null;

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
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-8 w-8" />
            Garantias
            {!canRequestWarranty && (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
          </h1>
          <p className="text-muted-foreground">
            {canRequestWarranty 
              ? "Gerencie solicitações de garantia do seu imóvel"
              : "As garantias serão liberadas após a aprovação da sua vistoria"
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
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Solicitações</CardTitle>
                <CardDescription>
                  Selecione uma solicitação para ver detalhes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {warrantyClaims.length > 0 ? (
                  warrantyClaims.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedClaim === item.id 
                          ? "border-primary bg-primary/5" 
                          : "hover:bg-accent"
                      }`}
                      onClick={() => setSelectedClaim(item.id)}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{item.title}</h3>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(item.createdAt, "dd/MM/yyyy")}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4">
                    <p className="text-muted-foreground">Você ainda não possui solicitações</p>
                  </div>
                )}
              </CardContent>
            </Card>
          
          <WarrantyGuide />
        </div>
        
        {/* Right column - Claim Details */}
        <div className="lg:col-span-2">
          {claim ? (
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="updates">Atualizações</TabsTrigger>
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
                          Solicitação criada em {format(claim.createdAt, "dd 'de' MMMM 'de' yyyy")}
                        </CardDescription>
                      </div>
                      <StatusBadge status={claim.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <WarrantyStatus status={claim.status} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h3 className="font-medium mb-2">Detalhes da Solicitação:</h3>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-muted-foreground">Categoria:</span>
                            <p>{claim.category}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Imóvel:</span>
                            <p>{claim.property} - Unidade {claim.unit}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Protocolo:</span>
                            <p>#{claim.id.padStart(6, '0')}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Descrição:</h3>
                        <p className="text-sm">{claim.description}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <h3 className="font-medium mb-2">Próximos passos:</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-primary" />
                          <span>Aguarde a análise da equipe técnica</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-primary" />
                          <span>Um técnico poderá entrar em contato para agendar uma visita</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-primary" />
                          <span>Você receberá atualizações sobre o status da solicitação</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button variant="outline">
                      Cancelar solicitação
                    </Button>
                    <Button>
                      Adicionar informações
                    </Button>
                  </CardFooter>
                </Card>
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
                                {format(update.date, "dd/MM/yyyy 'às' HH:mm")}
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
                        />
                        <Button className="w-full">
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
    </div>
  );
};

export default ClientWarranty;
