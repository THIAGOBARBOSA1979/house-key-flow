import { useState, useCallback, useMemo, useEffect } from "react";
import { inspectionService } from "@/services";
import { useService, useDataList } from "@/hooks";
import { getUnifiedAppointments } from "@/components/calendar/AppointmentData";
import { Appointment } from "@/types";
import { Inspection } from "@/services/operations/InspectionService";

export const useCalendar = () => {
  const { items: inspections, isLoading, refresh: loadData } = useService<Inspection>(inspectionService);

  const appointments = useMemo(() => {
    return getUnifiedAppointments();
  }, [inspections]);

  const filterFn = useCallback((apt: Appointment, currentFilters: { type: string, status: string, property: string }) => {
    const matchesType = currentFilters.type === "all" || apt.type === currentFilters.type;
    const matchesStatus = currentFilters.status === "all" || apt.status === currentFilters.status;
    const matchesProperty = currentFilters.property === "all" || apt.property === currentFilters.property;
    return matchesType && matchesStatus && matchesProperty;
  }, []);

  const {
    filteredItems: filteredAppointments,
    filters,
    setFilters,
    clearFilters
  } = useDataList<Appointment>(appointments, {
    initialFilters: { type: "all", status: "all", property: "all" },
    filterFn
  });

  const stats = useMemo(() => {
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

    return {
      todayAppointments,
      pendingAppointments,
      completedThisWeek
    };
  }, [filteredAppointments]);

  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    await inspectionService.updateStatus(id, newStatus);
    loadData();
  }, [loadData]);

  const handleUpdateAppointment = useCallback(async (id: string, data: Partial<Inspection>) => {
    await inspectionService.update(id, data);
    loadData();
  }, [loadData]);

  return {
    appointments,
    filteredAppointments,
    isLoading,
    filters,
    setFilters,
    stats,
    handleStatusChange,
    handleUpdateAppointment,
    loadData,
    clearFilters
  };
};
