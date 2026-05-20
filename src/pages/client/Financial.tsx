import { Button } from "@/components/ui/button";
import { FileText, Download, DollarSign } from "lucide-react";
import { financialService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";
import { useToast } from "@/hooks";

import { FinancialOverview } from "@/components/Client/Financial/FinancialOverview";
import { PaymentHistory } from "@/components/Client/Financial/PaymentHistory";
import { NextPaymentCard } from "@/components/Client/Financial/NextPaymentCard";
import { InstallmentsTable } from "@/components/Client/Financial/InstallmentsTable";
import { QuickDocuments } from "@/components/Client/Financial/QuickDocuments";
import { AntecipationSimulator } from "@/components/Client/Financial/AntecipationSimulator";

const Financial = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const clientId = user?.id || "client-1";

  const [installments, setInstallments] = useState<Installment[]>([]);
  
  const loadData = useCallback(() => {
    setInstallments(financialService.getInstallmentsByClient(clientId));
  }, [clientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = useMemo(() => financialService.getFinancialSummary(clientId), [clientId, installments]);

  const historyData = useMemo(() => {
    return installments
      .filter(i => i.status === 'paid')
      .slice(-6)
      .map(i => ({
        month: i.dueDate.toLocaleDateString('pt-BR', { month: 'short' }),
        value: i.value
      }));
  }, [installments]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-layout-gap pb-20 md:pb-6 animate-in fade-in duration-slow">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl">
              <DollarSign className="h-6 w-6 text-primary" strokeWidth={3} />
            </div>
            Gestão Financeira
          </h1>
          <p className="text-muted-foreground font-medium">
            Centralize seus pagamentos, simule antecipações e baixe documentos fiscais.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" className="h-11 px-5 rounded-xl font-bold border-primary/20 hover:bg-primary/5 transition-all" onClick={() => {
            toast({ title: "Preparando documento...", description: "Sua declaração de IR estará pronta em instantes." });
          }}>
            <FileText className="h-4 w-4 mr-2 text-primary" />
            Declaração IR
          </Button>
          <Button className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20">
            <Download className="h-4 w-4 mr-2" />
            Baixar Extrato Completo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-layout-gap">
        <div className="lg:col-span-2 space-y-layout-gap">
          <FinancialOverview 
            balanceDue={summary.balanceDue}
            progress={summary.progress}
            paidValue={summary.paidValue}
            formatCurrency={formatCurrency}
          />
          <PaymentHistory data={historyData} formatCurrency={formatCurrency} />
        </div>

        <div className="space-y-layout-gap">
          <NextPaymentCard 
            nextPayment={summary.nextPayment} 
            formatCurrency={formatCurrency} 
            onPay={() => toast({ title: "Gerando boleto...", description: "O boleto será baixado automaticamente." })} 
          />
          <QuickDocuments />
        </div>
      </div>

      <InstallmentsTable installments={installments} formatCurrency={formatCurrency} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-layout-gap">
        <AntecipationSimulator formatCurrency={formatCurrency} />
      </div>
    </div>
  );
};

export default Financial;
