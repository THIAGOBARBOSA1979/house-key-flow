import { useState, useCallback, useMemo, useEffect } from "react";
import { inspectionService } from "@/services";
import { useService, useDataList } from "@/hooks";
import { getUnifiedAppointments, type Appointment } from "@/components/Calendar/AppointmentData";

export const useCalendar = () => {
  const { items: inspections, isLoading, refresh: loadData } = useService<any>(inspectionService);

  const appointments = useMemo(() => {
    return getUnifiedAppointments();
  }, [inspections]);

  const filterFn = useCallback((apt: Appointment, filters: any) => {
    const matchesType = filters.type === "all" || apt.type === filters.type;
    const matchesStatus = filters.status === "all" || apt.status === filters.status;
    const matchesProperty = filters.property === "all" || apt.property === filters.property;
    return matchesType && matchesStatus && matchesProperty;
  }, []);

  const {
    filteredItems: filteredAppointments,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    clearFilters
  } = useDataList<Appointment>(appointments as any, {
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

  const handleUpdateAppointment = useCallback(async (id: string, data: any) => {
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
