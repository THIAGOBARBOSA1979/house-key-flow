
import { isValid } from "date-fns";
import { safeFormat } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, Check, X, FileCheck } from "lucide-react";

export interface Appointment {
  id: string;
  title: string;
  property: string;
  unit: string;
  client: string;
  date: Date;
  type: "inspection" | "warranty";
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

interface AppointmentItemProps {
  appointment: Appointment;
  onViewDetails: (id: string) => void;
  compact?: boolean;
}

export function AppointmentItem({ appointment, onViewDetails, compact = false }: AppointmentItemProps) {
  // Get appointment status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="flex gap-1 bg-status-pending/10 text-status-pending border-status-pending/20"><Clock className="h-3 w-3" />Pendente</Badge>;
      case "confirmed":
        return <Badge className="bg-status-complete text-status-complete-foreground flex gap-1"><Check className="h-3 w-3" />Confirmado</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="bg-status-critical text-status-critical-foreground flex gap-1"><X className="h-3 w-3" />Cancelado</Badge>;
      case "completed":
        return <Badge className="bg-status-progress text-status-progress-foreground flex gap-1"><FileCheck className="h-3 w-3" />Concluído</Badge>;
      default:
        return <Badge variant="outline">—</Badge>;
    }
  };
  
  // Get appointment type badge
  const getTypeBadge = (type: string) => {
    return type === "inspection"
      ? <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Vistoria</Badge>
      : <Badge className="bg-status-pending/10 text-status-pending border-status-pending/20 hover:bg-status-pending/20">Garantia</Badge>;
  };

  if (compact) {
    // Compact version for calendar view
    return (
      <div className="border rounded-lg p-4 space-y-3 hover:bg-accent/5 transition-colors">
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{appointment.title}</h3>
          {getTypeBadge(appointment.type)}
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{safeFormat(appointment.date, "HH:mm")}</span>
          <span className="mx-1">•</span>
          {getStatusBadge(appointment.status)}
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin size={14} />
          <span>{appointment.property} - Unidade {appointment.unit}</span>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <User size={14} />
          <span>{appointment.client}</span>
        </div>
        
        <div className="pt-2 flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(appointment.id)}
          >
            Ver detalhes
          </Button>
        </div>
      </div>
    );
  }
  
  // Full version for list view
  return (
    <div className="p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {getTypeBadge(appointment.type)}
          {getStatusBadge(appointment.status)}
          <h3 className="font-medium">{appointment.title}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin size={14} />
            <span>{appointment.property} - Unidade {appointment.unit}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <User size={14} />
            <span>{appointment.client}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock size={14} />
            <span>{safeFormat(appointment.date, "dd/MM/yyyy")}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock size={14} />
            <span>{safeFormat(appointment.date, "HH:mm")}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 self-end md:self-auto">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewDetails(appointment.id)}
        >
          Ver detalhes
        </Button>
      </div>
    </div>
  );
}
