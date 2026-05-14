
import { useState } from "react";
import { isValid } from "date-fns";
import { safeFormat } from "@/lib/utils";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { AppointmentItem } from "./AppointmentItem";
import { Appointment } from "./AppointmentData";
import { ScheduleInspectionDialog } from "@/components/Inspection/ScheduleInspectionDialog";
import { Button } from "@/components/ui/button";

interface CalendarViewProps {
  appointments: Appointment[];
  onViewDetails: (id: string) => void;
}

export function CalendarView({ appointments, onViewDetails }: CalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Filter appointments for the selected date
  const filteredAppointments = date 
    ? appointments.filter(appointment => 
        appointment.date.getDate() === date.getDate() &&
        appointment.date.getMonth() === date.getMonth() &&
        appointment.date.getFullYear() === date.getFullYear()
      )
    : [];
    
  // Function to get appointments for a specific date (for highlighting days with appointments)
  const getAppointmentsForDate = (day: Date) => {
    return appointments.filter(appointment => 
      appointment.date.getDate() === day.getDate() &&
      appointment.date.getMonth() === day.getMonth() &&
      appointment.date.getFullYear() === day.getFullYear()
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="xl:col-span-2 card-standard border-none bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-h4">Calendário de Agendamentos</CardTitle>
          <CardDescription className="text-sem-body-sm font-medium">
            Selecione uma data para ver os agendamentos detalhados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-xl border border-border/10 pointer-events-auto w-full bg-background/30"
            modifiers={{
              hasAppointment: (day) => getAppointmentsForDate(day).length > 0,
            }}
            modifiersClassNames={{
              hasAppointment: "bg-primary/10 text-primary font-bold hover:bg-primary/20",
            }}
          />
        </CardContent>
      </Card>

      {/* Appointments for selected date */}
      <Card className="card-standard border-none bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10">
          <div>
            <CardTitle className="text-h4">
              {date ? safeFormat(date, "dd/MM/yyyy") : safeFormat(new Date(), "dd/MM/yyyy")}
            </CardTitle>
            <CardDescription className="text-sem-tiny uppercase font-bold tracking-tighter text-primary mt-1">
              {filteredAppointments.length} agendamentos encontrados
            </CardDescription>
          </div>
          {date && (
            <ScheduleInspectionDialog
              triggerButton={
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-primary/5 text-primary active:scale-95 transition-all">
                  <Plus className="h-5 w-5" />
                </Button>
              }
            />
          )}
        </CardHeader>
        <CardContent className="p-0 max-h-[600px] overflow-y-auto divide-y divide-border/10">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-20 px-6 animate-fade-in">
              <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto mb-4">
                <CalendarIcon className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-label mb-1">Nenhum agendamento</h3>
              <p className="text-sem-body-sm text-muted-foreground">Não há compromissos registrados para esta data.</p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <AppointmentItem
                key={appointment.id}
                appointment={appointment}
                onViewDetails={onViewDetails}
                compact={true}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
