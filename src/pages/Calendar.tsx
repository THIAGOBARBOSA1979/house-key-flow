
import { useState } from "react";
import { CalendarHeader } from "@/components/Calendar/CalendarHeader";
import { CalendarView } from "@/components/Calendar/CalendarView";
import { ListView } from "@/components/Calendar/ListView";
import { AppointmentDetails } from "@/components/Calendar/AppointmentDetails";
import { CalendarFilters } from "@/components/Calendar/CalendarFilters";
import { QuickActions } from "@/components/Calendar/QuickActions";
import { appointments, type Appointment } from "@/components/Calendar/AppointmentData";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    property: "all",
  });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const filteredAppointments = appointments.filter(apt => {
    const matchesType = filters.type === "all" || apt.type === filters.type;
    const matchesStatus = filters.status === "all" || apt.status === filters.status;
    const matchesProperty = filters.property === "all" || apt.property === filters.property;
    return matchesType && matchesStatus && matchesProperty;
  });

  // Calculate stats for QuickActions
  const today = new Date();
  const todayAppointments = filteredAppointments.filter(apt => 
    apt.date.toDateString() === today.toDateString()
  ).length;

  const pendingAppointments = filteredAppointments.filter(apt => 
    apt.status === "pending"
  ).length;

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const completedThisWeek = filteredAppointments.filter(apt =>
    apt.status === "completed" &&
    apt.date >= startOfWeek &&
    apt.date <= endOfWeek
  ).length;

  const handleNewAppointment = () => {
    console.log("Opening new appointment form");
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    console.log(`Changing status of appointment ${id} to ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      <CalendarHeader
        onChangeView={(view: string) => {
          if (view === "calendar" || view === "list") {
            console.log(`Changing view to: ${view}`);
          }
        }}
      />

      <QuickActions
        todayAppointments={todayAppointments}
        pendingAppointments={pendingAppointments}
        completedThisWeek={completedThisWeek}
        onNewAppointment={handleNewAppointment}
      />

      <CalendarFilters
        filterType={filters.type}
        setFilterType={(type) => setFilters({...filters, type})}
        filterProperty={filters.property}
        setFilterProperty={(property) => setFilters({...filters, property})}
        filterStatus={filters.status}
        setFilterStatus={(status) => setFilters({...filters, status})}
        dateFilter="all"
        setDateFilter={() => {}}
        filterSheetOpen={filterSheetOpen}
        setFilterSheetOpen={setFilterSheetOpen}
      />

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Visualização do Calendário</TabsTrigger>
          <TabsTrigger value="list">Lista de Agendamentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-6">
              <CalendarView
                appointments={filteredAppointments}
                onViewDetails={setSelectedAppointment}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list">
          <ListView
            appointments={filteredAppointments}
            onViewDetails={setSelectedAppointment}
            filterOptions={{
              filterType: filters.type,
              filterProperty: filters.property,
              filterStatus: filters.status,
            }}
          />
        </TabsContent>
      </Tabs>

      {selectedAppointment && (
        <AppointmentDetails
          selectedAppointment={selectedAppointment}
          appointments={appointments}
          isOpen={!!selectedAppointment}
          onOpenChange={(open) => !open && setSelectedAppointment(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default Calendar;
