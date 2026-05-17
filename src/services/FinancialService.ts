
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
    {
      id: 'inst-1',
      number: 1,
      dueDate: new Date(2024, 4, 15),
      value: 2500,
      status: 'paid',
      type: 'monthly'
    },
    {
      id: 'inst-2',
      number: 2,
      dueDate: new Date(2024, 5, 15),
      value: 2500,
      status: 'paid',
      type: 'monthly'
    },
    {
      id: 'inst-3',
      number: 3,
      dueDate: new Date(2024, 6, 15),
      value: 2500,
      status: 'pending',
      type: 'monthly'
    },
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

  private storageKey = "a2_financial_data";

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.installments = parsed.map((i: any) => ({
          ...i,
          dueDate: new Date(i.dueDate)
        }));
      } catch (e) {
        console.error("Erro ao carregar dados financeiros", e);
      }
    }
  }

  private saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.installments));
  }

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
      progress: totalValue > 0 ? (paidValue / totalValue) * 100 : 0
    };
  }

  getGlobalMetrics() {
    const totalPaid = this.installments
      .filter(i => i.status === 'paid')
      .reduce((acc, i) => acc + i.value, 0);
    
    const totalPending = this.installments
      .filter(i => i.status === 'pending')
      .reduce((acc, i) => acc + i.value, 0);

    const totalOverdue = this.installments
      .filter(i => i.status === 'overdue')
      .reduce((acc, i) => acc + i.value, 0);

    return {
      totalReceivable: totalPaid + totalPending + totalOverdue,
      totalPaid: 8450000 + totalPaid, // Simulation base + data
      totalOverdue: 125000 + totalOverdue,
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
    const installment = this.installments.find(i => i.id === transactionId);
    if (installment) {
      installment.status = 'paid';
      this.saveToStorage();
    }
    
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

export const financialService = new FinancialService();
