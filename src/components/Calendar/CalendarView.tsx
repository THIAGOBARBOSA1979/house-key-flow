
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { AppointmentItem, Appointment } from "./AppointmentItem";
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Calendário de Agendamentos</CardTitle>
          <CardDescription>
            Selecione uma data para ver os agendamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border pointer-events-auto w-full"
            modifiers={{
              hasAppointment: (day) => getAppointmentsForDate(day).length > 0,
            }}
            modifiersClassNames={{
              hasAppointment: "bg-primary/20 font-bold",
            }}
          />
        </CardContent>
      </Card>

      {/* Appointments for selected date */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>
              Agendamentos para {date ? format(date, "dd/MM/yyyy") : "hoje"}
            </CardTitle>
            <CardDescription>
              {filteredAppointments.length} agendamentos encontrados
            </CardDescription>
          </div>
          {date && (
            <ScheduleInspectionDialog
              triggerButton={
                <Button size="sm" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              }
            />
          )}
        </CardHeader>
        <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
          {filteredAppointments.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="font-medium mb-1">Nenhum agendamento</h3>
              <p className="text-sm">Não há agendamentos para esta data</p>
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
