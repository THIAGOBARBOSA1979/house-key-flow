import { useState, useMemo, useEffect, useCallback } from "react";
import { auditLogService, AuditLogEntry, AuditEntityType } from "@/services";
import { useAuth } from "@/contexts/AuthContext";

interface UseAuditLogsProps {
  entityType?: AuditEntityType;
  entityId?: string;
  itemsPerPage?: number;
}

export const useAuditLogs = ({ 
  entityType, 
  entityId, 
  itemsPerPage = 10 
}: UseAuditLogsProps = {}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterEntityType, setFilterEntityType] = useState<string>(entityType || "all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    const handleNewLog = () => setUpdateTrigger(prev => prev + 1);
    window.addEventListener('a2_audit_log_created', handleNewLog);
    return () => window.removeEventListener('a2_audit_log_created', handleNewLog);
  }, []);

  const filteredLogs = useMemo(() => {
    return auditLogService.getFilteredLogs({
      searchTerm,
      action: filterAction,
      role: filterRole,
      entityType: filterEntityType,
      entityId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      companyId: user?.company_id,
      isSuperAdmin: user?.is_super_admin
    });
  }, [searchTerm, filterAction, filterRole, filterEntityType, entityId, dateFrom, dateTo, user?.company_id, user?.is_super_admin, updateTrigger]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const paginatedLogs = useMemo(() => 
    filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  , [filteredLogs, page, itemsPerPage]);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setFilterAction("all");
    setFilterRole("all");
    setFilterEntityType(entityType || "all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }, [entityType]);

  return {
    searchTerm, setSearchTerm,
    filterAction, setFilterAction,
    filterRole, setFilterRole,
    filterEntityType, setFilterEntityType,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    page, setPage,
    selectedLog, setSelectedLog,
    isDetailOpen, setIsDetailOpen,
    filteredLogs,
    paginatedLogs,
    totalPages,
    resetFilters
  };
};
