import { useMemo, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

import { propertyService } from "@/services";
import { inspectionService } from "@/services";
import { 
  warrantyFlowService, 
  auditLogService, 
  supportService, 
  financialService, 
  systemHealthService 
} from "@/services";
import { SystemHealthMetrics } from "@/services";
import { useToast } from "@/components/ui/use-toast";

/**
 * Custom hook to manage and provide data for the Admin Dashboard.
 */
export const useDashboardData = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const companyId = user?.company_id;
  const [loading, setLoading] = useState(false);
  
  const initialData = useMemo(() => ({
    properties: propertyService.getAll(companyId, user?.is_super_admin).slice(0, 3),
    inspections: inspectionService.getAll(companyId, user?.is_super_admin).slice(0, 3),
    warrantyClaims: warrantyFlowService.getAllRequests().filter(r => user?.is_super_admin || (r as any).company_id === companyId).slice(0, 2),
    recentActivities: [], // Start empty, will be populated by useEffect

    recentTickets: supportService.getAllTickets().filter(t => (user?.is_super_admin || (t as any).company_id === companyId) && t.status !== 'closed').slice(0, 3),
    financialMetrics: { totalPaid: 0, totalOverdue: 0, totalReceivable: 0, revenueByMonth: [] },
    propertyMetrics: propertyService.getMetrics(companyId, user?.is_super_admin),
  }), [companyId, user?.is_super_admin]);



  const [data, setData] = useState(initialData);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Explicit refresh
    setData({
      properties: propertyService.getAll(companyId, user?.is_super_admin).slice(0, 3),
      inspections: inspectionService.getAll(companyId, user?.is_super_admin).slice(0, 3),
      warrantyClaims: warrantyFlowService.getAllRequests().filter(r => user?.is_super_admin || (r as any).company_id === companyId).slice(0, 2),
      recentActivities: auditLogService.getRecentLogs(5),

      recentTickets: supportService.getAllTickets().filter(t => (user?.is_super_admin || (t as any).company_id === companyId) && t.status !== 'closed').slice(0, 3),
      financialMetrics: { totalPaid: 0, totalOverdue: 0, totalReceivable: 0, revenueByMonth: [] },
      propertyMetrics: propertyService.getMetrics(companyId, user?.is_super_admin),
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
  }, [toast]);
  
  const [healthMetrics, setHealthMetrics] = useState<SystemHealthMetrics>(systemHealthService.getHealthMetrics());

  // Listen to service updates
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    // Batch updates to avoid multiple re-renders
    const scheduleUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setData({
          properties: propertyService.getAll(companyId, user?.is_super_admin).slice(0, 3),
          inspections: inspectionService.getAll(companyId, user?.is_super_admin).slice(0, 3),
          warrantyClaims: warrantyFlowService.getAllRequests().filter(r => user?.is_super_admin || (r as any).company_id === companyId).slice(0, 2),
          recentActivities: auditLogService.getRecentLogs(5),
          recentTickets: supportService.getAllTickets().filter(t => (user?.is_super_admin || (t as any).company_id === companyId) && t.status !== 'closed').slice(0, 3),
          financialMetrics: { totalPaid: 0, totalOverdue: 0, totalReceivable: 0, revenueByMonth: [] },
          propertyMetrics: propertyService.getMetrics(companyId, user?.is_super_admin),
        });


      }, 50);
    };

    const unsubProperties = propertyService.subscribe(scheduleUpdate);
    const unsubInspections = inspectionService.subscribe(scheduleUpdate);
    const unsubWarranty = warrantyFlowService.subscribe(scheduleUpdate);
    const unsubLogs = auditLogService.subscribe(scheduleUpdate);

    const interval = setInterval(() => {
      setHealthMetrics(systemHealthService.getHealthMetrics());
    }, 30000);

    return () => {
      unsubProperties();
      unsubInspections();
      unsubWarranty();
      unsubLogs();
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, []);


  return {
    loading,
    ...data,
    healthMetrics,
    refreshData
  };
};

