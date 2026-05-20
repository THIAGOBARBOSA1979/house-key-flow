import { SupabaseBaseService } from "../SupabaseBaseService";
import { Supabase } from "@/integrations/supabase";
import { auditLogService } from "@/services/core/AuditLogService";
import { Database } from "@/integrations/supabase/types";

export interface Installment {
  id: string;
  company_id?: string;
  number: number;
  dueDate: Date;
  value: number;
  status: 'paid' | 'pending' | 'overdue';
  type: 'monthly' | 'annual' | 'delivery' | 'extra';
}

export interface FinancialSummary {
  totalValue: number;
  paidValue: number;
  balanceDue: number;
  nextPayment: Installment | null;
  progress: number;
}

const INITIAL_INSTALLMENTS: Installment[] = [
  { id: 'inst-1', company_id: 'comp-1', number: 1, dueDate: new Date(2024, 0, 15), value: 2500, status: 'paid', type: 'monthly' },
  { id: 'inst-2', company_id: 'comp-1', number: 2, dueDate: new Date(2024, 1, 15), value: 2500, status: 'paid', type: 'monthly' },
  { id: 'inst-3', company_id: 'comp-1', number: 3, dueDate: new Date(2024, 2, 15), value: 2500, status: 'paid', type: 'monthly' },
  { id: 'inst-4', company_id: 'comp-1', number: 4, dueDate: new Date(2024, 3, 15), value: 2500, status: 'paid', type: 'monthly' },
  { id: 'inst-5', company_id: 'comp-1', number: 5, dueDate: new Date(2024, 4, 15), value: 2500, status: 'paid', type: 'monthly' },
  { id: 'inst-6', company_id: 'comp-1', number: 6, dueDate: new Date(2024, 5, 15), value: 2500, status: 'pending', type: 'monthly' },
  { id: 'inst-7', company_id: 'comp-1', number: 7, dueDate: new Date(2024, 6, 15), value: 2500, status: 'pending', type: 'monthly' },
  { id: 'inst-8', company_id: 'comp-1', number: 8, dueDate: new Date(2024, 7, 15), value: 2500, status: 'pending', type: 'monthly' },
  { id: 'inst-9', company_id: 'comp-1', number: 0, dueDate: new Date(2024, 11, 20), value: 55000, status: 'pending', type: 'delivery' },
];

class FinancialService extends SupabaseBaseService<Installment> {
  constructor() {
    super({
      storageKey: "a2_financial_data",
      supabaseTable: "audit_logs" as keyof Database['public']['Tables'], // Dummy table
      auditEntityType: "financial",
      shouldSyncWithSupabase: false
    }, INITIAL_INSTALLMENTS);
  }

  getInstallmentsByClient(clientId: string, companyId?: string, isSuperAdmin?: boolean): Installment[] { 
    return this.getAll(companyId, isSuperAdmin); 
  }

  getFinancialSummary(clientId: string, companyId?: string, isSuperAdmin?: boolean): FinancialSummary {
    const installments = this.getAll(companyId, isSuperAdmin);
    const totalValue = installments.reduce((acc, curr) => acc + curr.value, 0);
    const paidValue = installments
      .filter(i => i.status === 'paid')
      .reduce((acc, curr) => acc + curr.value, 0);
    
    const nextPayment = installments
      .filter(i => i.status === 'pending')
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0] || null;

    return {
      totalValue,
      paidValue,
      balanceDue: totalValue - paidValue,
      nextPayment,
      progress: totalValue > 0 ? (paidValue / totalValue) * 100 : 0
    };
  }

  getGlobalMetrics(companyId?: string, isSuperAdmin?: boolean) {
    if (!isSuperAdmin && !companyId) return {
      totalReceivable: 0,
      totalPaid: 0,
      totalOverdue: 0,
      collectionEfficiency: 0,
      billingGroups: [],
      revenueByMonth: []
    };

    return {
      totalReceivable: 10000000,
      totalPaid: 8450000,
      totalOverdue: 125000,
      collectionEfficiency: 98.5,
      billingGroups: [
        { id: "bg1", name: "Edifício Aurora - Mensalidades", propertyId: "1", total: 450000, count: 120 },
      ],
      revenueByMonth: [
        { month: 'Jan', value: 450000 },
        { month: 'Fev', value: 520000 },
        { month: 'Mar', value: 480000 },
        { month: 'Abr', value: 610000 },
        { month: 'Mai', value: 590000 },
        { month: 'Jun', value: 650000 }
      ]
    };
  }

  getRecentTransactions(companyId?: string, isSuperAdmin?: boolean) {
    const relevantItems = this.getAll(companyId, isSuperAdmin);
    return relevantItems.map(i => ({
      id: i.id,
      client: 'Cliente Exemplo',
      property: 'Edifício Aurora',
      value: i.value,
      date: i.dueDate,
      type: i.type === 'monthly' ? 'Mensalidade' : 'Extra',
      status: i.status
    })).slice(0, 5);
  }

  processPayment(transactionId: string) {
    const updated = this.update(transactionId, { status: 'paid' });
    if (updated) {
      auditLogService.logAction({
        entityType: 'financial',
        entityId: transactionId,
        action: 'payment_received',
        payload: { message: `Pagamento da transação ${transactionId} processado.` }
      });
    }
    return !!updated;
  }
}

export const financialService = new FinancialService();
