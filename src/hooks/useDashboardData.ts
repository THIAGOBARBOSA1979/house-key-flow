import { useMemo, useState, useEffect } from "react";
import { propertyService } from "@/services/PropertyService";
import { inspectionService } from "@/services/InspectionService";
import { warrantyFlowService } from "@/services/WarrantyFlowService";
import { auditLogService } from "@/services/AuditLogService";
import { supportService } from "@/services/SupportService";
import { financialService } from "@/services/FinancialService";
import { systemHealthService, SystemHealthMetrics } from "@/services/SystemHealthService";
import { useToast } from "@/components/ui/use-toast";

/**
 * Custom hook to manage and provide data for the Admin Dashboard.
 */
export const useDashboardData = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const properties = useMemo(() => propertyService.getAll().slice(0, 3), []);
  const inspections = useMemo(() => inspectionService.getAll().slice(0, 3), []);
  const warrantyClaims = useMemo(() => warrantyFlowService.getAllRequests().slice(0, 2), []);
  const recentActivities = useMemo(() => auditLogService.getRecentLogs(5), []);
  const recentTickets = useMemo(() => supportService.getAllTickets().filter(t => t.status !== 'closed').slice(0, 3), []);
  const financialMetrics = useMemo(() => financialService.getGlobalMetrics(), []);
  
  const [healthMetrics, setHealthMetrics] = useState<SystemHealthMetrics>(systemHealthService.getHealthMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setHealthMetrics(systemHealthService.getHealthMetrics());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 800));
    
    auditLogService.log({
      entityType: 'system',
      entityId: 'dashboard',
      action: 'updated',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: 'Dashboard sincronizado manualmente.'
    });
    
    toast({ 
      title: "Dados atualizados", 
      description: "O dashboard foi sincronizado com os dados mais recentes." 
    });
    setLoading(false);
  };

  return {
    loading,
    properties,
    inspections,
    warrantyClaims,
    recentActivities,
    recentTickets,
    financialMetrics,
    healthMetrics,
    refreshData
  };
};
