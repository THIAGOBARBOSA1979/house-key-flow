
import { isValid } from "date-fns";
import { safeFormat } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Appointment } from "./AppointmentItem";

interface AppointmentDetailsProps {
  selectedAppointment: string | null;
  appointments: Appointment[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, newStatus: string) => void;
}

export function AppointmentDetails({ 
  selectedAppointment, 
  appointments, 
  isOpen, 
  onOpenChange,
  onStatusChange
}: AppointmentDetailsProps) {
  const { toast } = useToast();
  
  // Get appointment details
  const getAppointmentDetails = (id: string) => {
    return appointments.find(a => a.id === id);
  };
  
  // Get appointment status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Pendente</span>;
      case "confirmed":
        return <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Confirmado</span>;
      case "cancelled":
        return <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Cancelado</span>;
      case "completed":
        return <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Concluído</span>;
      default:
        return <span>-</span>;
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
              <span className="bg-violet-100 text-violet-800 text-xs px-2.5 py-0.5 rounded-md">Vistoria</span>
            ) : (
              <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-md">Garantia</span>
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
            <Label>Observações</Label>
            <Textarea 
              placeholder="Adicionar observações..."
              className="mt-1"
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
