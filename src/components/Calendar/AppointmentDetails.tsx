
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
          <DialogDescription>
            Visualize e gerencie os detalhes do agendamento
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">{appointment.title}</h3>
            {appointment.type === "inspection" ? (
              <span className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-md border border-primary/20">Vistoria</span>
            ) : (
              <span className="bg-status-pending/10 text-status-pending text-xs px-2.5 py-0.5 rounded-md border border-status-pending/20">Garantia</span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <div className="mt-1">{getStatusBadge(appointment.status)}</div>
            </div>
            <div>
              <Label>Data e Hora</Label>
              <div className="mt-1 text-sm">{safeFormat(appointment.date, "dd/MM/yyyy 'às' HH:mm")}</div>
            </div>
          </div>
          
          <div>
            <Label>Cliente</Label>
            <div className="mt-1 text-sm">{appointment.client}</div>
          </div>
          
          <div>
            <Label>Propriedade</Label>
            <div className="mt-1 text-sm">{appointment.property} - Unidade {appointment.unit}</div>
          </div>
          
          <div>
            <Label>Responsável Técnico</Label>
            <div className="mt-1 text-sm">{appointment.technician || "Não atribuído"}</div>
          </div>
          
          <div>
            <Label>Observações</Label>
            <Textarea 
              placeholder="Adicionar observações..."
              className="mt-1"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          {appointment.status !== "completed" && appointment.status !== "cancelled" && (
            <div>
              <Label>Atualizar Status</Label>
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
        <DialogFooter>
          {appointment.status === "pending" && (
            <Button 
              variant="outline" 
              onClick={() => {
                onStatusChange(appointment.id, "Cancelado");
                onOpenChange(false);
              }}
            >
              <X className="mr-2 h-4 w-4" /> Cancelar Agendamento
            </Button>
          )}
          <Button 
            onClick={() => {
              toast({
                title: "Alterações salvas",
                description: "As alterações no agendamento foram salvas com sucesso.",
              });
              onOpenChange(false);
            }}
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
