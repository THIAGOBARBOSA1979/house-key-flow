
import { useState, useEffect, useMemo } from "react";
import { 
  WarrantyStage, 
  WarrantyFilters, 
  KanbanCardData,
  WARRANTY_STAGES,
  STAGE_ORDER,
  WarrantyRequestFlow
} from "@/types/warrantyFlow";
import { warrantyFlowService } from "@/services/WarrantyFlowService";
import { warrantyAutomationService } from "@/services/WarrantyAutomationService";
import { warrantySLAService } from "@/services/WarrantySLAService";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanFilters } from "./KanbanFilters";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [filters, setFilters] = useState<WarrantyFilters>({});
  const [kanbanData, setKanbanData] = useState<Map<WarrantyStage, KanbanCardData[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [draggedFromStage, setDraggedFromStage] = useState<WarrantyStage | null>(null);
  
  // Transition dialog state
  const [transitionDialog, setTransitionDialog] = useState<{
    open: boolean;
    cardId: string;
    fromStage: WarrantyStage;
    toStage: WarrantyStage;
    requiresNotes: boolean;
  }>({
    open: false,
    cardId: "",
    fromStage: "opened",
    toStage: "opened",
    requiresNotes: false
  });
  const [transitionNotes, setTransitionNotes] = useState("");

  // Load data
  const loadData = () => {
    setIsLoading(true);
    try {
      const data = warrantyFlowService.getKanbanData();
      setKanbanData(data);
    } catch (error) {
      console.error("Error loading Kanban data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as solicitações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter cards
  const filteredKanbanData = useMemo(() => {
    const filtered = new Map<WarrantyStage, KanbanCardData[]>();
    
    kanbanData.forEach((cards, stage) => {
      let filteredCards = [...cards];
      
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filteredCards = filteredCards.filter(card =>
          card.request.title.toLowerCase().includes(search) ||
          card.request.clientName.toLowerCase().includes(search) ||
          card.request.propertyName.toLowerCase().includes(search)
        );
      }
      
      if (filters.slaStatus) {
        filteredCards = filteredCards.filter(card => 
          card.slaInfo.status === filters.slaStatus
        );
      }
      
      if (filters.priority) {
        filteredCards = filteredCards.filter(card => 
          card.request.priority === filters.priority
        );
      }
      
      if (filters.category) {
        filteredCards = filteredCards.filter(card => 
          card.request.category === filters.category
        );
      }
      
      if (filters.propertyId) {
        filteredCards = filteredCards.filter(card => 
          card.request.propertyId === filters.propertyId
        );
      }
      
      if (filters.assignedTo) {
        filteredCards = filteredCards.filter(card => 
          card.request.assignedTo === filters.assignedTo
        );
      }
      
      filtered.set(stage, filteredCards);
    });
    
    return filtered;
  }, [kanbanData, filters]);

  // Get unique values for filters
  const allCards = Array.from(kanbanData.values()).flat();
  const categories = [...new Set(allCards.map(c => c.request.category))];
  const properties = [...new Set(allCards.map(c => ({ 
    id: c.request.propertyId, 
    name: c.request.propertyName 
  })))];
  const technicians = [...new Set(allCards
    .filter(c => c.request.assignedTo)
    .map(c => ({ 
      id: c.request.assignedTo!, 
      name: c.request.assignedToName! 
    })))];

  // Check if transition requires notes
  const transitionRequiresNotes = (toStage: WarrantyStage): boolean => {
    return ["inspection_completed", "approved", "rejected", "in_execution", "completed"].includes(toStage);
  };

  // Handle card drop
  const handleDrop = (cardId: string, fromStage: WarrantyStage, toStage: WarrantyStage) => {
    if (fromStage === toStage) return;
    
    const requiresNotes = transitionRequiresNotes(toStage);
    
    if (requiresNotes) {
      setTransitionDialog({
        open: true,
        cardId,
        fromStage,
        toStage,
        requiresNotes: true
      });
    } else {
      executeTransition(cardId, fromStage, toStage, "");
    }
  };

  // Execute status transition
  const executeTransition = (
    cardId: string, 
    fromStage: WarrantyStage, 
    toStage: WarrantyStage, 
    notes: string
  ) => {
    const result = warrantyAutomationService.onKanbanDrop(
      cardId,
      fromStage,
      toStage,
      "admin-1" // In real app, get from auth context
    );
    
    if (result.success) {
      toast({
        title: "Status atualizado",
        description: `Solicitação movida para ${WARRANTY_STAGES[toStage].label}`
      });
      loadData(); // Refresh data
    } else {
      toast({
        title: "Erro ao atualizar",
        description: result.error || "Não foi possível atualizar o status.",
        variant: "destructive"
      });
    }
    
    setTransitionDialog(prev => ({ ...prev, open: false }));
    setTransitionNotes("");
  };

  // Handle card click
  const handleCardClick = (cardId: string) => {
    const request = warrantyFlowService.getRequest(cardId);
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
  const totalCards = Array.from(filteredKanbanData.values()).reduce((acc, cards) => acc + cards.length, 0);
  const expiredCards = Array.from(filteredKanbanData.values()).flat().filter(c => c.slaInfo.status === "expired").length;

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
          <AlertTitle>Atenção: SLAs Estourados</AlertTitle>
          <AlertDescription>
            {expiredCards} solicitaç{expiredCards > 1 ? 'ões' : 'ão'} com prazo SLA excedido.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Stats bar */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{totalCards} solicitaç{totalCards !== 1 ? 'ões' : 'ão'} encontrada{totalCards !== 1 ? 's' : ''}</span>
        <Button variant="ghost" size="sm" onClick={loadData} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>
      
      {/* Kanban Board */}
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 min-h-[500px]">
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
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirmar mudança para {WARRANTY_STAGES[transitionDialog.toStage]?.label}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={transitionNotes}
                onChange={(e) => setTransitionNotes(e.target.value)}
                placeholder="Adicione observações sobre esta mudança de status..."
                rows={3}
              />
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
                  transitionDialog.cardId,
                  transitionDialog.fromStage,
                  transitionDialog.toStage,
                  transitionNotes
                )}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
