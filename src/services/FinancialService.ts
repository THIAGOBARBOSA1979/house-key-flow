
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
      dueDate: new Date(2024, 0, 10),
      value: 2500,
      status: 'paid',
      type: 'monthly'
    },
    {
      id: 'inst-2',
      number: 2,
      dueDate: new Date(2024, 1, 10),
      value: 2500,
      status: 'paid',
      type: 'monthly'
    },
    {
      id: 'inst-3',
      number: 3,
      dueDate: new Date(2024, 2, 10),
      value: 2500,
      status: 'paid',
      type: 'monthly'
    },
    {
      id: 'inst-4',
      number: 4,
      dueDate: new Date(2024, 3, 10),
      value: 2500,
      status: 'paid',
      type: 'monthly'
    },
    {
      id: 'inst-5',
      number: 5,
      dueDate: new Date(2024, 4, 10),
      value: 2500,
      status: 'pending',
      type: 'monthly'
    },
    {
      id: 'inst-6',
      number: 6,
      dueDate: new Date(2024, 5, 10),
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

  getInstallmentsByClient(clientId: string): Installment[] {
    // In a real app, we'd filter by clientId
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
}

export const financialService = new FinancialService();
