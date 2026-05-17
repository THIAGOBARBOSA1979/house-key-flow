
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

class FinancialService {
  private installments: Installment[] = [
    // ... keep existing code
    {
      id: 'inst-7',
      number: 1,
      dueDate: new Date(2024, 11, 15),
      value: 15000,
      status: 'pending',
      type: 'annual'
    },
    {
      id: 'inst-8',
      number: 1,
      dueDate: new Date(2025, 3, 30),
      value: 50000,
      status: 'pending',
      type: 'delivery'
    }
  ];

  getInstallmentsByClient(clientId: string): Installment[] {
    return this.installments;
  }

  getFinancialSummary(clientId: string): FinancialSummary {
    const installments = this.getInstallmentsByClient(clientId);
    const totalValue = installments.reduce((acc, curr) => acc + curr.value, 0);
    const paidValue = installments
      .filter(i => i.status === 'paid')
      .reduce((acc, curr) => acc + curr.value, 0);
    const balanceDue = totalValue - paidValue;
    
    const nextPayment = installments
      .filter(i => i.status === 'pending')
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0] || null;

    return {
      totalValue,
      paidValue,
      balanceDue,
      nextPayment,
      progress: (paidValue / totalValue) * 100
    };
  }

  getGlobalMetrics() {
    const installments = this.installments;
    return {
      totalReceivable: 12500000,
      totalPaid: 8450000,
      totalOverdue: 125000,
      collectionEfficiency: 98.5,
      billingGroups: [
        { id: "bg1", name: "Edifício Aurora - Mensalidades", propertyId: "1", total: 450000, count: 120 },
        { id: "bg2", name: "Residencial Bosque - Intermediárias", propertyId: "2", total: 150000, count: 15 }
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
      { id: 'tx-2', client: 'Maria Oliveira', property: 'Solar das Palmeiras', value: 15000, date: new Date(Date.now() - 86400000), type: 'Intermediária', status: 'paid' },
      { id: 'tx-3', client: 'Pedro Santos', property: 'Residencial Aurora', value: 2500, date: new Date(Date.now() - 172800000), type: 'Mensalidade', status: 'overdue' },
      { id: 'tx-4', client: 'Ana Costa', property: 'Residencial Aurora', value: 2500, date: new Date(Date.now() - 259200000), type: 'Mensalidade', status: 'paid' },
      { id: 'tx-5', client: 'Carlos Souza', property: 'Solar das Palmeiras', value: 50000, date: new Date(Date.now() - 345600000), type: 'Entrega das Chaves', status: 'paid' },
    ];
  }

  processPayment(transactionId: string) {
    // In a real app, this would update the database
    auditLogService.log({
      entityType: 'financial',
      entityId: transactionId,
      action: 'payment_received',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Pagamento da transação ${transactionId} processado com sucesso.`
    });
    return true;
  }
}

export const financialService = new FinancialService();
