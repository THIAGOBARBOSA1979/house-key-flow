import { useState, useMemo, useEffect } from "react";
import { 
  WarrantyStage, 
  WarrantyFilters, 
  WARRANTY_STAGES,
  WarrantyRequestFlow,
  KanbanCardData
} from "@/types/warrantyFlow";
import { useWarranty } from "@/hooks";
import { warrantyFlowService, warrantyAutomationService } from "@/services";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { KanbanFilters } from "./KanbanFilters";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RefreshCw, AlertCircle, LayoutGrid, List, CheckSquare, MoveRight, UserCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScheduleInspectionForm } from "@/components/inspection/ScheduleInspectionForm";
import { cn } from "@/lib/utils";


// Kanban columns configuration (excluding rejected for main flow)
const KANBAN_COLUMNS: WarrantyStage[] = [
  "opened",
  "in_analysis",
  "inspection_scheduled",
  "inspection_completed",
  "approved",
  "in_execution",
  "completed"
];

interface WarrantyKanbanProps {
  onSelectRequest?: (request: WarrantyRequestFlow) => void;
}

export function WarrantyKanban({ onSelectRequest }: WarrantyKanbanProps) {
  const { toast } = useToast();
  const { 
    kanbanData, 
    isLoading, 
    filters, 
    setFilters, 
    refresh: loadData,
    requests
  } = useWarranty();
  
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [draggedFromStage, setDraggedFromStage] = useState<WarrantyStage | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  
  // Transition dialog state
  const [transitionDialog, setTransitionDialog] = useState<{
    open: boolean;
    cardIds: string[];
    fromStage: WarrantyStage;
    toStage: WarrantyStage;
    requiresNotes: boolean;
  }>({
    open: false,
    cardIds: [],
    fromStage: "opened",
    toStage: "opened",
    requiresNotes: false
  });
  const [transitionNotes, setTransitionNotes] = useState("");

  const filteredKanbanData = kanbanData;

  // Get unique values for filters
  const allCards = requests;
  const categories = [...new Set(allCards.map(r => r.category))];
  const properties = [...new Set(allCards.map(r => ({ 
    id: r.propertyId, 
    name: r.propertyName 
  })))];
  const technicians = [...new Set(allCards
    .filter(r => r.assignedTo)
    .map(r => ({ 
      id: r.assignedTo!, 
      name: r.assignedToName! 
    })))];

  // Check if transition requires notes
  const transitionRequiresNotes = (toStage: WarrantyStage): boolean => {
    return ["inspection_completed", "approved", "rejected", "in_execution", "completed"].includes(toStage);
  };

  // Handle card drop
  const handleDrop = (cardId: string, fromStage: WarrantyStage, toStage: WarrantyStage) => {
    if (fromStage === toStage) return;
    
    // Check for special case: moving to inspection_scheduled
    if (toStage === "inspection_scheduled") {
      const request = warrantyFlowService.getRequestSync(cardId);
      if (request) {
        setTransitionDialog({
          open: true,
          cardIds: [cardId],
          fromStage,
          toStage,
          requiresNotes: false // We'll show the scheduling form instead
        });
        return;
      }
    }

    const requiresNotes = transitionRequiresNotes(toStage);
    
    if (requiresNotes) {
      setTransitionDialog({
        open: true,
        cardIds: [cardId],
        fromStage,
        toStage,
        requiresNotes: true
      });
    } else {
      executeTransition([cardId], fromStage, toStage, "");
    }
  };

  // Handle Bulk Move
  const handleBulkMove = (toStage: WarrantyStage) => {
    if (selectedCards.size === 0) return;
    
    const ids = Array.from(selectedCards);
    const requiresNotes = transitionRequiresNotes(toStage);
    
    if (requiresNotes) {
      setTransitionDialog({
        open: true,
        cardIds: ids,
        fromStage: "opened",
        toStage,
        requiresNotes: true
      });
    } else {
      executeTransition(ids, "opened", toStage, "Movimentação em massa");
    }
  };

  const handleBulkAssign = (techId: string, techName: string) => {
    if (selectedCards.size === 0) return;
    const ids = Array.from(selectedCards);
    let successCount = 0;
    ids.forEach(id => {
      const result = warrantyFlowService.assignTechnician(id, techId, techName, 'admin-1');
      if (result.success) successCount++;
    });
    if (successCount > 0) {
      toast({ title: `${successCount} solicitações atribuídas`, description: `Técnico: ${techName}` });
      loadData();
      setSelectedCards(new Set());
    }
  };

  const toggleSelection = (cardId: string) => {
    const newSelection = new Set(selectedCards);
    if (newSelection.has(cardId)) {
      newSelection.delete(cardId);
    } else {
      newSelection.add(cardId);
    }
    setSelectedCards(newSelection);
  };


  // Execute status transition
  const executeTransition = (
    cardIds: string[], 
    fromStage: WarrantyStage, 
    toStage: WarrantyStage, 
    notes: string
  ) => {
    let successCount = 0;
    let lastError = "";

    cardIds.forEach(cardId => {
      const result = warrantyAutomationService.onKanbanDrop(
        cardId,
        fromStage,
        toStage,
        "admin-1" // In real app, get from auth context
      );
      if (result.success) successCount++;
      else lastError = result.error || "Erro desconhecido";
    });
    
    if (successCount > 0) {
      toast({
        title: successCount > 1 ? `${successCount} protocolos atualizados` : "Sincronização de Status Efetuada",
        description: `O fluxo avançou para a etapa estratégica: ${WARRANTY_STAGES[toStage].label}`

      });
      loadData(); // Refresh data
      setSelectedCards(new Set()); // Clear selection
    } else {
      toast({
        title: "Erro ao atualizar",
        description: lastError || "Não foi possível atualizar o status.",
        variant: "destructive"
      });
    }
    
    setTransitionDialog(prev => ({ ...prev, open: false }));
    setTransitionNotes("");
  };

  // Handle card click
  const handleCardClick = (cardId: string) => {
    const request = warrantyFlowService.getRequestSync(cardId);
    if (request && onSelectRequest) {
      onSelectRequest(request);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Count totals
  const totalCards = Array.from(filteredKanbanData.values()).reduce((acc, cards: KanbanCardData[]) => acc + cards.length, 0);
  const expiredCards = Array.from(filteredKanbanData.values()).flat().filter((c: any) => c.slaInfo.status === "expired").length;


  return (
    <div className="space-y-4">
      {/* Filters */}
      <KanbanFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
        properties={properties}
        technicians={technicians}
      />
      
      {/* SLA Alert */}
      {expiredCards > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-black">Protocolo de Emergência: SLAs Excedidos</AlertTitle>
          <AlertDescription>
            {expiredCards} solicitaç{expiredCards > 1 ? 'ões' : 'ão'} com prazo SLA excedido.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Stats and View Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{totalCards} solicitaç{totalCards !== 1 ? 'ões' : 'ão'} encontrada{totalCards !== 1 ? 's' : ''}</span>
          
          <div className="flex bg-muted rounded-lg p-1 border">
            <Button 
              variant={viewMode === "kanban" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-8 px-3 gap-2"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden md:inline">Kanban</span>
            </Button>
            <Button 
              variant={viewMode === "list" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-8 px-3 gap-2"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
              <span className="hidden md:inline">Lista</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedCards.size > 0 && (
            <div className="flex items-center gap-2 mr-2 animate-in slide-in-from-right-2">
              <Badge variant="secondary" className="h-8 px-3">
                {selectedCards.size} selecionado{selectedCards.size > 1 ? 's' : ''}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-2 border-primary/30 text-primary">
                    <MoveRight className="h-4 w-4" />
                    Mover Seleção
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mover para etapa...</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {KANBAN_COLUMNS.map(stage => (
                    <DropdownMenuItem 
                      key={stage} 
                      onClick={() => handleBulkMove(stage)}
                      className="gap-2"
                    >
                      <div className={cn("w-2 h-2 rounded-full", `bg-${WARRANTY_STAGES[stage].color}-500`)} />
                      {WARRANTY_STAGES[stage].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-2 border-primary/30 text-primary">
                    <UserCheck className="h-4 w-4" />
                    Atribuir Técnico
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Selecionar Técnico...</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {technicians.map(tech => (
                    <DropdownMenuItem 
                      key={tech.id} 
                      onClick={() => handleBulkAssign(tech.id, tech.name)}
                      className="gap-2"
                    >
                      {tech.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-muted-foreground"
                onClick={() => setSelectedCards(new Set())}
              >
                Cancelar
              </Button>
            </div>
          )}
          
          <Button variant="ghost" size="sm" onClick={loadData} className="h-8 gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>
      
      {/* Main View Area */}
      {viewMode === "kanban" ? (
        <ScrollArea className="w-full whitespace-nowrap rounded-xl touch-pan-x">
          <div className="flex gap-4 sm:gap-6 pb-6 min-h-[600px] p-1">
            {KANBAN_COLUMNS.map(stage => (
              <KanbanColumn
                key={stage}
                stage={stage}
                config={WARRANTY_STAGES[stage]}
                cards={filteredKanbanData.get(stage) || []}
                onCardClick={handleCardClick}
                onDrop={handleDrop}
                draggedCard={draggedCard}
                setDraggedCard={setDraggedCard}
                draggedFromStage={draggedFromStage}
                setDraggedFromStage={setDraggedFromStage}
                selectedCards={selectedCards}
                onToggleSelection={toggleSelection}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="bg-muted/30" />
        </ScrollArea>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(filteredKanbanData.values()).flat().sort((a, b) => {
              // Sort by urgency in list view
              const urgencyA = a.slaInfo.status === "expired" ? 0 : a.slaInfo.status === "warning" ? 1 : 2;
              const urgencyB = b.slaInfo.status === "expired" ? 0 : b.slaInfo.status === "warning" ? 1 : 2;
              return urgencyA - urgencyB;
            }).map(card => (
              <div key={card.id} className="relative group">
                <KanbanCard
                  data={card}
                  onClick={() => handleCardClick(card.id)}
                  selected={selectedCards.has(card.id)}
                  onToggleSelection={(e) => {
                    e.stopPropagation();
                    toggleSelection(card.id);
                  }}
                  showSelection
                />
              </div>
            ))}
          </div>
          {totalCards === 0 && (
            <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
              <List className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground">Nenhuma solicitação encontrada com os filtros atuais.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Transition Notes Dialog */}
      <Dialog 
        open={transitionDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setTransitionDialog(prev => ({ ...prev, open: false }));
            setTransitionNotes("");
          }
        }}
      >
        <DialogContent className={cn(
          "w-[95vw] sm:max-w-lg p-0 overflow-hidden rounded-[1.5rem] sm:rounded-2xl border-none shadow-sem-xl",
          transitionDialog.toStage === "inspection_scheduled" && transitionDialog.cardIds.length === 1 && "sm:max-w-[600px]"
        )}>
          <DialogHeader className="p-4 sm:p-6 pb-0">
            <DialogTitle>
              {transitionDialog.toStage === "inspection_scheduled" && transitionDialog.cardIds.length === 1
                ? "Configurar Cronograma para Transição de Status" 
                : transitionDialog.cardIds.length > 1
                  ? `Homologar transição de ${transitionDialog.cardIds.length} itens para ${WARRANTY_STAGES[transitionDialog.toStage]?.label}`
                  : `Confirmar evolução para ${WARRANTY_STAGES[transitionDialog.toStage]?.label}`

              }
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-4 sm:p-6 space-y-4">
            {transitionDialog.toStage === "inspection_scheduled" && transitionDialog.cardIds.length === 1 ? (
              <div className="py-2">
                {/* Reusing existing scheduling form */}
                <ScheduleInspectionForm 
                  requestId={transitionDialog.cardIds[0]}
                  onSuccess={() => {
                    toast({
                      title: "Vistoria agendada e status atualizado",
                      description: "A solicitação foi movida para agendamento de vistoria."
                    });
                    loadData();
                    setTransitionDialog(prev => ({ ...prev, open: false }));
                  }}
                  propertyInfo={(() => {
                    const req = warrantyFlowService.getRequestSync(transitionDialog.cardIds[0]);
                    return req ? {
                      property: req.propertyName,
                      unit: req.unitNumber,
                      client: req.clientName
                    } : undefined;
                  })()}
                />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={transitionNotes}
                    onChange={(e) => setTransitionNotes(e.target.value)}
                    placeholder="Adicione observações sobre esta mudança de status..."
                    rows={3}
                  />
                  {transitionDialog.cardIds.length > 1 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      * Observação aplicada a todos os itens selecionados.
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setTransitionDialog(prev => ({ ...prev, open: false }));
                      setTransitionNotes("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => executeTransition(
                      transitionDialog.cardIds,
                      transitionDialog.fromStage,
                      transitionDialog.toStage,
                      transitionNotes
                    )}
                  >
                    Confirmar
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
