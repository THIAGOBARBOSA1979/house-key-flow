import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/Shared/StatsCard";
import { ResponsiveGrid } from "@/components/Shared/ResponsiveGrid";
import { DataTable } from "@/components/Shared/DataTable";
import { StatusBadge } from "@/components/Shared/StatusBadge";
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Download, 
  Filter, 
  Calendar as CalendarIcon,
  PieChart,
  Wallet,
  LineChart as LineChartIcon,
  RotateCw
} from "lucide-react";
import { financialService } from "@/services";
import { exportService } from "@/services";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks";

const FinancialDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const metrics = useMemo(() => financialService.getGlobalMetrics(user?.company_id, user?.is_super_admin), [user]);
  const transactions = useMemo(() => financialService.getRecentTransactions(user?.company_id, user?.is_super_admin), [user]);
  
  // Projection data (mock for demonstration)
  const projectionData = useMemo(() => {
    const historical = metrics.revenueByMonth.map(m => ({ ...m, isProjection: false }));
    const lastHistorical = historical[historical.length - 1];
    
    return [
      ...historical,
      { month: 'Jul', value: (lastHistorical?.value || 600000) * 1.1, isProjection: true },
      { month: 'Ago', value: (lastHistorical?.value || 600000) * 1.2, isProjection: true },
      { month: 'Set', value: (lastHistorical?.value || 600000) * 1.3, isProjection: true },
    ];
  }, [metrics]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      exportService.exportToCSV(transactions, "relatorio_financeiro_transacoes");
      toast({
        title: "Exportação concluída",
        description: "O arquivo CSV com as transações recentes foi gerado.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <PageHeader
        icon={DollarSign}
        title="Painel Financeiro"
        description="Visão global de recebíveis, fluxo de caixa e inadimplência."
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11 border-primary/20 hover:bg-primary/5 transition-all" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} 
            Exportar Dados
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
        <Card className="lg:col-span-2 rounded-[2rem] border-none bg-card/40 backdrop-blur-md shadow-sem-lg overflow-hidden group">
          <div className="h-2 w-full bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="p-8 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black tracking-tight">Evolução de Recebimentos</CardTitle>
                <p className="text-sm text-muted-foreground font-medium">Faturamento mensal consolidado (R$)</p>
              </div>
              <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-2xl border border-border/5">
                <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-background shadow-sm hover:bg-background/80">6 Meses</Button>
                <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">1 Ano</Button>
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
                      borderRadius: '24px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(8px)'
                    }} 
                    formatter={(value: number) => [formatCurrency(value), "Faturamento"]}
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

      <div className="grid grid-cols-1 gap-8">
        <Card className="rounded-[2rem] border-none bg-card/40 backdrop-blur-md shadow-sem-lg overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                  <LineChartIcon className="text-primary" />
                  Projeção de Receita
                </CardTitle>
                <p className="text-sm text-muted-foreground font-medium">Previsão baseada em parcelas a vencer e tendências históricas</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectionData}>
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
                    formatter={(value: number) => [formatCurrency(value), "Receita"]}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Line 
                    name="Realizado"
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    dot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    name="Projeção"
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={4}
                    strokeDasharray="8 8"
                    dot={{ r: 6, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                    data={projectionData.filter(d => d.isProjection || d.month === 'Jun')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-h2 flex items-center gap-2">
            <CalendarIcon size={24} className="text-primary" />
            Transações Recentes
          </h3>
          <Button variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-[0.2em]">Ver Histórico Completo</Button>
        </div>
        
        <DataTable
          columns={[
            { 
              header: "Cliente", 
              accessorKey: "client",
              cell: (item) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                    {item?.client?.charAt(0) || '?'}
                  </div>
                  <span className="font-bold">{item?.client || 'N/A'}</span>

                </div>
              )
            },
            { header: "Empreendimento", accessorKey: "property", className: "text-muted-foreground font-medium" },
            { 
              header: "Valor", 
              accessorKey: "value",
              cell: (item) => <span className="font-black text-foreground">{formatCurrency(item.value)}</span>
            },
            { 
              header: "Data", 
              accessorKey: "date",
              cell: (item) => <span className="text-muted-foreground font-bold">{new Date(item.date).toLocaleDateString('pt-BR')}</span>
            },
            { 
              header: "Tipo", 
              accessorKey: "type",
              cell: (item) => <span className="text-[10px] font-black uppercase tracking-widest bg-muted/50 px-2 py-1 rounded-lg">{item.type}</span>
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
          data={transactions}
        />
      </section>
    </div>
  );
};

export default FinancialDashboard;