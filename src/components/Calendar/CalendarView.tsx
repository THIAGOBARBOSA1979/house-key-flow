
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
    ? appointments.filter(appointment => {
        const aptDate = new Date(appointment.date);
        return aptDate.getDate() === date.getDate() &&
               aptDate.getMonth() === date.getMonth() &&
               aptDate.getFullYear() === date.getFullYear();
      })
    : [];
    
  // Function to get appointments for a specific date (for highlighting days with appointments)
  const getAppointmentsForDate = (day: Date) => {
    return appointments.filter(appointment => {
      const aptDate = new Date(appointment.date);
      return aptDate.getDate() === day.getDate() &&
             aptDate.getMonth() === day.getMonth() &&
             aptDate.getFullYear() === day.getFullYear() &&
             appointment.status !== 'cancelled';
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-7 xl:col-span-8 card-standard border-none bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-h4 font-black">Cronograma de Operações</CardTitle>
            <CardDescription className="text-sem-body-sm font-medium">
              Visualize e selecione datas para detalhes
            </CardDescription>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Protocolos Ativos</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 flex-1 flex flex-col justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-xl border border-border/10 pointer-events-auto w-full max-w-full mx-auto bg-background/30"
            modifiers={{
              hasAppointment: (day) => getAppointmentsForDate(day).length > 0,
            }}
            modifiersClassNames={{
              hasAppointment: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary font-bold text-primary",
            }}
          />
        </CardContent>
      </Card>

      {/* Appointments for selected date */}
      <Card className="lg:col-span-5 xl:col-span-4 card-standard border-none bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col min-h-[400px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10">
          <div>
            <CardTitle className="text-h4">
              {date ? safeFormat(date, "dd/MM/yyyy") : safeFormat(new Date(), "dd/MM/yyyy")}
            </CardTitle>
            <CardDescription className="text-sem-tiny uppercase font-bold tracking-tighter text-primary mt-1">
              {filteredAppointments.length} protocolos integrados
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
        <CardContent className="p-0 flex-1 overflow-y-auto divide-y divide-border/10 custom-scrollbar">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-20 px-6 animate-fade-in">
              <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto mb-4">
                <CalendarIcon className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-label mb-1 font-black">Janela Livre</h3>
              <p className="text-sem-body-sm text-muted-foreground font-medium">Nenhum protocolo estratégico agendado para este ciclo.</p>

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
