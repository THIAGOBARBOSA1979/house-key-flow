
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { financialService, Installment } from "@/services/FinancialService";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StatsCard } from "@/components/shared/StatsCard";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { useToast } from "@/hooks/use-toast";

const Financial = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const clientId = user?.id || "client-1";
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [simulationAmount, setSimulationAmount] = useState<number>(0);

  const summary = useMemo(() => financialService.getFinancialSummary(clientId), [clientId]);
  const installments = useMemo(() => financialService.getInstallmentsByClient(clientId), [clientId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleSimulate = () => {
    if (simulationAmount <= 0) {
      toast({ title: "Erro", description: "Informe um valor válido para simulação.", variant: "destructive" });
      return;
    }
    
    // Logic for discount calculation
    // Over 50k: 10%, Over 10k: 7%, Else: 5%
    const discountRate = simulationAmount >= 50000 ? 0.10 : simulationAmount >= 10000 ? 0.07 : 0.05;
    const discount = simulationAmount * discountRate;
    const finalValue = simulationAmount - discount;

    toast({
      title: "Simulação de Antecipação",
      description: (
        <div className="space-y-1">
          <p>Valor simulado: <span className="font-bold">{formatCurrency(simulationAmount)}</span></p>
          <p>Desconto ({discountRate * 100}%): <span className="font-bold text-green-600">-{formatCurrency(discount)}</span></p>
          <p className="border-t pt-1 mt-1">Valor final: <span className="font-bold">{formatCurrency(finalValue)}</span></p>
        </div>
      ) as any,
    });
    setIsSimulationOpen(false);
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
          <Button variant="outline" className="gap-2 rounded-xl" onClick={() => {
            toast({ title: "Gerando documento...", description: "Estamos preparando sua declaração de IR." });
            setTimeout(() => toast({ title: "Sucesso!", description: "Declaração de IR baixada com sucesso." }), 2000);
          }}>
            <FileText className="h-4 w-4" />
            Declaração IR
          </Button>
          <Button className="gap-2 rounded-xl" onClick={() => {
            toast({ title: "Gerando extrato...", description: "Estamos preparando seu extrato financeiro." });
            setTimeout(() => toast({ title: "Sucesso!", description: "Extrato financeiro baixado com sucesso." }), 2000);
          }}>
            <Download className="h-4 w-4" />
            Baixar Extrato
          </Button>
        </div>
      </div>

      {/* Summary Cards with StatsCard Component */}
      <ResponsiveGrid columns={3} gap="layout">
        <StatsCard 
          label="Saldo Devedor" 
          value={formatCurrency(summary.balanceDue)} 
          icon={DollarSign} 
          description={`${Math.round(summary.progress)}% quitado`}
          variant="brand"
        />
        
        <Card className="shadow-md relative overflow-hidden border-none bg-muted/30">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingUp className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-widest">Resumo de Quitação</CardDescription>
            <CardTitle className="text-2xl font-black text-primary">
              {Math.round(summary.progress)}%
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-2 bg-white rounded-full overflow-hidden border">
              <div 
                className="h-full bg-primary transition-all duration-1000" 
                style={{ width: `${summary.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground tracking-tighter">
              <span>Pago: {formatCurrency(summary.paidValue)}</span>
              <span>Total: {formatCurrency(summary.totalValue)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/70">Próximo Vencimento</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {summary.nextPayment ? formatCurrency(summary.nextPayment.value) : 'Nenhum'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.nextPayment ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">{summary.nextPayment.dueDate.toLocaleDateString('pt-BR')}</span>
                </div>
                <Button 
                  className="w-full rounded-xl gap-2 font-black uppercase tracking-widest text-[10px] bg-white text-primary hover:bg-white/90" 
                  onClick={() => {
                    toast({
                      title: "Gerando boleto...",
                      description: "O boleto será baixado automaticamente.",
                    });
                  }}
                >
                  <CreditCard className="h-4 w-4" />
                  Baixar Boleto
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Contrato Quitado</span>
              </div>
            )}
          </CardContent>
        </Card>
      </ResponsiveGrid>

      {/* Installments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Parcelas</CardTitle>
          <CardDescription>Lista detalhada de todas as parcelas do seu contrato</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-left">
                  <th className="py-4 px-6 first:rounded-tl-xl">Parcela</th>
                  <th className="py-4 px-6">Tipo</th>
                  <th className="py-4 px-6">Vencimento</th>
                  <th className="py-4 px-6">Valor</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right last:rounded-tr-xl">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {installments.map((item) => {
                  const statusInfo = getStatusInfo(item.status);
                  return (
                    <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-sm font-bold">#{String(item.number).padStart(3, '0')}</span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter">
                          {getTypeLabel(item.type)}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {item.dueDate.toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 px-6 font-bold text-sm">
                        {formatCurrency(item.value)}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge 
                          status={statusInfo.status} 
                          label={statusInfo.label} 
                          size="sm" 
                        />
                      </td>
                      <td className="py-4 px-6 text-right">
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
            <Dialog open={isSimulationOpen} onOpenChange={setIsSimulationOpen}>
              <DialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto text-xs font-bold text-primary flex items-center gap-1">
                  Simular Antecipação <ChevronRight className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Simular Antecipação</DialogTitle>
                  <DialogDescription>
                    Informe o valor que deseja antecipar para calcular o desconto aproximado.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor da Antecipação</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      placeholder="Ex: 5000" 
                      value={simulationAmount || ''} 
                      onChange={(e) => setSimulationAmount(Number(e.target.value))}
                    />
                  </div>
                </div>
                <Button onClick={handleSimulate} className="w-full font-bold">Simular Desconto</Button>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Financial;
