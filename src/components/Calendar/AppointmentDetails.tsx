
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
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-6 border-b bg-muted/5">
          <DialogTitle className="text-2xl font-black tracking-tight">Detalhes do Agendamento</DialogTitle>
          <DialogDescription className="text-sm font-medium">
            Visualize e gerencie as informações da atividade programada.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-dashed border-border/20 pb-6">
            <h3 className="text-2xl font-black text-foreground tracking-tight">{appointment.title}</h3>
            {appointment.type === "inspection" ? (
              <Badge variant="info" className="px-4 py-1.5 rounded-full">Vistoria</Badge>
            ) : (
              <Badge variant="warning" className="px-4 py-1.5 rounded-full">Garantia</Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <Label>Status Atual</Label>
                <div className="mt-1">{getStatusBadge(appointment.status)}</div>
              </div>
              <div className="space-y-1.5">
                <Label>Data e Hora</Label>
                <div className="mt-1 text-sm font-bold bg-muted/30 p-3 rounded-xl border border-border/5">
                  {safeFormat(appointment.date, "dd/MM/yyyy 'às' HH:mm")}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Responsável Técnico</Label>
                <div className="mt-1 text-sm font-bold bg-muted/30 p-3 rounded-xl border border-border/5">
                  {appointment.technician || "Não atribuído"}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <Label>Cliente</Label>
                <div className="mt-1 text-sm font-bold bg-muted/30 p-3 rounded-xl border border-border/5">
                  {appointment.client}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Propriedade</Label>
                <div className="mt-1 text-sm font-bold bg-muted/30 p-3 rounded-xl border border-border/5">
                  {appointment.property} - Unidade {appointment.unit}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Observações de Campo</Label>
            <Textarea 
              placeholder="Adicionar notas internas sobre este agendamento..."
              className="mt-2 min-h-[120px] resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          {appointment.status !== "completed" && appointment.status !== "cancelled" && (
            <div className="p-6 bg-muted/30 rounded-3xl border border-border/5 space-y-4">
              <Label className="block mb-2">Atualizar Status do Fluxo</Label>
              <RadioGroup defaultValue={appointment.status} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-background rounded-xl border border-border/10 hover:bg-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="pending" id="pending" />
                  <Label htmlFor="pending" className="font-bold mb-0 normal-case tracking-normal cursor-pointer">Pendente</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-background rounded-xl border border-border/10 hover:bg-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="confirmed" id="confirmed" />
                  <Label htmlFor="confirmed" className="font-bold mb-0 normal-case tracking-normal cursor-pointer">Confirmado</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-background rounded-xl border border-border/10 hover:bg-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="completed" id="completed" />
                  <Label htmlFor="completed" className="font-bold mb-0 normal-case tracking-normal cursor-pointer">Concluído</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-background rounded-xl border border-border/10 hover:bg-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="cancelled" id="cancelled" />
                  <Label htmlFor="cancelled" className="font-bold mb-0 normal-case tracking-normal cursor-pointer text-destructive">Cancelado</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-background rounded-xl border border-border/10 hover:bg-accent transition-colors cursor-pointer">
                  <RadioGroupItem value="rescheduled" id="rescheduled" />
                  <Label htmlFor="rescheduled" className="font-bold mb-0 normal-case tracking-normal cursor-pointer">Reagendado</Label>
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
                className="px-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
            <Button 
              className="px-10 font-black uppercase tracking-widest text-xs"
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
