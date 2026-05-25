import { useMemo, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { propertyService, inspectionService, warrantyFlowService, auditLogService, supportService, systemHealthService } from "@/services";
import { SystemHealthMetrics } from "@/services";
import { useToast } from "@/components/ui/use-toast";

export const useDashboardData = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const companyId = user?.company_id;
  const isSuperAdmin = !!user?.is_super_admin;
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    properties: [],
    inspections: [],
    warrantyClaims: [],
    recentActivities: [],
    recentTickets: [],
    propertyMetrics: null,
    technicalConformity: 100
  });

  const [healthMetrics, setHealthMetrics] = useState<SystemHealthMetrics | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [properties, inspections, warrantyClaims, recentActivities, recentTickets, hMetrics] = await Promise.all([
        propertyService.getAll(companyId, isSuperAdmin),
        inspectionService.getAll(companyId, isSuperAdmin),
        warrantyFlowService.getAllRequests(companyId, isSuperAdmin),
        auditLogService.getRecentLogsAsync(5),
        supportService.getAll(companyId, isSuperAdmin),
        systemHealthService.getHealthMetrics()
      ]);

      setData({
        properties: properties.slice(0, 3),
        inspections: inspections.slice(0, 3),
        warrantyClaims: warrantyClaims.slice(0, 2),
        recentActivities,
        recentTickets: recentTickets.filter((t: any) => t.status !== 'closed').slice(0, 3),
        propertyMetrics: propertyService.getMetricsSync(companyId, isSuperAdmin),
        technicalConformity: await inspectionService.getTechnicalConformityScore(companyId, isSuperAdmin),
      });

      setHealthMetrics(hMetrics);

      toast({ 
        title: "Dados atualizados", 
        description: "O dashboard foi sincronizado com os dados mais recentes." 
      });
    } catch (err) {
      console.error("Dashboard refresh error:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId, isSuperAdmin, toast]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(async () => {
      const hMetrics = await systemHealthService.getHealthMetrics();
      setHealthMetrics(hMetrics);
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  return {
    loading,
    ...data,
    healthMetrics,
    refreshData
  };
};

