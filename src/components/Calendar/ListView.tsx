
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentItem } from "./AppointmentItem";
import { Appointment } from "@/types";
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
    <div className="space-y-6">
      {filteredAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-muted-foreground/10 animate-in fade-in zoom-in-95 duration-300">
          <div className="p-6 bg-muted/20 rounded-full mb-6">
            <CalendarIcon className="h-12 w-12 text-muted-foreground/30" />
          </div>
          <h3 className="text-h3 font-bold text-foreground mb-2">Nenhum agendamento encontrado</h3>
          <p className="text-body-base text-muted-foreground mb-8 text-center max-w-sm px-6">Tente ajustar seus filtros ou buscar por outro termo para encontrar o que procura.</p>
          <Button onClick={() => {}} className="rounded-xl h-12 px-8 font-bold active:scale-95 transition-all shadow-sem-md">
            <Plus className="mr-2 h-5 w-5" />
            Novo Agendamento
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-sem-tiny font-black uppercase tracking-widest text-muted-foreground">
              {filteredAppointments.length} resultados encontrados
            </span>
          </div>
          <Card className="card-standard border-none bg-card/50 backdrop-blur-sm overflow-hidden divide-y divide-border/10 shadow-sem-lg">
            {filteredAppointments.map((appointment) => (
              <AppointmentItem 
                key={appointment.id} 
                appointment={appointment} 
                onViewDetails={onViewDetails}
              />
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
