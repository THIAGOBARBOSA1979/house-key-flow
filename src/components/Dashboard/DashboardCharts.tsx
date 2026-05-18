
import { useMemo } from 'react';
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
  Pie,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { inspectionService } from '@/services/InspectionService';
import { warrantyFlowService } from '@/services/WarrantyFlowService';
import { financialService } from '@/services/FinancialService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const DashboardCharts = ({ 
  inspections = [], 
  warranties = [], 
  financialData = financialService.getGlobalMetrics() 
}: {
  inspections?: Array<{ date: Date | string }>;
  warranties?: Array<{ category: string }>;
  financialData?: { revenueByMonth: Array<{ month: string; value: number }> };
}) => {

  const inspectionChartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const data = months.map(m => ({ name: m, vistorias: 0 }));
    
    inspections.forEach(insp => {
      const monthIdx = new Date(insp.date).getMonth();
      if (monthIdx < 6) {
        data[monthIdx].vistorias += 1;
      }
    });

    if (data.every(d => d.vistorias === 0)) {
      return [
        { name: 'Jan', vistorias: 4 },
        { name: 'Fev', vistorias: 3 },
        { name: 'Mar', vistorias: 8 },
        { name: 'Abr', vistorias: 12 },
        { name: 'Mai', vistorias: 18 },
        { name: 'Jun', vistorias: 23 },
      ];
    }
    return data;
  }, [inspections]);

  const warrantyChartData = useMemo(() => {
    const categories: Record<string, number> = {};
    warranties.forEach(w => {
      categories[w.category] = (categories[w.category] || 0) + 1;
    });

    const data = Object.entries(categories).map(([name, value]) => ({ name, value }));
    
    if (data.length === 0) {
      return [
        { name: 'Elétrica', value: 4 },
        { name: 'Hidráulica', value: 3 },
        { name: 'Pintura', value: 3 },
        { name: 'Estrutural', value: 2 },
      ];
    }
    return data;
  }, [warranties]);

  const revenueData = useMemo(() => {
    return financialData.revenueByMonth.map(item => ({
      name: item.month,
      valor: item.value
    }));
  }, [financialData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="card-standard border-none bg-card/50 backdrop-blur-sm overflow-hidden md:col-span-1">
        <CardHeader className="pb-4 border-b border-border/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg md:text-h4 font-black">Conformidade SLA</CardTitle>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black text-[10px]">
              {warrantyFlowService.calculateMetrics().slaComplianceRate}% META
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-8 flex flex-col items-center justify-center h-72">
          <div className="relative w-48 h-48">
             <svg className="w-full h-full transform -rotate-90">
               <circle
                 cx="96"
                 cy="96"
                 r="80"
                 stroke="currentColor"
                 strokeWidth="16"
                 fill="transparent"
                 className="text-muted/20"
               />
               <circle
                 cx="96"
                 cy="96"
                 r="80"
                 stroke="currentColor"
                 strokeWidth="16"
                 fill="transparent"
                 strokeDasharray={2 * Math.PI * 80}
                 strokeDashoffset={2 * Math.PI * 80 * (1 - warrantyFlowService.calculateMetrics().slaComplianceRate / 100)}
                 className="text-primary transition-all duration-1000 ease-out"
                 strokeLinecap="round"
               />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-4xl font-black tracking-tighter text-foreground font-sans">{warrantyFlowService.calculateMetrics().slaComplianceRate}%</span>
               <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Global</span>
             </div>
          </div>
          <p className="text-xs font-bold text-muted-foreground mt-4 italic text-center">
            {warrantyFlowService.calculateMetrics().onTrackCount} chamados dentro do prazo acordado.
          </p>
        </CardContent>
      </Card>

      <Card className="card-standard border-none bg-card/50 backdrop-blur-sm overflow-hidden md:col-span-1">
        <CardHeader className="pb-4 border-b border-border/10">
          <CardTitle className="text-lg md:text-h4 font-black">Distribuição por Etapa</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical"
                data={Object.entries(warrantyFlowService.calculateMetrics().stageDistribution)
                  .filter(([_, value]) => value > 0)
                  .map(([key, value]) => ({ 
                    name: key === 'in_analysis' ? 'Análise' : key === 'inspection_scheduled' ? 'Vistoria' : key === 'in_execution' ? 'Execução' : key, 
                    total: value 
                  }))}
                margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--muted))" opacity={0.2} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 700, fontFamily: 'var(--font-sans)' }}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontFamily: 'var(--font-sans)' }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="card-standard border-none bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/10">
          <CardTitle className="text-lg md:text-h4 font-black">Vistorias por Mês</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inspectionChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--muted))" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                   tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 600, fontFamily: 'var(--font-sans)' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 600, fontFamily: 'var(--font-sans)' }}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid hsl(var(--border))',
                    boxShadow: 'var(--shadow-md)',
                     fontSize: '12px',
                    fontWeight: 'bold',
                    fontFamily: 'var(--font-sans)'
                  }}
                />
                <Bar 
                  dataKey="vistorias" 
                  fill="hsl(var(--primary))" 
                  radius={[6, 6, 0, 0]} 
                  barSize={24}
                  className="transition-all duration-300 hover:opacity-hover"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="card-standard border-none bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/10">
          <CardTitle className="text-lg md:text-h4 font-black">Chamados por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={warrantyChartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {warrantyChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="hover:opacity-hover transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid hsl(var(--border))',
                    boxShadow: 'var(--shadow-md)',
                     fontSize: '12px',
                    fontFamily: 'var(--font-sans)'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-tiny font-bold text-muted-foreground uppercase tracking-wider ml-1 font-sans">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
