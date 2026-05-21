import { 
  WarrantyItem, 
  WarrantyEligibilityResult, 
  WarrantyErrorResponse,
  WarrantyRequest,
  WarrantyProblemData
} from "@/types/warranty";
import { warrantyFlowService } from "../warranty/WarrantyFlowService";
import { clientStageService } from "../operations/ClientStageService";
import { SupabaseBaseService } from "../SupabaseBaseService";
import { FilterParams } from "@/integrations/supabase";

class WarrantyValidationService extends SupabaseBaseService<WarrantyItem> {
  constructor() {
    super({
      storageKey: "a2_warranty_items",
      supabaseTable: "warranty_items",
      auditEntityType: "warranty",
      shouldSyncWithSupabase: true,
      fieldMapping: {
        dataInicioGarantia: 'warranty_start_date',
        dataFimGarantia: 'warranty_end_date',
        statusGarantia: 'status',
        warrantyYears: 'warranty_years'
      }
    });
  }

  protected mapFromSupabase(raw: any): WarrantyItem {
    const mapped = super.mapFromSupabase(raw);
    return {
      ...mapped,
      dataInicioGarantia: raw.warranty_start_date ? new Date(raw.warranty_start_date) : (typeof mapped.dataInicioGarantia === 'string' ? new Date(mapped.dataInicioGarantia) : mapped.dataInicioGarantia),
      dataFimGarantia: raw.warranty_end_date ? new Date(raw.warranty_end_date) : (typeof mapped.dataFimGarantia === 'string' ? new Date(mapped.dataFimGarantia) : mapped.dataFimGarantia)
    };
  }

  isWarrantyActive(item: WarrantyItem): boolean {
    const now = new Date();
    if (item.statusGarantia !== "ativa") return false;
    if (now < item.dataInicioGarantia) return false;
    if (now > item.dataFimGarantia) return false;
    return true;
  }

  getEligibility(item: WarrantyItem, clientId: string): WarrantyEligibilityResult {
    const now = new Date();
    
    if (item.clientId !== clientId) {
      return {
        isEligible: false,
        reason: "not_owned",
        message: "Este item não está vinculado à sua conta.",
      };
    }
    
    if (item.statusGarantia === "cancelada") {
      return {
        isEligible: false,
        reason: "cancelled",
        message: "A garantia deste item foi cancelada.",
      };
    }
    
    if (item.statusGarantia === "expirada") {
      return {
        isEligible: false,
        reason: "expired",
        message: "A garantia deste item expirou.",
      };
    }
    
    if (now < item.dataInicioGarantia) {
      return {
        isEligible: false,
        reason: "not_started",
        message: "A garantia deste item ainda não iniciou.",
      };
    }
    
    if (now > item.dataFimGarantia) {
      return {
        isEligible: false,
        reason: "expired",
        message: "A garantia deste item expirou.",
      };
    }
    
    const totalDays = Math.floor(
      (item.dataFimGarantia.getTime() - item.dataInicioGarantia.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = Math.floor(
      (item.dataFimGarantia.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const percentageRemaining = Math.round((daysRemaining / totalDays) * 100);
    
    return {
      isEligible: true,
      reason: "active",
      message: "Garantia ativa",
      daysRemaining,
      percentageRemaining,
    };
  }

  /**
   * Performance Optimized: Use server-side filtering (Onda 17)
   */
  async getWarrantyItemsByClient(clientId: string): Promise<WarrantyItem[]> {
    const filters: FilterParams[] = [{ column: 'client_id', operator: 'eq', value: clientId }];
    return await this.getAll(undefined, true, filters);
  }

  /**
   * Performance Optimized: Use server-side filtering (Onda 17)
   */
  async getEligibleWarrantyItems(clientId: string): Promise<WarrantyItem[]> {
    const filters: FilterParams[] = [
      { column: 'client_id', operator: 'eq', value: clientId },
      { column: 'status', operator: 'eq', value: 'ativa' }
    ];
    const items = await this.getAll(undefined, true, filters);
    // Date checks still need to be in-memory for precision or we could use DB current_date
    return items.filter(item => this.isWarrantyActive(item));
  }

  async validateAndCreateRequest(
    itemId: string,
    clientId: string,
    data: {
      title: string;
      problems: WarrantyProblemData[];
      additionalInfo?: string;
    }
  ): Promise<{ success: true; request: WarrantyRequest } | { success: false; error: WarrantyErrorResponse }> {
    const item = await this.getById(itemId);
    
    if (!item) {
      return {
        success: false,
        error: {
          error: "Este item não possui garantia ativa e não pode gerar uma solicitaçao.",
          code: "WARRANTY_INACTIVE",
          details: {
            item_id: itemId,
            reason: "not_owned",
          },
        },
      };
    }
    
    const eligibility = this.getEligibility(item, clientId);
    
    if (!eligibility.isEligible) {
      return {
        success: false,
        error: {
          error: "Este item não possui garantia ativa e não pode gerar uma solicitaçao.",
          code: eligibility.reason === "not_owned" ? "WARRANTY_NOT_OWNED" : "WARRANTY_INACTIVE",
          details: {
            item_id: itemId,
            reason: eligibility.reason as "expired" | "cancelled" | "not_started" | "not_owned",
          },
        },
      };
    }
    
    const request: WarrantyRequest = {
      id: `req-${Date.now()}`,
      itemId,
      clientId,
      title: data.title,
      description: data.problems.map(p => p.description).join("; "),
      category: item.category,
      priority: this.determinePriority(data.problems),
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      problems: data.problems,
      additionalInfo: data.additionalInfo,
    };
    
    const profile = clientStageService.getClientProfile(clientId);
    await warrantyFlowService.createRequest({
      clientId,
      clientName: profile?.name || "Cliente",
      propertyId: item.propertyId,
      propertyName: item.propertyName,
      unitNumber: item.unitNumber,
      title: data.title,
      description: data.problems.map(p => p.description).join("; "),
      category: item.category,
      problems: data.problems.map(p => ({
        id: p.id || `prob-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        category: p.category,
        location: p.location,
        description: p.description,
        severity: p.severity,
        photos: p.photos,
        status: "pending"
      }))
    });

    return { success: true, request };
  }

  private determinePriority(problems: WarrantyProblemData[]): "low" | "medium" | "high" | "critical" {
    const hasSevere = problems.some(p => p.severity === "severe");
    const hasModerate = problems.some(p => p.severity === "moderate");
    if (hasSevere) return "high";
    if (hasModerate) return "medium";
    return "low";
  }
}

export const warrantyValidationService = new WarrantyValidationService();
export default warrantyValidationService;
