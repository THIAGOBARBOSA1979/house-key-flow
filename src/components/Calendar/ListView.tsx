
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentItem, Appointment } from "./AppointmentItem";
import { CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListViewProps {
  appointments: Appointment[];
  onViewDetails: (id: string) => void;
  filterOptions: {
    filterType: string;
    filterProperty: string;
    filterStatus: string;
  };
}

export function ListView({ appointments, onViewDetails, filterOptions }: ListViewProps) {
  const { filterType, filterProperty, filterStatus } = filterOptions;
  
  // Filter appointments for list view
  const getFilteredAppointmentsList = () => {
    let filtered = [...appointments];
    
    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(a => a.type === filterType);
    }
    
    // Filter by property
    if (filterProperty !== "all-properties") {
      filtered = filtered.filter(a => a.property.toLowerCase().includes(filterProperty.toLowerCase()));
    }
    
    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(a => a.status === filterStatus);
    }
    
    return filtered;
  };

  const filteredAppointments = getFilteredAppointmentsList();

  return (
    <div className="space-y-4">
      {filteredAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center section-padding bg-muted/20 rounded-xl border-2 border-dashed border-muted-foreground/10 animate-fade-in">
          <div className="p-4 bg-muted/20 rounded-full mb-4">
            <CalendarIcon className="h-12 w-12 text-muted-foreground/30" />
          </div>
          <h3 className="text-h3 font-bold text-foreground mb-1">Nenhum agendamento encontrado</h3>
          <p className="text-body-base text-muted-foreground mb-6 text-center max-w-md">Tente ajustar os filtros ou adicione um novo agendamento para começar.</p>
          <Button onClick={() => {}} className="rounded-lg h-10 px-6 font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      ) : (
        <Card className="card-standard border-none bg-card/50 backdrop-blur-sm overflow-hidden divide-y divide-border/10">
          {filteredAppointments.map((appointment) => (
            <AppointmentItem 
              key={appointment.id} 
              appointment={appointment} 
              onViewDetails={onViewDetails}
            />
          ))}
        </Card>
      )}
    </div>
  );
}
