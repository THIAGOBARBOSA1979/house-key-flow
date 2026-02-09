import { format } from "date-fns";
import { Calendar, User, MapPin, Eye, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../shared/StatusBadge";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ScheduleInspectionDialog } from "./ScheduleInspectionDialog";
import { useToast } from "@/components/ui/use-toast";

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

export const InspectionItem = ({ inspection }: InspectionItemProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  
  const handleViewDetails = () => {
    toast({
      title: "Detalhes da vistoria",
      description: `Visualizando detalhes da vistoria ${inspection.id} - ${inspection.property}, Unidade ${inspection.unit}.`,
    });
  };

  const handleCancelInspection = () => {
    toast({
      title: "Vistoria cancelada",
      description: `A vistoria de ${inspection.client} foi cancelada com sucesso.`,
      variant: "destructive",
    });
  };

  const handleSendReminder = () => {
    toast({
      title: "Lembrete enviado",
      description: `Um lembrete foi enviado para ${inspection.client}.`,
    });
  };

  return (
    <>
      <div className="p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between transition-all duration-200 hover:bg-accent/5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <MapPin size={16} className="text-primary" />
            <span>{inspection.property} - Unidade {inspection.unit}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <User size={14} />
            <span>{inspection.client}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Calendar size={14} />
            <span>{format(inspection.scheduledDate, "dd/MM/yyyy 'às' HH:mm")}</span>
          </div>
        </div>
        
        <div className="flex gap-3 items-center">
          <StatusBadge status={inspection.status} />
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewDetails}
          >
            <Eye className="h-4 w-4 mr-2" /> 
            Detalhes
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRescheduleDialogOpen(true)}>
                Reagendar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCancelInspection}>
                Cancelar vistoria
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSendReminder}>
                Enviar lembrete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Reschedule Dialog - properly controlled */}
      <ScheduleInspectionDialog
        triggerButton={<span className="hidden" />}
        propertyInfo={{
          property: inspection.property,
          unit: inspection.unit,
          client: inspection.client,
        }}
      />
    </>
  );
};
