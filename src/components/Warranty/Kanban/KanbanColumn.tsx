
import { cn } from "@/lib/utils";
import { WarrantyStage, WarrantyStageConfig, KanbanCardData } from "@/types/warrantyFlow";
import { KanbanCard } from "./KanbanCard";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KanbanColumnProps {
  stage: WarrantyStage;
  config: WarrantyStageConfig;
  cards: KanbanCardData[];
  onCardClick: (cardId: string) => void;
  onDrop: (cardId: string, fromStage: WarrantyStage, toStage: WarrantyStage) => void;
  draggedCard: string | null;
  setDraggedCard: (cardId: string | null) => void;
  draggedFromStage: WarrantyStage | null;
  setDraggedFromStage: (stage: WarrantyStage | null) => void;
}

export function KanbanColumn({
  stage,
  config,
  cards,
  onCardClick,
  onDrop,
  draggedCard,
  setDraggedCard,
  draggedFromStage,
  setDraggedFromStage
}: KanbanColumnProps) {
  // Column color based on stage
  const columnColors: Record<string, string> = {
    blue: "border-t-blue-500",
    amber: "border-t-amber-500",
    purple: "border-t-purple-500",
    indigo: "border-t-indigo-500",
    green: "border-t-emerald-500",
    red: "border-t-red-500",
    orange: "border-t-orange-500",
    emerald: "border-t-emerald-600"
  };

  const handleDragStart = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (card?.dragDisabled) return;
    
    setDraggedCard(cardId);
    setDraggedFromStage(stage);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-primary/5");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-primary/5");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-primary/5");
    
    if (draggedCard && draggedFromStage && draggedFromStage !== stage) {
      onDrop(draggedCard, draggedFromStage, stage);
    }
    
    setDraggedCard(null);
    setDraggedFromStage(null);
  };

  // Count by SLA status
  const expiredCount = cards.filter(c => c.slaInfo.status === "expired").length;
  const warningCount = cards.filter(c => c.slaInfo.status === "warning").length;

  return (
    <div 
      className={cn(
        "flex flex-col bg-muted/30 rounded-lg border-t-4 min-w-[280px] max-w-[320px]",
        columnColors[config.color] || "border-t-muted"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{config.label}</h3>
          <Badge variant="secondary" className="text-xs">
            {cards.length}
          </Badge>
        </div>
        
        {/* SLA alerts */}
        {(expiredCount > 0 || warningCount > 0) && (
          <div className="flex gap-2 mt-2">
            {expiredCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {expiredCount} atrasado{expiredCount > 1 ? 's' : ''}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-100">
                {warningCount} em alerta
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {/* Cards */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {cards.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
              Nenhuma solicitação
            </div>
          ) : (
            cards.map(card => (
              <div
                key={card.id}
                draggable={!card.dragDisabled}
                onDragStart={() => handleDragStart(card.id)}
                onDragEnd={() => {
                  setDraggedCard(null);
                  setDraggedFromStage(null);
                }}
              >
                <KanbanCard
                  data={card}
                  isDragging={draggedCard === card.id}
                  onClick={() => onCardClick(card.id)}
                />
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
