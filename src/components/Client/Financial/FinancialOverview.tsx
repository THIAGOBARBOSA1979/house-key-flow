import { StatsCard } from "@/components/Shared/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface FinancialOverviewProps {
  balanceDue: number;
  progress: number;
  paidValue: number;
  formatCurrency: (val: number) => string;
}

export const FinancialOverview = ({ balanceDue, progress, paidValue, formatCurrency }: FinancialOverviewProps) => {
  const chartData = [
    { name: 'Pago', value: paidValue, color: '#0ea5e9' },
    { name: 'Pendente', value: balanceDue, color: '#e2e8f0' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-layout-gap">
      <StatsCard 
        label="Saldo Devedor" 
        value={formatCurrency(balanceDue)} 
        icon={DollarSign} 
        description={`${Math.round(progress)}% quitado`}
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
              {/* @ts-ignore */}
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
            <span className="text-[10px] font-black text-muted-foreground uppercase">Pago</span>
            <span className="text-sm font-black text-primary">{Math.round(progress)}%</span>
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
  );
};
