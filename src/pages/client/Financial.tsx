
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  Download,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { financialService, Installment } from "@/services/FinancialService";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

const Financial = () => {
  const { user } = useAuth();
  const clientId = user?.id || "client-1";

  const summary = useMemo(() => financialService.getFinancialSummary(clientId), [clientId]);
  const installments = useMemo(() => financialService.getInstallmentsByClient(clientId), [clientId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusInfo = (status: Installment['status']) => {
    switch (status) {
      case 'paid':
        return { label: 'Pago', status: 'complete' as const };
      case 'overdue':
        return { label: 'Atrasado', status: 'critical' as const };
      default:
        return { label: 'Pendente', status: 'pending' as const };
    }
  };

  const getTypeLabel = (type: Installment['type']) => {
    switch (type) {
      case 'monthly': return 'Mensal';
      case 'annual': return 'Anual';
      case 'delivery': return 'Chaves';
      default: return 'Extra';
    }
  };

  return (
    <div className="space-y-layout-gap pb-20 md:pb-6 animate-in fade-in duration-slow">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary" />
            Financeiro
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe seus pagamentos, parcelas e extratos financeiros.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 rounded-xl">
            <FileText className="h-4 w-4" />
            Declaração IR
          </Button>
          <Button className="gap-2 rounded-xl">
            <Download className="h-4 w-4" />
            Baixar Extrato
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-layout-gap">
        <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-widest">Saldo Devedor</CardDescription>
            <CardTitle className="text-3xl font-black text-primary">{formatCurrency(summary.balanceDue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Progresso da Quitação</span>
                <span className="font-bold">{Math.round(summary.progress)}%</span>
              </div>
              <Progress value={summary.progress} className="h-2" />
              <div className="text-[10px] text-muted-foreground">
                Valor Total: {formatCurrency(summary.totalValue)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-widest">Próximo Vencimento</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {summary.nextPayment ? formatCurrency(summary.nextPayment.value) : 'Nenhum'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.nextPayment ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">{summary.nextPayment.dueDate.toLocaleDateString('pt-BR')}</span>
                </div>
                <Button className="w-full rounded-xl gap-2 font-bold" variant="secondary">
                  <CreditCard className="h-4 w-4" />
                  Pagar Agora
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-status-complete">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Todas as parcelas em dia</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground shadow-lg overflow-hidden relative">
          <div className="absolute right-[-10%] top-[-10%] opacity-10">
            <TrendingUp size={120} />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-bold">Resumo de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl">
              <span className="text-xs">Total Pago</span>
              <span className="font-black">{formatCurrency(summary.paidValue)}</span>
            </div>
            <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl">
              <span className="text-xs">Parcelas Pagas</span>
              <span className="font-black">{installments.filter(i => i.status === 'paid').length} / {installments.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Installments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Parcelas</CardTitle>
          <CardDescription>Lista detalhada de todas as parcelas do seu contrato</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-[10px] font-black uppercase text-muted-foreground tracking-widest text-left">
                  <th className="pb-4 px-2">Parcela</th>
                  <th className="pb-4 px-2">Tipo</th>
                  <th className="pb-4 px-2">Vencimento</th>
                  <th className="pb-4 px-2">Valor</th>
                  <th className="pb-4 px-2">Status</th>
                  <th className="pb-4 px-2 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {installments.map((item) => {
                  const statusInfo = getStatusInfo(item.status);
                  return (
                    <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-2">
                        <span className="text-sm font-bold">#{String(item.number).padStart(3, '0')}</span>
                      </td>
                      <td className="py-4 px-2">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter">
                          {getTypeLabel(item.type)}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-sm">
                        {item.dueDate.toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 px-2 font-bold text-sm">
                        {formatCurrency(item.value)}
                      </td>
                      <td className="py-4 px-2">
                        <StatusBadge 
                          status={statusInfo.status} 
                          label={statusInfo.label} 
                          size="sm" 
                        />
                      </td>
                      <td className="py-4 px-2 text-right">
                        {item.status !== 'paid' ? (
                          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs font-bold text-primary hover:text-primary hover:bg-primary/5">
                            Boleto <Download className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs font-medium text-muted-foreground">
                            Recibo <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-layout-gap">
        <Card className="border-dashed">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="p-2 bg-primary/10 rounded-xl">
              <AlertCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Informações sobre reajustes</CardTitle>
              <CardDescription className="text-xs">Como as parcelas são atualizadas</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            As parcelas do seu contrato são reajustadas mensalmente pelo INCC (Índice Nacional de Custo da Construção) até a data da entrega das chaves. Após a entrega, o índice de correção passa a ser o IPCA + 1% ao mês, conforme cláusula contratual.
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="p-2 bg-secondary rounded-xl">
              <TrendingUp className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Quitação Antecipada</CardTitle>
              <CardDescription className="text-xs">Economize com descontos</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            Você sabia que pode obter descontos financeiros ao antecipar o pagamento de parcelas futuras? Entre em contato com nossa equipe financeira para realizar uma simulação e aproveitar os benefícios.
          </CardContent>
          <div className="px-6 pb-4">
            <Button variant="link" className="p-0 h-auto text-xs font-bold text-primary flex items-center gap-1">
              Simular Antecipação <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Financial;
