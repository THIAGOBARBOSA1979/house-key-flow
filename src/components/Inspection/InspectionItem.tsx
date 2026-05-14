
import { format } from "date-fns";
import { Calendar, User, MapPin, Eye, MoreVertical, BellRing, Trash2, CalendarClock } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface InspectionItemProps {
  inspection: {
    id: string;
    property: string;
    unit: string;
    client: string;
    scheduledDate: Date;
    status: "pending" | "progress" | "complete";
  };
}

/**
 * Reusable InspectionItem refactored with Design System tokens.
 */
export const InspectionItem = ({ inspection }: InspectionItemProps) => {
  const { toast } = useToast();
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  
  const handleViewDetails = () => {
    toast({
      title: "Detalhes da vistoria",
      description: `Vistoria ${inspection.id} • ${inspection.property}, Unidade ${inspection.unit}.`,
    });
  };

  const handleCancelInspection = () => {
    toast({
      title: "Vistoria cancelada",
      description: `A vistoria de ${inspection.client} foi removida.`,
      variant: "destructive",
    });
  };

  const handleSendReminder = () => {
    toast({
      title: "Lembrete enviado",
      description: `Notificação enviada para ${inspection.client}.`,
    });
  };

  return (
    <div className="relative group">
      <div className="p-5 flex flex-col md:flex-row gap-5 md:items-center justify-between transition-all duration-300 group-hover:bg-muted/30">
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <MapPin size={14} className="shrink-0" />
            </div>
            <span className="text-sm font-bold truncate">{inspection.property} • <span className="text-primary">Unidade {inspection.unit}</span></span>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <User size={12} className="text-muted-foreground/60" />
              <span>{inspection.client}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Calendar size={12} className="text-muted-foreground/60" />
              <span>{format(inspection.scheduledDate, "dd/MM/yyyy 'às' HH:mm")}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 items-center shrink-0">
          <StatusBadge status={inspection.status} size="sm" showIcon />
          
          <div className="h-6 w-[1px] bg-border/40 mx-1 hidden md:block" />

          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleViewDetails}
            className="h-9 px-3 text-xs font-bold hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
          >
            <Eye className="h-3.5 w-3.5 mr-2" /> 
            Detalhes
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted transition-all">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 animate-in zoom-in-95 duration-200">
              <DropdownMenuItem onClick={() => setRescheduleDialogOpen(true)} className="text-xs font-bold py-2.5 cursor-pointer">
                <CalendarClock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                Reagendar Vistoria
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSendReminder} className="text-xs font-bold py-2.5 cursor-pointer">
                <BellRing className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                Enviar Lembrete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCancelInspection} className="text-xs font-bold py-2.5 text-destructive focus:text-destructive cursor-pointer">
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Cancelar Vistoria
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScheduleInspectionDialog
        triggerButton={<span className="hidden" />}
        propertyInfo={{
          property: inspection.property,
          unit: inspection.unit,
          client: inspection.client,
        }}
      />
    </div>
  );
};

