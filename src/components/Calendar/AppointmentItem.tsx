
import { isValid } from "date-fns";
import { safeFormat } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, Check, X, FileCheck, CalendarClock, Users, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Appointment } from "./AppointmentData";

export interface AppointmentItemProps {
  appointment: Appointment;
  onViewDetails: (id: string) => void;
  compact?: boolean;
}

export function AppointmentItem({ appointment, onViewDetails, compact = false }: AppointmentItemProps) {
  // Get appointment status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 rounded-lg text-sem-tiny font-bold uppercase"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "confirmed":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 rounded-lg text-sem-tiny font-bold uppercase"><Check className="h-3 w-3 mr-1" />Confirmado</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/30 rounded-lg text-sem-tiny font-bold uppercase"><X className="h-3 w-3 mr-1" />Cancelado</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 rounded-lg text-sem-tiny font-bold uppercase"><FileCheck className="h-3 w-3 mr-1" />Concluído</Badge>;
      case "rescheduled":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 rounded-lg text-sem-tiny font-bold uppercase"><CalendarClock className="h-3 w-3 mr-1" />Reagendado</Badge>;
      default:
        return <Badge variant="outline">—</Badge>;
    }
  };
  
  // Get appointment type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "inspection":
        return <Badge className="bg-primary/10 text-primary border-primary/20 rounded-lg text-sem-tiny font-black uppercase tracking-tighter">Vistoria</Badge>;
      case "warranty":
        return <Badge className="bg-status-pending/10 text-status-pending border-status-pending/20 rounded-lg text-sem-tiny font-black uppercase tracking-tighter">Garantia</Badge>;
      case "delivery":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-lg text-sem-tiny font-black uppercase tracking-tighter">Entrega</Badge>;
      case "technical_visit":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 rounded-lg text-sem-tiny font-black uppercase tracking-tighter">Visita Técnica</Badge>;
      default:
        return <Badge variant="outline">Outro</Badge>;
    }
  };

  if (compact) {
    // Compact version for calendar view
    return (
      <TooltipProvider>
        <div 
          className="p-5 hover:bg-primary/5 transition-all cursor-pointer group border-b border-border/10 last:border-0"
          onClick={() => onViewDetails(appointment.id)}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-label font-bold truncate group-hover:text-primary transition-colors max-w-[150px]">{appointment.title}</h3>
            {getTypeBadge(appointment.type)}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sem-body-sm text-muted-foreground font-medium">
              <Clock className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-foreground font-bold">{safeFormat(appointment.date, "HH:mm")}</span>
              <span className="text-muted-foreground/30">•</span>
              {getStatusBadge(appointment.status)}
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sem-tiny text-muted-foreground uppercase font-bold tracking-tighter cursor-help">
                  <MapPin size={12} className="text-primary/60" />
                  <span className="truncate max-w-[180px]">{appointment.property} • Un. {appointment.unit}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{appointment.property} • Unidade {appointment.unit}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sem-tiny text-muted-foreground uppercase font-bold tracking-tighter cursor-help">
                  <User size={12} className="text-primary/60" />
                  <span className="truncate max-w-[180px]">{appointment.client}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{appointment.client}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
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
          {appointment.priority === "high" && (
            <Badge variant="destructive" className="animate-pulse py-0 h-5 text-[10px]">ALTA PRIORIDADE</Badge>
          )}
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
          {appointment.technician && (
            <div className="flex items-center gap-2 text-sem-body-sm text-muted-foreground font-medium">
              <div className="p-1.5 bg-muted rounded-lg"><Users size={14} className="text-primary/60" /></div>
              <span className="truncate">{appointment.technician}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto md:pl-4 md:border-l md:border-border/10">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewDetails(appointment.id)}
          className="flex-1 md:flex-none rounded-xl h-10 font-bold active:scale-95 transition-all bg-card/50 hover:bg-primary/5 border-border/10"
        >
          Ver detalhes
        </Button>
      </div>
    </div>
  );
}
