
import { safeFormat } from "@/lib/utils";
import { Calendar, User, MapPin, Eye, MoreVertical, BellRing, Trash2, CalendarClock, Play, ClipboardList } from "lucide-react";
import { checklistService } from "@/services/ChecklistService";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../shared/StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ScheduleInspectionDialog } from "./ScheduleInspectionDialog";
import { StartInspectionDialog } from "./StartInspectionDialog";
import { useToast } from "@/components/ui/use-toast";
import { inspectionService } from "@/services/InspectionService";
import { cn } from "@/lib/utils";

interface InspectionItemProps {
  inspection: {
    id: string;
    property: string;
    unit: string;
    client: string;
    date: Date;
    time: string;
    status: string;
    checklistId?: string;
  };
  onUpdate?: () => void;
}

/**
 * Reusable InspectionItem refactored with Design System tokens.
 */
export const InspectionItem = ({ inspection, onUpdate }: InspectionItemProps) => {
  const { toast } = useToast();
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [startInspectionDialogOpen, setStartInspectionDialogOpen] = useState(false);
  
  const handleViewDetails = () => {
    toast({
      title: "Detalhes da vistoria",
      description: `Vistoria ${inspection.id} • ${inspection.property}, Unidade ${inspection.unit}.`,
    });
  };

  const handleCancelInspection = () => {
    inspectionService.updateStatus(inspection.id, "cancelled");
    toast({
      title: "Vistoria cancelada",
      description: `A vistoria de ${inspection.client} foi cancelada.`,
      variant: "destructive",
    });
    if (onUpdate) onUpdate();
  };

  const handleSendReminder = () => {
    toast({
      title: "Lembrete enviado",
      description: `Notificação enviada para ${inspection.client}.`,
    });
  };

  const handleInspectionComplete = (data: any) => {
    inspectionService.updateStatus(inspection.id, "complete");
    toast({
      title: "Vistoria concluída",
      description: "O status da vistoria foi atualizado para concluído.",
    });
    if (onUpdate) onUpdate();
  };

  const startInspection = () => {
    setStartInspectionDialogOpen(true);
    if (inspection.status === "pending") {
      inspectionService.updateStatus(inspection.id, "progress");
    }
  };

  const checklist = inspection.checklistId ? checklistService.getTemplateById(inspection.checklistId) : null;

  return (
    <div className="relative group">
      <div className="p-4 sm:p-5 flex flex-col md:flex-row gap-4 md:items-center justify-between transition-all duration-300 group-hover:bg-muted/30">
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary shrink-0">
              <MapPin size={14} />
            </div>
            <span className="text-sm font-bold truncate">
              {inspection.property} • <span className="text-primary">Unidade {inspection.unit}</span>
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <User size={12} className="text-muted-foreground/60" />
              <span>{inspection.client}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Calendar size={12} className="text-muted-foreground/60" />
              <span>{safeFormat(inspection.date, "dd/MM/yyyy")} às {inspection.time}</span>
            </div>
            {checklist && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary/80 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                <ClipboardList size={10} />
                <span className="truncate max-w-[150px] uppercase tracking-tighter">{checklist.title}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 items-center shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0">
          <StatusBadge status={inspection.status as any} size="sm" showIcon />
          
          <div className="flex gap-2 items-center">
            {(inspection.status === "pending" || inspection.status === "progress") && (
              <Button 
                variant="default" 
                size="sm"
                onClick={startInspection}
                className="h-9 px-4 text-xs font-bold bg-primary hover:bg-primary/90 transition-all active:scale-95 shadow-md rounded-xl"
              >
                <Play className="h-3.5 w-3.5 mr-2 fill-current" /> 
                {inspection.status === "progress" ? "Continuar" : "Iniciar"}
              </Button>
            )}

            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleViewDetails}
              className="h-9 px-3 text-xs font-bold hover:bg-primary/5 hover:text-primary transition-all active:scale-95 rounded-xl border border-transparent hover:border-primary/20"
            >
              <Eye className="h-3.5 w-3.5 mr-2" /> 
              Visualizar
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted transition-all">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl animate-in zoom-in-95 duration-200 shadow-xl border-none">
                <DropdownMenuItem onClick={() => setRescheduleDialogOpen(true)} className="text-xs font-bold py-3 px-4 cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary">
                  <CalendarClock className="h-4 w-4 mr-3 text-muted-foreground" />
                  Reagendar Vistoria
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSendReminder} className="text-xs font-bold py-3 px-4 cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary">
                  <BellRing className="h-4 w-4 mr-3 text-muted-foreground" />
                  Enviar Notificação
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem onClick={handleCancelInspection} className="text-xs font-bold py-3 px-4 text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer rounded-xl">
                  <Trash2 className="h-4 w-4 mr-3" />
                  Cancelar Vistoria
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <ScheduleInspectionDialog
        triggerButton={<span className="hidden" />}
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
        onSuccess={onUpdate}
        propertyInfo={{
          property: inspection.property,
          unit: inspection.unit,
          client: inspection.client,
        }}
      />

      <StartInspectionDialog
        open={startInspectionDialogOpen}
        onOpenChange={setStartInspectionDialogOpen}
        inspectionId={inspection.id}
        inspectionTitle={`Vistoria: ${inspection.property} - Un. ${inspection.unit}`}
        onComplete={handleInspectionComplete}
      />
    </div>
  );
};

