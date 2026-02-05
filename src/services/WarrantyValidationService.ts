
import { 
  WarrantyItem, 
  WarrantyEligibilityResult, 
  WarrantyErrorResponse,
  WarrantyRequest,
  WarrantyProblemData
} from "@/types/warranty";

// Mock data for warranty items
const mockWarrantyItems: WarrantyItem[] = [
  {
    id: "witem-1",
    clientId: "client-1",
    propertyId: "prop-1",
    propertyName: "Edifício Aurora",
    unitNumber: "204",
    category: "Instalações Hidráulicas",
    name: "Instalações Hidráulicas",
    description: "Sistema completo de água fria e quente, incluindo tubulações, conexões e registros",
    dataInicioGarantia: new Date(2025, 3, 15), // 15/04/2025
    dataFimGarantia: new Date(2027, 3, 15), // 15/04/2027
    statusGarantia: "ativa",
    warrantyYears: 2,
  },
  {
    id: "witem-2",
    clientId: "client-1",
    propertyId: "prop-1",
    propertyName: "Edifício Aurora",
    unitNumber: "204",
    category: "Impermeabilização",
    name: "Impermeabilização",
    description: "Impermeabilização de áreas molhadas, lajes e terraços",
    dataInicioGarantia: new Date(2025, 3, 15), // 15/04/2025
    dataFimGarantia: new Date(2028, 3, 15), // 15/04/2028
    statusGarantia: "ativa",
    warrantyYears: 3,
  },
  {
    id: "witem-3",
    clientId: "client-1",
    propertyId: "prop-1",
    propertyName: "Edifício Aurora",
    unitNumber: "204",
    category: "Revestimentos Cerâmicos",
    name: "Revestimentos Cerâmicos",
    description: "Pisos e azulejos cerâmicos em todos os ambientes",
    dataInicioGarantia: new Date(2024, 3, 15), // 15/04/2024
    dataFimGarantia: new Date(2025, 3, 15), // 15/04/2025
    statusGarantia: "expirada",
    warrantyYears: 1,
  },
  {
    id: "witem-4",
    clientId: "client-1",
    propertyId: "prop-1",
    propertyName: "Edifício Aurora",
    unitNumber: "204",
    category: "Esquadrias",
    name: "Esquadrias de Alumínio",
    description: "Janelas, portas e divisórias em alumínio",
    dataInicioGarantia: new Date(2025, 3, 15), // 15/04/2025
    dataFimGarantia: new Date(2026, 3, 15), // 15/04/2026
    statusGarantia: "cancelada",
    warrantyYears: 1,
  },
  {
    id: "witem-5",
    clientId: "client-1",
    propertyId: "prop-1",
    propertyName: "Edifício Aurora",
    unitNumber: "204",
    category: "Estrutural",
    name: "Estrutura de Concreto",
    description: "Fundações, pilares, vigas e lajes estruturais",
    dataInicioGarantia: new Date(2025, 3, 15), // 15/04/2025
    dataFimGarantia: new Date(2030, 3, 15), // 15/04/2030
    statusGarantia: "ativa",
    warrantyYears: 5,
  },
  {
    id: "witem-6",
    clientId: "client-1",
    propertyId: "prop-1",
    propertyName: "Edifício Aurora",
    unitNumber: "204",
    category: "Elétrica",
    name: "Instalações Elétricas",
    description: "Fiação, quadros de distribuição e tomadas",
    dataInicioGarantia: new Date(2025, 3, 15), // 15/04/2025
    dataFimGarantia: new Date(2027, 3, 15), // 15/04/2027
    statusGarantia: "ativa",
    warrantyYears: 2,
  },
];

class WarrantyValidationService {
  /**
   * Check if a warranty item is currently active
   */
  isWarrantyActive(item: WarrantyItem): boolean {
    const now = new Date();
    
    // Check status
    if (item.statusGarantia !== "ativa") {
      return false;
    }
    
    // Check date range
    if (now < item.dataInicioGarantia) {
      return false;
    }
    
    if (now > item.dataFimGarantia) {
      return false;
    }
    
    return true;
  }

  /**
   * Get detailed eligibility result for a warranty item
   */
  getEligibility(item: WarrantyItem, clientId: string): WarrantyEligibilityResult {
    const now = new Date();
    
    // Check ownership
    if (item.clientId !== clientId) {
      return {
        isEligible: false,
        reason: "not_owned",
        message: "Este item não está vinculado à sua conta.",
      };
    }
    
    // Check status
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
    
    // Check if warranty hasn't started
    if (now < item.dataInicioGarantia) {
      return {
        isEligible: false,
        reason: "not_started",
        message: "A garantia deste item ainda não iniciou.",
      };
    }
    
    // Check if warranty has expired by date
    if (now > item.dataFimGarantia) {
      return {
        isEligible: false,
        reason: "expired",
        message: "A garantia deste item expirou.",
      };
    }
    
    // Calculate remaining time
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
   * Get all warranty items for a client
   */
  getWarrantyItemsByClient(clientId: string): WarrantyItem[] {
    return mockWarrantyItems.filter(item => item.clientId === clientId);
  }

  /**
   * Get only eligible warranty items for a client
   */
  getEligibleWarrantyItems(clientId: string): WarrantyItem[] {
    return mockWarrantyItems.filter(
      item => item.clientId === clientId && this.isWarrantyActive(item)
    );
  }

  /**
   * Validate and create a warranty request
   */
  validateAndCreateRequest(
    itemId: string,
    clientId: string,
    data: {
      title: string;
      problems: WarrantyProblemData[];
      additionalInfo?: string;
    }
  ): { success: true; request: WarrantyRequest } | { success: false; error: WarrantyErrorResponse } {
    // Find the item
    const item = mockWarrantyItems.find(i => i.id === itemId);
    
    if (!item) {
      return {
        success: false,
        error: {
          error: "Este item não possui garantia ativa e não pode gerar uma solicitação.",
          code: "WARRANTY_INACTIVE",
          details: {
            item_id: itemId,
            reason: "not_owned",
          },
        },
      };
    }
    
    // Check eligibility
    const eligibility = this.getEligibility(item, clientId);
    
    if (!eligibility.isEligible) {
      return {
        success: false,
        error: {
          error: "Este item não possui garantia ativa e não pode gerar uma solicitação.",
          code: eligibility.reason === "not_owned" ? "WARRANTY_NOT_OWNED" : "WARRANTY_INACTIVE",
          details: {
            item_id: itemId,
            reason: eligibility.reason as "expired" | "cancelled" | "not_started" | "not_owned",
          },
        },
      };
    }
    
    // Create the request
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
    
    return { success: true, request };
  }

  /**
   * Determine priority based on problem severity
   */
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
