import { useState, useMemo } from "react";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/shared/StatsCard";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Download, 
  Filter, 
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Wallet
} from "lucide-react";
import { financialService } from "@/services/FinancialService";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const FinancialDashboard = () => {
  const { toast } = useToast();
  const metrics = useMemo(() => financialService.getGlobalMetrics(), []);
  const transactions = useMemo(() => financialService.getRecentTransactions(), []);
  
  const handleExport = () => {
    toast({
      title: "Relatório gerado",
      description: "O relatório financeiro consolidado foi enviado para seu e-mail.",
    });
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <PageHeader
        icon={DollarSign}
        title="Painel Financeiro"
        description="Visão global de recebíveis, fluxo de caixa e inadimplência."
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11 border-primary/20 hover:bg-primary/5 transition-all" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Exportar Dados
          </Button>
          <Button className="rounded-xl h-11 shadow-lg shadow-primary/20 font-bold">
            <Filter className="mr-2 h-4 w-4" /> Filtros Avançados
          </Button>
        </div>
      </PageHeader>

      <ResponsiveGrid columns={4} gap="layout">
        <StatsCard 
          label="Total Recebível" 
          value={formatCurrency(metrics.totalReceivable)} 
          icon={Wallet}
          variant="brand"
          trend={{ value: "8.2%", isPositive: true }}
          className="rounded-3xl"
        />
        <StatsCard 
          label="Total Recebido" 
          value={formatCurrency(metrics.totalPaid)} 
          icon={TrendingUp}
          variant="complete"
          trend={{ value: "12.5%", isPositive: true }}
          className="rounded-3xl"
        />
        <StatsCard 
          label="Inadimplência" 
          value={formatCurrency(metrics.totalOverdue)} 
          icon={AlertCircle}
          variant="critical"
          trend={{ value: "1.2%", isPositive: false }}
          className="rounded-3xl"
        />
        <StatsCard 
          label="Eficiência" 
          value={`${metrics.collectionEfficiency}%`} 
          icon={PieChart}
          variant="progress"
          className="rounded-3xl"
        />
      </ResponsiveGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[2rem] border-none bg-card/40 backdrop-blur-md shadow-sem-lg overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black tracking-tight">Evolução de Recebimentos</CardTitle>
                <p className="text-sm text-muted-foreground font-medium">Faturamento mensal consolidado (R$)</p>
              </div>
              <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl">
                <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest bg-background shadow-sm">6 Meses</Button>
                <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground">1 Ano</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.revenueByMonth}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#888888' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#888888' }}
                    tickFormatter={(value) => `R$${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none bg-card/40 backdrop-blur-md shadow-sem-lg overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black tracking-tight">Metas e Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Meta de Vendas</span>
                <span className="text-sm font-black text-primary">85%</span>
              </div>
              <div className="h-3 w-full bg-muted/40 rounded-full overflow-hidden border border-border/5">
                <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Recebimento de Chaves</span>
                <span className="text-sm font-black text-emerald-600">92%</span>
              </div>
              <div className="h-3 w-full bg-muted/40 rounded-full overflow-hidden border border-border/5">
                <div className="h-full bg-emerald-500 w-[92%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
              </div>
            </div>

            <div className="pt-4 border-t border-border/10 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Insight Estratégico</h4>
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-sm font-medium text-foreground leading-relaxed italic">
                  "O faturamento deste mês superou a projeção inicial em 12%, impulsionado pela entrega das chaves do Residencial Aurora."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-h2 flex items-center gap-2">
              <AlertCircle size={24} className="text-red-500" />
              Gestão de Inadimplência
            </h3>
            <Button variant="outline" size="sm" className="h-8 rounded-xl text-[10px] font-black uppercase tracking-widest border-red-200 text-red-600 hover:bg-red-50">Notificar Todos</Button>
          </div>
          <Card className="rounded-[2rem] border-none bg-card/40 backdrop-blur-md shadow-sem-lg overflow-hidden">
            <DataTable
              columns={[
                { 
                  header: "Cliente", 
                  accessorKey: "client",
                  cell: (item) => (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-[10px] font-black text-red-600">
                        {item.client.charAt(0)}
                      </div>
                      <span className="font-bold">{item.client}</span>
                    </div>
                  )
                },
                { 
                  header: "Vencimento", 
                  accessorKey: "date",
                  cell: (item) => <span className="text-red-600 font-bold">{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                },
                { 
                  header: "Valor", 
                  accessorKey: "value",
                  cell: (item) => <span className="font-black">{formatCurrency(item.value)}</span>
                },
                {
                  header: "Ação",
                  accessorKey: "id",
                  className: "text-right",
                  cell: (item) => (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/5 rounded-lg" onClick={() => toast({ title: "Cobrança enviada", description: `Notificação enviada para ${item.client}` })}>
                      <DollarSign className="w-4 h-4" />
                    </Button>
                  )
                }
              ]}
              data={transactions.filter(t => t.status === 'overdue')}
            />
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-h2 flex items-center gap-2">
              <CalendarIcon size={24} className="text-primary" />
              Histórico de Transações
            </h3>
            <Button variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-[0.2em]">Ver Tudo</Button>
          </div>
          
          <Card className="rounded-[2rem] border-none bg-card/40 backdrop-blur-md shadow-sem-lg overflow-hidden">
            <DataTable
              columns={[
                { 
                  header: "Cliente", 
                  accessorKey: "client",
                  cell: (item) => <span className="font-bold">{item.client}</span>
                },
                { header: "Tipo", accessorKey: "type", className: "text-muted-foreground font-medium" },
                { 
                  header: "Valor", 
                  accessorKey: "value",
                  cell: (item) => <span className="font-black text-foreground">{formatCurrency(item.value)}</span>
                },
                { 
                  header: "Status", 
                  accessorKey: "status",
                  cell: (item) => {
                    const statusMap: Record<string, any> = {
                      paid: 'complete',
                      overdue: 'critical',
                      pending: 'pending'
                    };
                    const labelMap: Record<string, string> = {
                      paid: 'Pago',
                      overdue: 'Atrasado',
                      pending: 'Pendente'
                    };
                    return <StatusBadge status={statusMap[item.status] || 'neutral'} label={labelMap[item.status]} size="sm" />;
                  }
                }
              ]}
              data={transactions.filter(t => t.status !== 'overdue').slice(0, 5)}
            />
          </Card>
        </section>
      </div>
    </div>
  );
};

export default FinancialDashboard;