
import {
  WarrantyStage,
  SLAConfig,
  SLAStatus,
  SLADeadlineInfo,
  WARRANTY_STAGES,
  WarrantyRequestFlow
} from '../../types/warrantyFlow';
import { SupabaseBaseService } from '../SupabaseBaseService';
import { auditLogService } from '../core/AuditLogService';

/**
 * Service for managing SLA configurations and calculations with Supabase persistence
 */
class WarrantySLAService extends SupabaseBaseService<SLAConfig & { id: string }> {
  constructor() {
    super({
      storageKey: "a2_warranty_sla_configs",
      supabaseTable: "warranty_sla_configs",
      auditEntityType: "system_settings",
      shouldSyncWithSupabase: true
    });
  }

  /**
   * Get SLA configuration for a warranty type
   */
  getSLAConfig(warrantyType: string): SLAConfig {
    const configs = this.getAllSync();
    const config = configs.find(c => c.warrantyType === warrantyType);
    
    if (config) {
      return config;
    }
    
    // Fallback to defaults if not synced yet or not found
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
  async getAllSLAConfigs(): Promise<SLAConfig[]> {
    return await this.getAll();
  }

  /**
   * Update SLA configuration
   */
  async updateSLAConfig(config: SLAConfig & { id: string }): Promise<void> {
    await this.update(config.id, config);
    console.log('[WarrantySLAService] SLA config updated in Supabase:', config);
    
    await auditLogService.logAction({
      entityType: 'system_settings',
      entityId: config.id,
      action: 'updated',
      payload: { message: `Configuração de SLA para "${config.warrantyType}" atualizada.` }
    });
  }

  /**
   * Get SLA hours for a specific stage
   */
  getSLAHoursForStage(warrantyType: string, stage: WarrantyStage): number {
    const config = this.getSLAConfig(warrantyType);
    
    switch (stage) {
      case "opened":
        return 0;
      case "in_analysis":
        return config.analysisHours;
      case "inspection_scheduled":
        return config.inspectionHours;
      case "inspection_completed":
        return config.decisionHours;
      case "approved":
        return 0;
      case "in_execution":
        return config.executionHours;
      case "rejected":
      case "completed":
        return 0;
      default:
        return 48;
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
    
    if (slaHours === 0) return deadline;

    if (considerBusinessDays) {
      let hoursRemaining = slaHours;
      const currentDate = new Date(startDate);
      
      while (hoursRemaining > 0) {
        currentDate.setHours(currentDate.getHours() + 1);
        const dayOfWeek = currentDate.getDay();
        const hour = currentDate.getHours();
        
        // Brazilian Business Hours: Mon-Fri, 08:00 - 18:00 (10h/day)
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && hour >= 8 && hour < 18) {
          hoursRemaining--;
        }
      }
      
      return currentDate;
    } else {
      deadline.setTime(deadline.getTime() + (slaHours * 60 * 60 * 1000));
    }
    
    return deadline;
  }

  /**
   * Calculate SLA deadline info
   */
  calculateSLADeadlineInfo(
    request: WarrantyRequestFlow,
    stage: WarrantyStage = request.currentStage
  ): SLADeadlineInfo {
    const slaHours = this.getSLAHoursForStage(request.category, stage);
    const startedAt = new Date(request.stageStartedAt);
    
    const deadline = this.calculateDeadline(startedAt, slaHours);
    const now = new Date();
    
    const effectiveNow = request.isPaused && request.pausedAt ? new Date(request.pausedAt) : now;
    
    const diffMs = deadline.getTime() - effectiveNow.getTime();
    const hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const percentageRemaining = slaHours > 0 
      ? Math.max(0, Math.min(100, (hoursRemaining / slaHours) * 100))
      : 100;
    
    let status: SLAStatus;
    if (request.isPaused) {
      status = "on_track";
    } else if (hoursRemaining <= 0) {
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

  formatRemainingTime(hoursRemaining: number): string {
    if (hoursRemaining <= 0) return "Atrasado";
    if (hoursRemaining < 24) return `${hoursRemaining}h restantes`;
    
    const days = Math.floor(hoursRemaining / 24);
    const hours = hoursRemaining % 24;
    
    if (hours === 0) return `${days}d restante${days > 1 ? 's' : ''}`;
    return `${days}d ${hours}h restantes`;
  }
}

export const warrantySLAService = new WarrantySLAService();
