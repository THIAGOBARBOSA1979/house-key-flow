
import { useState } from "react";
import { CalendarHeader } from "@/components/Calendar/CalendarHeader";
import { CalendarView } from "@/components/Calendar/CalendarView";
import { ListView } from "@/components/Calendar/ListView";
import { AppointmentDetails } from "@/components/Calendar/AppointmentDetails";
import { CalendarFilters } from "@/components/Calendar/CalendarFilters";
import { QuickActions } from "@/components/Calendar/QuickActions";
import { ScheduleInspectionDialog } from "@/components/Inspection/ScheduleInspectionDialog";
import { getUnifiedAppointments, type Appointment } from "@/components/Calendar/AppointmentData";
import { useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, List } from "lucide-react";

const Calendar = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    property: "all",
  });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadAppointments = useCallback(() => {
    setIsLoading(true);
    // Simulate loading for better UX
    setTimeout(() => {
      const data = getUnifiedAppointments();
      setAppointments(data);
      setIsLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

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
    setScheduleDialogOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    import("@/services/InspectionService").then(({ inspectionService }) => {
      inspectionService.updateStatus(id, newStatus);
      loadAppointments(); // Refresh list
    });
  };

  const handleUpdateAppointment = (id: string, data: any) => {
    import("@/services/InspectionService").then(({ inspectionService }) => {
      inspectionService.update(id, data);
      loadAppointments();
    });
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
        setFilterSheetOpen={setFilterSheetOpen}
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

      <Tabs defaultValue="calendar" className="w-full space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl w-full max-w-lg">
          <TabsTrigger value="calendar" className="rounded-lg py-2.5 font-bold text-xs gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="list" className="rounded-lg py-2.5 font-bold text-xs gap-2">
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <CalendarView
            appointments={filteredAppointments}
            onViewDetails={setSelectedAppointment}
          />
        </TabsContent>
        
        <TabsContent value="list" className="animate-in fade-in slide-in-from-bottom-2 duration-normal">
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

      {scheduleDialogOpen && (
        <ScheduleInspectionDialog 
          triggerButton={<div className="hidden" />} 
          onSuccess={() => setScheduleDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default Calendar;
