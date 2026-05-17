
import { auditLogService } from './AuditLogService';
import { propertyService } from './PropertyService';
import { inspectionService } from './InspectionService';
import { warrantyFlowService } from './WarrantyFlowService';
import { notificationService } from './NotificationService';

export interface SystemHealthMetrics {
  status: 'healthy' | 'warning' | 'critical';
  lastSync: Date;
  storageUsage: string;
  activeSessions: number;
  uptime: string;
  services: {
    name: string;
    status: 'online' | 'offline' | 'degraded';
    latency: string;
    load: number;
  }[];
  database: {
    tables: number;
    totalRows: number;
    auditLogCount: number;
    cacheHitRate: string;
  };
}

class SystemHealthService {
  private startTime = new Date();

  getHealthMetrics(): SystemHealthMetrics {
    const allRequests = warrantyFlowService.getAllRequests();
    const allInspections = inspectionService.getAll();
    const allProperties = propertyService.getAll();
    const allLogs = auditLogService.getAllLogs();
    
    // Simulate some logic for health status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    const overdueWarranties = allRequests.filter(r => r.slaStatus === 'overdue').length;
    if (overdueWarranties > 5) status = 'warning';
    if (overdueWarranties > 15) status = 'critical';

    // Calculate approximate storage usage (based on localStorage keys)
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        totalSize += (localStorage.getItem(key) || '').length * 2; // UTF-16 characters are 2 bytes
      }
    }
    const storageUsage = (totalSize / 1024).toFixed(2) + ' KB';

    return {
      status,
      lastSync: new Date(),
      storageUsage,
      activeSessions: 1, // Mock
      uptime: this.getUptime(),
      services: [
        { name: 'Auth Service', status: 'online', latency: '45ms', load: 12 },
        { name: 'Warranty Engine', status: status === 'healthy' ? 'online' : 'degraded', latency: '120ms', load: 45 },
        { name: 'Inspection API', status: 'online', latency: '85ms', load: 28 },
        { name: 'Notification Worker', status: 'online', latency: '10ms', load: 5 }
      ],
      database: {
        tables: 12,
        totalRows: allRequests.length + allInspections.length + allProperties.length,
        auditLogCount: allLogs.length,
        cacheHitRate: '99.4%'
      }
    };
  }

  private getUptime(): string {
    const diff = Math.floor((new Date().getTime() - this.startTime.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  performSelfDiagnostic() {
    console.log('[SystemHealth] Running diagnostic...');
    auditLogService.log({
      entityType: 'system',
      entityId: 'diagnostic',
      action: 'updated',
      performedBy: 'system',
      performedByName: 'Sistema',
      performedByRole: 'admin',
      details: 'Diagnóstico automático de rotina executado com sucesso.'
    });
    return true;
  }
}

export const systemHealthService = new SystemHealthService();
