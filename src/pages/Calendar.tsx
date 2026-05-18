import { useState, useCallback } from "react";
import { CalendarHeader } from "@/components/Calendar/CalendarHeader";
import { CalendarView } from "@/components/Calendar/CalendarView";
import { ListView } from "@/components/Calendar/ListView";
import { AppointmentDetails } from "@/components/Calendar/AppointmentDetails";
import { CalendarFilters } from "@/components/Calendar/CalendarFilters";
import { QuickActions } from "@/components/Calendar/QuickActions";
import { ScheduleInspectionDialog } from "@/components/Inspection/ScheduleInspectionDialog";
import { useCalendar } from "@/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, List } from "lucide-react";

const Calendar = () => {
  const {
    appointments,
    filteredAppointments,
    isLoading,
    filters,
    setFilters,
    stats,
    handleStatusChange,
    handleUpdateAppointment,
    loadData
  } = useCalendar();

  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const handleNewAppointment = () => {
    setScheduleDialogOpen(true);
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
        todayAppointments={stats.todayAppointments}
        pendingAppointments={stats.pendingAppointments}
        completedThisWeek={stats.completedThisWeek}
        onNewAppointment={handleNewAppointment}
        setFilterSheetOpen={setFilterSheetOpen}
      />

      <CalendarFilters
        filterType={filters.type}
        setFilterType={(type) => setFilters(prev => ({ ...prev, type }))}
        filterProperty={filters.property}
        setFilterProperty={(property) => setFilters(prev => ({ ...prev, property }))}
        filterStatus={filters.status}
        setFilterStatus={(status) => setFilters(prev => ({ ...prev, status }))}
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
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <CalendarView
              appointments={filteredAppointments}
              onViewDetails={setSelectedAppointment}
            />
          )}
        </TabsContent>
        
        <TabsContent value="list" className="animate-in fade-in slide-in-from-bottom-2 duration-normal">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ListView
              appointments={filteredAppointments}
              onViewDetails={setSelectedAppointment}
              filterOptions={{
                filterType: filters.type,
                filterProperty: filters.property,
                filterStatus: filters.status,
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      {selectedAppointment && (
        <AppointmentDetails
          selectedAppointment={selectedAppointment}
          appointments={appointments}
          isOpen={!!selectedAppointment}
          onOpenChange={(open) => !open && setSelectedAppointment(null)}
          onStatusChange={handleStatusChange}
          onUpdate={handleUpdateAppointment}
        />
      )}

      {scheduleDialogOpen && (
        <ScheduleInspectionDialog 
          triggerButton={<div className="hidden" />} 
          onSuccess={() => {
            setScheduleDialogOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default Calendar;
