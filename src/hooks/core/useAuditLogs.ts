import { useState, useMemo, useEffect, useCallback } from "react";
import { auditLogService, AuditLogEntry, AuditEntityType } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { useDataList } from "@/hooks/shared/useDataList";

interface UseAuditLogsProps {
  entityType?: AuditEntityType;
  entityId?: string;
  itemsPerPage?: number;
}

export const useAuditLogs = ({ 
  entityType: initialEntityType, 
  entityId, 
  itemsPerPage = 10 
}: UseAuditLogsProps = {}) => {
  const { user } = useAuth();
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const handleNewLog = () => setUpdateTrigger(prev => prev + 1);
    window.addEventListener('a2_audit_log_created', handleNewLog);
    return () => window.removeEventListener('a2_audit_log_created', handleNewLog);
  }, []);

  // Getting initial logs - ideally this would be real-time or fetched on demand
  const [allLogs, setAllLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const logs = await auditLogService.getLogs({
        companyId: user?.company_id,
        isSuperAdmin: user?.is_super_admin,
        pageSize: 500 // Get a good chunk for client-side filtering
      });
      setAllLogs(logs);
    };
    fetchLogs();
  }, [user?.company_id, user?.is_super_admin, updateTrigger]);

  const filterFn = useCallback((log: AuditLogEntry, filters: any) => {
    if (filters.action && filters.action !== 'all' && log.action !== filters.action) return false;
    if (filters.entityType && filters.entityType !== 'all' && log.entity_type !== filters.entityType) return false;
    if (filters.role && filters.role !== 'all' && (log as any).performedByRole !== filters.role) return false;
    if (entityId && log.entity_id !== entityId) return false;
    
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      if (new Date(log.created_at) < from) return false;
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      if (new Date(log.created_at) > to) return false;
    }
    
    return true;
  }, [entityId]);

  const {
    filteredItems: filteredLogs,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    clearFilters
  } = useDataList<AuditLogEntry>(allLogs, {
    initialFilters: {
      action: "all",
      role: "all",
      entityType: initialEntityType || "all",
      dateFrom: "",
      dateTo: ""
    },
    filterFn
  });

  return {
    searchTerm, setSearchTerm,
    filterAction: filters.action, 
    setFilterAction: (val: string) => setFilters(prev => ({ ...prev, action: val })),
    filterRole: filters.role, 
    setFilterRole: (val: string) => setFilters(prev => ({ ...prev, role: val })),
    filterEntityType: filters.entityType, 
    setFilterEntityType: (val: string) => setFilters(prev => ({ ...prev, entityType: val })),
    dateFrom: filters.dateFrom, 
    setDateFrom: (val: string) => setFilters(prev => ({ ...prev, dateFrom: val })),
    dateTo: filters.dateTo, 
    setDateTo: (val: string) => setFilters(prev => ({ ...prev, dateTo: val })),
    selectedLog, setSelectedLog,
    isDetailOpen, setIsDetailOpen,
    filteredLogs,
    resetFilters: clearFilters
  };
};
