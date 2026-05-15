
import React from "react";
import { isValid } from "date-fns";
import { safeFormat } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Appointment } from "./AppointmentData";
import { Badge } from "@/components/ui/badge";

interface AppointmentDetailsProps {
  selectedAppointment: string | null;
  appointments: Appointment[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, newStatus: string) => void;
  onUpdate?: (id: string, data: any) => void;
}

export function AppointmentDetails({ 
  selectedAppointment, 
  appointments, 
  isOpen, 
  onOpenChange,
  onStatusChange,
  onUpdate
}: AppointmentDetailsProps) {
  const { toast } = useToast();
  const [notes, setNotes] = React.useState("");
  
  React.useEffect(() => {
    const apt = appointments.find(a => a.id === selectedAppointment);
    if (apt) setNotes(apt.notes || "");
  }, [selectedAppointment, appointments]);
  
  // Get appointment details
  const getAppointmentDetails = (id: string) => {
    return appointments.find(a => a.id === id);
  };
  
  // Get appointment status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center rounded-md bg-status-pending/10 px-2 py-1 text-xs font-medium text-status-pending ring-1 ring-inset ring-status-pending/20">Pendente</span>;
      case "confirmed":
        return <span className="inline-flex items-center rounded-md bg-status-complete/10 px-2 py-1 text-xs font-medium text-status-complete ring-1 ring-inset ring-status-complete/20">Confirmado</span>;
      case "cancelled":
        return <span className="inline-flex items-center rounded-md bg-status-critical/10 px-2 py-1 text-xs font-medium text-status-critical ring-1 ring-inset ring-status-critical/20">Cancelado</span>;
      case "completed":
        return <span className="inline-flex items-center rounded-md bg-status-progress/10 px-2 py-1 text-xs font-medium text-status-progress ring-1 ring-inset ring-status-progress/20">Concluído</span>;
      case "rescheduled":
        return <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600 ring-1 ring-inset ring-amber-500/20">Reagendado</span>;
      default:
        return <span>—</span>;
    }
  };

  const appointment = selectedAppointment ? getAppointmentDetails(selectedAppointment) : null;

  if (!appointment) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-6 border-b bg-muted/5">
          <DialogTitle className="text-2xl font-black tracking-tight">Detalhes do Agendamento</DialogTitle>
          <DialogDescription className="text-sm font-medium">
            Visualize e gerencie as informações da atividade programada.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-foreground">{appointment.title}</h3>
            {appointment.type === "inspection" ? (
              <Badge className="bg-primary/10 text-primary border-primary/20 rounded-lg font-black uppercase text-[10px]">Vistoria</Badge>
            ) : (
              <Badge className="bg-status-pending/10 text-status-pending border-status-pending/20 rounded-lg font-black uppercase text-[10px]">Garantia</Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status Atual</Label>
              <div className="mt-1">{getStatusBadge(appointment.status)}</div>
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data e Hora</Label>
              <div className="mt-1 text-sm">{safeFormat(appointment.date, "dd/MM/yyyy 'às' HH:mm")}</div>
            </div>
          </div>
          
          <div>
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cliente</Label>
            <div className="mt-1 text-sm">{appointment.client}</div>
          </div>
          
          <div>
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Propriedade</Label>
            <div className="mt-1 text-sm">{appointment.property} - Unidade {appointment.unit}</div>
          </div>
          
          <div>
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Responsável Técnico</Label>
            <div className="mt-1 text-sm">{appointment.technician || "Não atribuído"}</div>
          </div>
          
          <div>
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Observações de Campo</Label>
            <Textarea 
              placeholder="Adicionar notas internas sobre este agendamento..."
              className="mt-2 rounded-xl min-h-[100px] resize-none border-muted-foreground/20 focus:border-primary transition-all"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          {appointment.status !== "completed" && appointment.status !== "cancelled" && (
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-3">Atualizar Status do Fluxo</Label>
              <RadioGroup defaultValue={appointment.status} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending" id="pending" />
                  <Label htmlFor="pending" className="font-normal">Pendente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="confirmed" id="confirmed" />
                  <Label htmlFor="confirmed" className="font-normal">Confirmado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed" id="completed" />
                  <Label htmlFor="completed" className="font-normal">Concluído</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cancelled" id="cancelled" />
                  <Label htmlFor="cancelled" className="font-normal">Cancelado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rescheduled" id="rescheduled" />
                  <Label htmlFor="rescheduled" className="font-normal">Reagendado</Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>
        <DialogFooter className="p-8 border-t border-border/10 bg-muted/5 flex-row sm:justify-between items-center gap-4">
          <div className="flex-1">
            {appointment.status === "pending" && (
              <Button 
                variant="ghost" 
                className="h-12 px-6 rounded-xl font-bold text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
                onClick={() => {
                  onStatusChange(appointment.id, "cancelled");
                  onOpenChange(false);
                }}
              >
                <X className="mr-2 h-4 w-4" /> Cancelar
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              className="h-12 px-6 rounded-xl font-bold transition-all"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
            <Button 
              className="h-12 px-10 rounded-xl font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 shadow-sem-md active:scale-95 transition-all"
              onClick={() => {
                if (onUpdate) {
                  onUpdate(appointment.id, { notes });
                }
                toast({
                  title: "Alterações salvas",
                  description: "Os dados do agendamento foram sincronizados.",
                });
                onOpenChange(false);
              }}
            >
              Salvar Alterações
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
