
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/Shared/StatusBadge";
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
import { financialService, Installment } from "@/services";
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
import { StatsCard } from "@/components/Shared/StatsCard";
import { ResponsiveGrid } from "@/components/Shared/ResponsiveGrid";
import { useToast } from "@/hooks";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const Financial = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const clientId = user?.id || "client-1";
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [simulationAmount, setSimulationAmount] = useState<number>(0);

  const summary = useMemo(() => financialService.getFinancialSummary(clientId), [clientId]);
  const installments = useMemo(() => financialService.getInstallmentsByClient(clientId), [clientId]);

  const chartData = useMemo(() => {
    return [
      { name: 'Pago', value: summary.paidValue, color: '#0ea5e9' },
      { name: 'Pendente', value: summary.balanceDue, color: '#e2e8f0' },
    ];
  }, [summary]);

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

  const handleSimulate = () => {
    if (simulationAmount <= 0) {
      toast({ title: "Erro", description: "Informe um valor válido para simulação.", variant: "destructive" });
      return;
    }
    
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


      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-layout-gap">
        <div className="lg:col-span-2 space-y-layout-gap">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-layout-gap">
            <StatsCard 
              label="Saldo Devedor" 
              value={formatCurrency(summary.balanceDue)} 
              icon={DollarSign} 
              description={`${Math.round(summary.progress)}% quitado`}
              variant="brand"
              className="rounded-3xl shadow-lg border-none"
            />
            
            <Card className="shadow-lg relative overflow-hidden border-none bg-white rounded-3xl">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Distribuição do Contrato</CardDescription>
                <CardTitle className="text-xl font-bold">Resumo Visual</CardTitle>
              </CardHeader>
              <CardContent className="h-40 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
                  <span className="text-[10px] font-black text-muted-foreground uppercase">Pago</span>
                  <span className="text-sm font-black text-primary">{Math.round(summary.progress)}%</span>
                </div>
                <div className="flex justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>Pago</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                    <span>Pendente</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg border-none bg-white overflow-hidden rounded-3xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Histórico de Pagamentos</CardDescription>
              <CardTitle className="text-xl font-bold">Últimos 6 meses</CardTitle>
            </CardHeader>
            <CardContent className="h-48 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-layout-gap">
          <Card className="shadow-xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-3xl">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/70">Próximo Vencimento</CardDescription>
              <CardTitle className="text-2xl font-bold">
                {summary.nextPayment ? formatCurrency(summary.nextPayment.value) : 'Nenhum'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.nextPayment ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm bg-white/10 p-3 rounded-xl border border-white/20">
                    <Calendar className="h-4 w-4" />
                    <span className="font-bold">{summary.nextPayment.dueDate.toLocaleDateString('pt-BR')}</span>
                  </div>
                  <Button 
                    className="w-full rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px] h-14 bg-white text-primary hover:bg-white/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
                    onClick={() => {
                      toast({
                        title: "Gerando boleto...",
                        description: "O boleto será baixado automaticamente.",
                      });
                    }}
                  >
                    <CreditCard className="h-4 w-4" />
                    Pagar Agora (Boleto/PIX)
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                  <div className="p-3 bg-white/20 rounded-full">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-bold">Contrato em dia!</span>
                  <p className="text-[10px] text-white/70 uppercase tracking-widest font-black">Nenhuma pendência encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-dashed shadow-none bg-muted/20 rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Documentos Rápidos
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              <Button variant="outline" size="sm" className="justify-between text-xs font-bold rounded-2xl h-12 border-muted-foreground/20 hover:border-primary hover:text-primary transition-all">
                Extrato Consolidado <Download className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" className="justify-between text-xs font-bold rounded-2xl h-12 border-muted-foreground/20 hover:border-primary hover:text-primary transition-all">
                Informe de Rendimentos <ExternalLink className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-sem-lg border-none rounded-[2rem] overflow-hidden bg-card/40 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 p-8 border-b border-border/10">
          <div>
            <CardTitle className="text-xl font-black tracking-tight text-foreground/90">Cronograma de Parcelas</CardTitle>
            <CardDescription className="font-medium">Histórico completo e previsões futuras do seu contrato</CardDescription>
          </div>
          <Badge className="font-black px-4 py-1.5 rounded-xl bg-primary/10 text-primary border-none uppercase text-[10px] tracking-widest">
            {installments.length} Registros
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30 text-[10px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">
                  <th className="py-5 px-8 text-left">Ref</th>
                  <th className="py-5 px-8 text-left">Categoria</th>
                  <th className="py-5 px-8 text-left">Vencimento</th>
                  <th className="py-5 px-8 text-left">Valor Atualizado</th>
                  <th className="py-5 px-8 text-center">Status</th>
                  <th className="py-5 px-8 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {installments.length > 0 ? installments.map((item) => {
                  const statusInfo = getStatusInfo(item.status);
                  return (
                    <tr key={item.id} className="group hover:bg-primary/[0.02] transition-colors">
                      <td className="py-5 px-8">
                        <span className="text-sm font-black text-foreground/80">#{String(item.number).padStart(3, '0')}</span>
                      </td>
                      <td className="py-5 px-8">
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest rounded-lg border-border/40 text-muted-foreground/80 bg-background/50">
                          {getTypeLabel(item.type)}
                        </Badge>
                      </td>
                      <td className="py-5 px-8 text-sm font-bold text-muted-foreground">
                        {item.dueDate.toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-5 px-8 font-black text-sm text-foreground/90">
                        {formatCurrency(item.value)}
                      </td>
                      <td className="py-5 px-8 text-center">
                        <StatusBadge 
                          status={statusInfo.status} 
                          label={statusInfo.label} 
                          size="sm" 
                        />
                      </td>
                      <td className="py-5 px-8 text-right">
                        {item.status !== 'paid' ? (
                          <Button variant="ghost" size="sm" className="h-10 px-4 gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-xl transition-all active:scale-95">
                            <Download className="h-4 w-4" /> Boleto
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-10 px-4 gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all active:scale-95">
                            <CheckCircle2 className="h-4 w-4" /> Recibo
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center">
                           <FileText className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <p className="text-muted-foreground font-bold italic">Nenhum registro financeiro disponível.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-layout-gap">
        <Dialog>
          <DialogTrigger asChild>
            <Card className="border-dashed cursor-pointer hover:bg-primary/5 transition-colors group">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                  <AlertCircle className="h-5 w-5 text-primary group-hover:text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">Informações sobre reajustes</CardTitle>
                  <CardDescription className="text-xs">Como as parcelas são atualizadas</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed">
                As parcelas do seu contrato são reajustadas mensalmente pelo INCC até a entrega e IPCA + 1% após. <span className="text-primary font-bold">Clique para entender mais.</span>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight">Entenda a correção do seu contrato</DialogTitle>
              <DialogDescription className="font-medium">Índices utilizados no mercado imobiliário</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  INCC (Até a Entrega das Chaves)
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  O Índice Nacional de Custo da Construção mede a variação dos custos de construção habitacional. Ele reflete o aumento de materiais, mão de obra e equipamentos. É aplicado sobre o saldo devedor até que o imóvel receba o Habite-se.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  IPCA + 1% (Pós-Entrega)
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Após a entrega do imóvel, o reajuste passa a ser baseado no Índice Nacional de Preços ao Consumidor Amplo (IPCA), que mede a inflação oficial do país, acrescido de uma taxa de juros compensatórios de 1% ao mês.
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-2xl border text-xs text-muted-foreground italic">
                Dica: Antecipar parcelas ajuda a reduzir o montante sobre o qual incidem os reajustes mensais, gerando economia a longo prazo.
              </div>
            </div>
            <Button className="w-full h-12 font-black uppercase tracking-widest text-[11px]" onClick={() => {
              toast({ title: "Documento enviado", description: "Enviamos um PDF detalhado sobre os índices para seu e-mail." });
            }}>
              Baixar Guia de Reajustes (PDF)
            </Button>
          </DialogContent>
        </Dialog>

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
