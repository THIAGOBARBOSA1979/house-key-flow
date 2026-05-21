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

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [properties, inspections, warrantyClaims, recentActivities, recentTickets] = await Promise.all([
        propertyService.getAll(companyId, isSuperAdmin),
        inspectionService.getAll(companyId, isSuperAdmin),
        warrantyFlowService.getAllRequests(companyId, isSuperAdmin),
        auditLogService.getRecentLogsAsync(5),
        supportService.getAll(companyId, isSuperAdmin)
      ]);

      setData({
        properties: properties.slice(0, 3),
        inspections: inspections.slice(0, 3),
        warrantyClaims: warrantyClaims.slice(0, 2),
        recentActivities,
        recentTickets: recentTickets.filter((t: any) => t.status !== 'closed').slice(0, 3),
        propertyMetrics: propertyService.getMetrics(companyId, isSuperAdmin),
        technicalConformity: inspectionService.getTechnicalConformityScore(companyId, isSuperAdmin),
      });

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

  const [healthMetrics, setHealthMetrics] = useState<SystemHealthMetrics>(systemHealthService.getHealthMetrics());

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      setHealthMetrics(systemHealthService.getHealthMetrics());
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

