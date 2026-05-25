import { useState, useEffect } from "react";
import { safeFormat } from "@/lib/utils";
import { Calendar, User, MapPin, Eye, MoreVertical, BellRing, Trash2, CalendarClock, Play, ClipboardList } from "lucide-react";
import { checklistService } from "@/services";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../shared/StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import { ScheduleInspectionDialog } from "./ScheduleInspectionDialog";
import { StartInspectionDialog } from "./StartInspectionDialog";
import { useToast } from "@/components/ui/use-toast";
import { inspectionService } from "@/services";
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
  onCancel?: () => void;
}

export const InspectionItem = ({ inspection, onUpdate, onCancel }: InspectionItemProps) => {
  const { toast } = useToast();
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [startInspectionDialogOpen, setStartInspectionDialogOpen] = useState(false);
  const [checklist, setChecklist] = useState<any>(null);

  useEffect(() => {
    if (inspection.checklistId) {
      checklistService.getById(inspection.checklistId).then(setChecklist);
    }
  }, [inspection.checklistId]);

  if (!inspection) return null;

  const handleViewDetails = () => {
    toast({
      title: "Resumo da Atividade Técnica",
      description: `Vistoria ${inspection.id} • Unidade estratégica ${inspection.unit} em ${inspection.property}.`,
    });
  };

  const handleCancelInspection = () => {
    if (onCancel) {
      onCancel();
    } else {
      inspectionService.updateStatus(inspection.id, "cancelled");
      toast({
        title: "Agendamento Descontinuado",
        description: `O protocolo de vistoria para ${inspection.client} foi removido do cronograma ativo.`,
        variant: "destructive",
      });
      if (onUpdate) onUpdate();
    }
  };

  const handleSendReminder = () => {
    toast({
      title: "Protocolo de Lembrete Ativado",
      description: `O cliente ${inspection.client} recebeu uma atualização de status via multicanal.`,
    });
  };

  const handleInspectionComplete = (data: any) => {
    inspectionService.updateStatus(inspection.id, "complete");
    toast({
      title: "Vistoria Homologada",
      description: "O ciclo técnico foi finalizado e os dados foram integrados ao portfólio.",
    });

    if (onUpdate) onUpdate();
  };

  const handleStartInspectionAction = () => {
    setStartInspectionDialogOpen(true);
    if (inspection.status === "pending") {
      inspectionService.updateStatus(inspection.id, "progress");
    }
  };

  return (
    <div className="relative group">
      <div className="p-5 lg:p-6 flex flex-col lg:flex-row gap-5 lg:items-center justify-between transition-all duration-500 group-hover:bg-primary/[0.04] rounded-card">
        <div className="flex flex-col gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0 group-hover:scale-110 transition-transform duration-500">
              <MapPin size={16} />
            </div>
            <span className="text-base font-black tracking-tight truncate">
              {inspection.property} • <span className="text-primary opacity-80">Unidade {inspection.unit}</span>
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-black uppercase tracking-wider">
              <User size={14} className="text-primary/40" />
              <span>{inspection.client}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-black uppercase tracking-wider">
              <Calendar size={14} className="text-primary/40" />
              <span>{safeFormat(inspection.date, "dd/MM/yyyy")} às {inspection.time}</span>
            </div>
            {checklist && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary/80 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                <ClipboardList size={10} />
                <span className="truncate max-w-[150px] uppercase tracking-tighter">{checklist.title}</span>
              </div>
            )}
          </div>
          {(inspection as any).conformityScore !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000",
                    (inspection as any).conformityScore >= 90 ? "bg-emerald-500" : 
                    (inspection as any).conformityScore >= 70 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${(inspection as any).conformityScore}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-muted-foreground">{(inspection as any).conformityScore}% NBR</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 items-center shrink-0 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 mt-2 lg:mt-0">
          <StatusBadge status={inspection.status as any} size="sm" showIcon />
          
          <div className="flex gap-2 items-center w-full lg:w-auto overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {(inspection.status === "pending" || inspection.status === "progress") && (
              <Button 
                variant="default" 
                size="sm"
                onClick={handleStartInspectionAction}
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
