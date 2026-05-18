import { BaseService } from "./BaseService";
import { auditLogService } from "./AuditLogService";

export interface Installment {
  id: string;
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
  { id: 'inst-1', number: 1, dueDate: new Date(2024, 4, 15), value: 2500, status: 'paid', type: 'monthly' },
  { id: 'inst-2', number: 2, dueDate: new Date(2024, 5, 15), value: 2500, status: 'paid', type: 'monthly' },
  { id: 'inst-3', number: 3, dueDate: new Date(2024, 6, 15), value: 2500, status: 'pending', type: 'monthly' },
];

class FinancialService extends BaseService<Installment> {
  constructor() {
    super("a2_financial_data", INITIAL_INSTALLMENTS);
  }

  protected loadFromStorage() {
    super.loadFromStorage();
    this.items = this.items.map(i => ({
      ...i,
      dueDate: new Date(i.dueDate)
    }));
  }

  getFinancialSummary(clientId: string): FinancialSummary {
    const installments = this.items;
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

  getGlobalMetrics() {
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

  getRecentTransactions() {
    return [
      { id: 'tx-1', client: 'João Silva', property: 'Residencial Aurora', value: 2500, date: new Date(), type: 'Mensalidade', status: 'paid' },
    ];
  }

  processPayment(transactionId: string) {
    const updated = this.update(transactionId, { status: 'paid' });
    if (updated) {
      auditLogService.log({
        entityType: 'financial',
        entityId: transactionId,
        action: 'payment_received',
        performedBy: 'admin-1',
        performedByName: 'Administrador',
        performedByRole: 'admin',
        details: `Pagamento da transação ${transactionId} processado.`
      });
    }
    return !!updated;
  }
}

export const financialService = new FinancialService();
