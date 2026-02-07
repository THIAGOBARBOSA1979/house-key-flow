
import {
  WarrantyStage,
  SLAConfig,
  SLAStatus,
  SLADeadlineInfo,
  DEFAULT_SLA_CONFIGS,
  WARRANTY_STAGES,
  WarrantyRequestFlow
} from '@/types/warrantyFlow';

/**
 * Service for managing SLA configurations and calculations
 */
class WarrantySLAService {
  private slaConfigs: Map<string, SLAConfig> = new Map();

  constructor() {
    // Initialize with default configurations
    DEFAULT_SLA_CONFIGS.forEach(config => {
      this.slaConfigs.set(config.warrantyType, config);
    });
  }

  /**
   * Get SLA configuration for a warranty type
   */
  getSLAConfig(warrantyType: string): SLAConfig {
    const config = this.slaConfigs.get(warrantyType);
    if (config) {
      return config;
    }
    
    // Return default config if type not found
    return {
      warrantyType,
      analysisHours: 48,
      inspectionHours: 72,
      decisionHours: 24,
      executionHours: 168,
      totalHours: 312
    };
  }

  /**
   * Get all SLA configurations
   */
  getAllSLAConfigs(): SLAConfig[] {
    return Array.from(this.slaConfigs.values());
  }

  /**
   * Update SLA configuration for a warranty type
   */
  updateSLAConfig(config: SLAConfig): void {
    this.slaConfigs.set(config.warrantyType, config);
    console.log('[WarrantySLAService] SLA config updated:', config);
  }

  /**
   * Get SLA hours for a specific stage
   */
  getSLAHoursForStage(warrantyType: string, stage: WarrantyStage): number {
    const config = this.getSLAConfig(warrantyType);
    
    switch (stage) {
      case "opened":
        return 0; // No SLA for opened state
      case "in_analysis":
        return config.analysisHours;
      case "inspection_scheduled":
        return config.inspectionHours;
      case "inspection_completed":
        return config.decisionHours;
      case "approved":
        return 0; // Transition state
      case "in_execution":
        return config.executionHours;
      case "rejected":
      case "completed":
        return 0; // Final states
      default:
        return 48; // Default 2 days
    }
  }

  /**
   * Calculate deadline for a stage
   */
  calculateDeadline(
    startDate: Date, 
    slaHours: number, 
    considerBusinessDays: boolean = true
  ): Date {
    const deadline = new Date(startDate);
    
    if (considerBusinessDays) {
      // Add hours considering business days (Mon-Fri, 9-18h)
      let hoursAdded = 0;
      const hoursPerDay = 8; // Business hours per day
      const daysToAdd = Math.ceil(slaHours / hoursPerDay);
      
      let currentDate = new Date(startDate);
      while (hoursAdded < slaHours) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay();
        
        // Skip weekends
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          hoursAdded += hoursPerDay;
        }
      }
      
