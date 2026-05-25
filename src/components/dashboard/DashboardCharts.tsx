import { useMemo, memo, useState, useEffect } from 'react';
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
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { inspectionService, warrantyFlowService } from '@/services';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const DashboardCharts = memo(({ 
  inspections = [], 
  warranties = []
}: {
  inspections?: Array<{ date: Date | string }>;
  warranties?: Array<{ category: string }>;
}) => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      const data = await warrantyFlowService.calculateMetrics();
      setMetrics(data);
    };
    loadMetrics();
  }, []);

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


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-layout-gap-lg">
      <Card className="card-standard border border-border/10 bg-card/40 backdrop-blur-xl overflow-hidden lg:col-span-1 rounded-[2.5rem] shadow-sem-md hover:shadow-sem-lg transition-shadow duration-500">
        <CardHeader className="pb-layout-gap-sm border-b border-border/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg md:text-h4 font-black tracking-tight">Conformidade de SLAs</CardTitle>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black text-[10px] tracking-widest px-2.5 py-1">
              {metrics?.slaComplianceRate || 0}% META GLOBAL
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-layout-gap flex flex-col items-center justify-center h-80">
          <div className="relative w-56 h-56 group">
             <svg className="w-full h-full transform -rotate-90">
               <circle
                 cx="112"
                 cy="112"
                 r="96"
                 stroke="currentColor"
                 strokeWidth="14"
                 fill="transparent"
                 className="text-muted/10"
               />
               <circle
                 cx="112"
                 cy="112"
                 r="96"
                 stroke="currentColor"
                 strokeWidth="14"
                 fill="transparent"
                 strokeDasharray={2 * Math.PI * 96}
                 strokeDashoffset={2 * Math.PI * 96 * (1 - (metrics?.slaComplianceRate || 0) / 100)}
                 className="text-primary transition-all duration-[1500ms] ease-out"
                 strokeLinecap="round"
               />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-5xl font-black tracking-tighter text-foreground group-hover:scale-110 transition-transform duration-500">{metrics?.slaComplianceRate || 0}%</span>
               <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Sincronização</span>
             </div>
          </div>
          <p className="text-[11px] font-bold text-muted-foreground/80 mt-6 text-center max-w-[240px] leading-relaxed">
            <span className="text-primary">{metrics?.onTrackCount || 0} protocolos técnicos</span> operando em conformidade com o cronograma estratégico.
          </p>
        </CardContent>
      </Card>

      <Card className="card-standard border border-border/10 bg-card/40 backdrop-blur-xl overflow-hidden lg:col-span-1 rounded-[2.5rem] shadow-sem-md hover:shadow-sem-lg transition-shadow duration-500">
        <CardHeader className="pb-layout-gap-sm border-b border-border/5">
          <CardTitle className="text-lg md:text-h4 font-black tracking-tight">Fluxo por Ciclo Técnico</CardTitle>
        </CardHeader>
        <CardContent className="pt-layout-gap px-4">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical"
                data={Object.entries(metrics?.stageDistribution || {})
                  .filter(([_, value]) => (value as number) > 0)
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

      <Card className="card-standard border border-border/20 bg-card/30 backdrop-blur-md overflow-hidden rounded-[2rem] shadow-sem-sm">

        <CardHeader className="pb-layout-gap-sm border-b border-border/10">
          <CardTitle className="text-lg md:text-h4 font-black">Entregas Técnicas Homologadas</CardTitle>
        </CardHeader>
        <CardContent className="pt-layout-gap">
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

      <Card className="card-standard border border-border/20 bg-card/30 backdrop-blur-md overflow-hidden rounded-[2rem] shadow-sem-sm">
        <CardHeader className="pb-layout-gap-sm border-b border-border/10">
          <CardTitle className="text-lg md:text-h4 font-black">Incidências por Matriz Técnica</CardTitle>
        </CardHeader>
        <CardContent className="pt-layout-gap">
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
});
