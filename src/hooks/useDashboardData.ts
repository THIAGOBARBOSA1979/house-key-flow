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
  const [data, setData] = useState({
    properties: propertyService.getAll().slice(0, 3),
    inspections: inspectionService.getAll().slice(0, 3),
    warrantyClaims: warrantyFlowService.getAllRequests().slice(0, 2),
    recentActivities: auditLogService.getRecentLogs(5),
    recentTickets: supportService.getAllTickets().filter(t => t.status !== 'closed').slice(0, 3),
    financialMetrics: financialService.getGlobalMetrics(),
  });
  
  const [healthMetrics, setHealthMetrics] = useState<SystemHealthMetrics>(systemHealthService.getHealthMetrics());

  // Listen to service updates
  useEffect(() => {
    const unsubProperties = propertyService.subscribe(() => {
      setData(prev => ({ ...prev, properties: propertyService.getAll().slice(0, 3) }));
    });
    const unsubInspections = inspectionService.subscribe(() => {
      setData(prev => ({ ...prev, inspections: inspectionService.getAll().slice(0, 3) }));
    });
    const unsubWarranty = warrantyFlowService.subscribe(() => {
      setData(prev => ({ ...prev, warrantyClaims: warrantyFlowService.getAllRequests().slice(0, 2) }));
    });
    const unsubLogs = auditLogService.subscribe(() => {
      setData(prev => ({ ...prev, recentActivities: auditLogService.getRecentLogs(5) }));
    });

    const interval = setInterval(() => {
      setHealthMetrics(systemHealthService.getHealthMetrics());
    }, 30000);

    return () => {
      unsubProperties();
      unsubInspections();
      unsubWarranty();
      unsubLogs();
      clearInterval(interval);
    };
  }, []);

  const refreshData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Explicit refresh
    setData({
      properties: propertyService.getAll().slice(0, 3),
      inspections: inspectionService.getAll().slice(0, 3),
      warrantyClaims: warrantyFlowService.getAllRequests().slice(0, 2),
      recentActivities: auditLogService.getRecentLogs(5),
      recentTickets: supportService.getAllTickets().filter(t => t.status !== 'closed').slice(0, 3),
      financialMetrics: financialService.getGlobalMetrics(),
    });

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
    ...data,
    healthMetrics,
    refreshData
  };
};

