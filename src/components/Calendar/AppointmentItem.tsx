
import { isValid } from "date-fns";
import { safeFormat } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, Check, X, FileCheck, CalendarClock } from "lucide-react";

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
        return <Badge variant="outline" className="bg-status-pending/10 text-status-pending border-status-pending/20 rounded-lg text-sem-tiny font-bold uppercase"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "confirmed":
        return <Badge className="bg-status-complete/10 text-status-complete border-status-complete/20 rounded-lg text-sem-tiny font-bold uppercase"><Check className="h-3 w-3 mr-1" />Confirmado</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="bg-status-critical/10 text-status-critical border-status-critical/20 rounded-lg text-sem-tiny font-bold uppercase"><X className="h-3 w-3 mr-1" />Cancelado</Badge>;
      case "completed":
        return <Badge className="bg-status-progress/10 text-status-progress border-status-progress/20 rounded-lg text-sem-tiny font-bold uppercase"><FileCheck className="h-3 w-3 mr-1" />Concluído</Badge>;
      default:
        return <Badge variant="outline">—</Badge>;
    }
  };
  
  // Get appointment type badge
  const getTypeBadge = (type: string) => {
    return type === "inspection"
      ? <Badge className="bg-primary/10 text-primary border-primary/20 rounded-lg text-sem-tiny font-black uppercase tracking-tighter">Vistoria</Badge>
      : <Badge className="bg-status-pending/10 text-status-pending border-status-pending/20 rounded-lg text-sem-tiny font-black uppercase tracking-tighter">Garantia</Badge>;
  };

  if (compact) {
    // Compact version for calendar view
    return (
      <div 
        className="p-5 hover:bg-primary/5 transition-all cursor-pointer group border-b border-border/10 last:border-0"
        onClick={() => onViewDetails(appointment.id)}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-label font-bold truncate group-hover:text-primary transition-colors">{appointment.title}</h3>
          {getTypeBadge(appointment.type)}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sem-body-sm text-muted-foreground font-medium">
            <Clock className="h-3.5 w-3.5 text-primary/60" />
            <span className="text-foreground font-bold">{safeFormat(appointment.date, "HH:mm")}</span>
            <span className="text-muted-foreground/30">•</span>
            {getStatusBadge(appointment.status)}
          </div>
          
          <div className="flex items-center gap-2 text-sem-tiny text-muted-foreground uppercase font-bold tracking-tighter">
            <MapPin size={12} className="text-primary/60" />
            <span className="truncate">{appointment.property} • Un. {appointment.unit}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sem-tiny text-muted-foreground uppercase font-bold tracking-tighter">
            <User size={12} className="text-primary/60" />
            <span className="truncate">{appointment.client}</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Full version for list view
  return (
    <div className="p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5-sem transition-all duration-300 hover:bg-muted/30 group">
      <div className="space-y-3 flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          {getTypeBadge(appointment.type)}
          <h3 className="text-h4 font-bold group-hover:text-primary transition-colors">{appointment.title}</h3>
          {getStatusBadge(appointment.status)}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sem-body-sm text-muted-foreground font-medium">
            <div className="p-1.5 bg-muted rounded-lg"><MapPin size={14} className="text-primary/60" /></div>
            <span className="truncate">{appointment.property} • Unidade {appointment.unit}</span>
          </div>
          <div className="flex items-center gap-2 text-sem-body-sm text-muted-foreground font-medium">
            <div className="p-1.5 bg-muted rounded-lg"><User size={14} className="text-primary/60" /></div>
            <span className="truncate">{appointment.client}</span>
          </div>
          <div className="flex items-center gap-2 text-sem-body-sm text-muted-foreground font-medium">
            <div className="p-1.5 bg-muted rounded-lg"><CalendarClock size={14} className="text-primary/60" /></div>
            <span>{safeFormat(appointment.date, "dd/MM/yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-sem-body-sm text-muted-foreground font-medium">
            <div className="p-1.5 bg-muted rounded-lg"><Clock size={14} className="text-primary/60" /></div>
            <span className="text-foreground font-bold">{safeFormat(appointment.date, "HH:mm")}</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 shrink-0 md:pl-4 md:border-l md:border-border/10">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewDetails(appointment.id)}
          className="rounded-lg h-10 font-bold active:scale-95 transition-all"
        >
          Ver detalhes
        </Button>
      </div>
    </div>
  );
}