      deadline.setTime(currentDate.getTime());
    } else {
      // Simple hour addition
      deadline.setTime(deadline.getTime() + (slaHours * 60 * 60 * 1000));
    }
    
    return deadline;
  }

  /**
   * Calculate SLA deadline info for a request at a specific stage
   */
  calculateSLADeadlineInfo(
    request: WarrantyRequestFlow,
    stage: WarrantyStage = request.currentStage
  ): SLADeadlineInfo {
    const slaHours = this.getSLAHoursForStage(request.category, stage);
    const startedAt = request.stageStartedAt;
    const deadline = this.calculateDeadline(startedAt, slaHours);
    const now = new Date();
    
    const diffMs = deadline.getTime() - now.getTime();
    const hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const percentageRemaining = slaHours > 0 
      ? Math.max(0, Math.min(100, (hoursRemaining / slaHours) * 100))
      : 100;
    
    let status: SLAStatus;
    if (hoursRemaining <= 0) {
      status = "expired";
    } else if (percentageRemaining <= 20) {
      status = "warning";
    } else {
      status = "on_track";
    }
    
    return {
      stage,
      startedAt,
      deadline,
      hoursRemaining,
      percentageRemaining,
      status
    };
  }

  /**
   * Get SLA status for a request
   */
  getSLAStatus(request: WarrantyRequestFlow): SLAStatus {
    const info = this.calculateSLADeadlineInfo(request);
    return info.status;
  }

  /**
   * Format remaining time as human-readable string
   */
  formatRemainingTime(hoursRemaining: number): string {
    if (hoursRemaining <= 0) {
      return "Atrasado";
    }
    
    if (hoursRemaining < 24) {
      return `${hoursRemaining}h restantes`;
    }
    
    const days = Math.floor(hoursRemaining / 24);
    const hours = hoursRemaining % 24;
    
    if (hours === 0) {
      return `${days} dia${days > 1 ? 's' : ''} restante${days > 1 ? 's' : ''}`;
    }
    
    return `${days}d ${hours}h restantes`;
  }

  /**
   * Check if any SLA is expiring soon (within threshold)
   */
  checkSLAWarnings(
    requests: WarrantyRequestFlow[], 
    warningThresholdHours: number = 8
  ): WarrantyRequestFlow[] {
    return requests.filter(request => {
      const info = this.calculateSLADeadlineInfo(request);
      return info.status === "warning" || 
             (info.status === "on_track" && info.hoursRemaining <= warningThresholdHours);
    });
  }

  /**
   * Check for expired SLAs
   */
  checkExpiredSLAs(requests: WarrantyRequestFlow[]): WarrantyRequestFlow[] {
    return requests.filter(request => {
      const info = this.calculateSLADeadlineInfo(request);
      return info.status === "expired";
    });
  }

  /**
   * Calculate average resolution time by warranty type
   */
  calculateAverageTimeByType(
    completedRequests: WarrantyRequestFlow[]
  ): Record<string, number> {
    const typeMap: Record<string, { total: number; count: number }> = {};
    
    completedRequests.forEach(request => {
      if (request.completionDate) {
        const resolutionTime = request.completionDate.getTime() - request.createdAt.getTime();
        const resolutionHours = resolutionTime / (1000 * 60 * 60);
        
        if (!typeMap[request.category]) {
          typeMap[request.category] = { total: 0, count: 0 };
        }
        
        typeMap[request.category].total += resolutionHours;
        typeMap[request.category].count += 1;
      }
    });
    
    const result: Record<string, number> = {};
    Object.entries(typeMap).forEach(([type, data]) => {
      result[type] = data.count > 0 ? Math.round(data.total / data.count) : 0;
    });
    
    return result;
  }

  /**
   * Calculate SLA compliance rate
   */
  calculateComplianceRate(requests: WarrantyRequestFlow[]): number {
    const completed = requests.filter(r => r.currentStage === "completed");
    if (completed.length === 0) return 100;
    
    // Check if each completed request was finished within SLA
    let onTimeCount = 0;
    completed.forEach(request => {
      if (request.completionDate) {
        const totalConfig = this.getSLAConfig(request.category);
        const deadline = this.calculateDeadline(request.createdAt, totalConfig.totalHours);
        
        if (request.completionDate <= deadline) {
          onTimeCount++;
        }
      }
    });
    
    return Math.round((onTimeCount / completed.length) * 100);
  }

  /**
   * Get priority order for sorting
   */
  getPriorityOrder(priority: string): number {
    const order: Record<string, number> = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4
    };
    return order[priority] || 5;
  }

  /**
   * Sort requests by urgency (SLA status + priority)
   */
  sortByUrgency(requests: WarrantyRequestFlow[]): WarrantyRequestFlow[] {
    return [...requests].sort((a, b) => {
      const slaA = this.calculateSLADeadlineInfo(a);
      const slaB = this.calculateSLADeadlineInfo(b);
      
      // First by SLA status
      const slaOrder: Record<SLAStatus, number> = {
        expired: 1,
        warning: 2,
        on_track: 3
      };
      
      const slaCompare = slaOrder[slaA.status] - slaOrder[slaB.status];
      if (slaCompare !== 0) return slaCompare;
      
      // Then by priority
      const priorityCompare = this.getPriorityOrder(a.priority) - this.getPriorityOrder(b.priority);
      if (priorityCompare !== 0) return priorityCompare;
      
      // Then by hours remaining
      return slaA.hoursRemaining - slaB.hoursRemaining;
    });
  }
}

export const warrantySLAService = new WarrantySLAService();
