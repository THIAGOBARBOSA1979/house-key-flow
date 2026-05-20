
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as ReTooltip, 
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

interface InspectionAnalyticsProps {
  statusStats: { name: string; value: number }[];
  technicianStats: { name: string; value: number }[];
  conformityScore?: number;
  trend?: { month: string; score: number }[];
}

export const InspectionAnalytics = ({ statusStats, technicianStats, conformityScore = 100, trend = [] }: InspectionAnalyticsProps) => {
  const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* KPIs de Governança Técnica */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-emerald-500 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-20"><ShieldCheck size={48} /></div>
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-widest opacity-80">Score Conformidade</p>
            <h3 className="text-4xl font-black mt-1">{conformityScore}%</h3>
            <p className="text-[10px] mt-2 font-bold bg-white/20 inline-block px-2 py-0.5 rounded-full">META: {'>'}95%</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white dark:bg-card overflow-hidden relative border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Vistorias Realizadas</p>
            <h3 className="text-4xl font-black mt-1">{statusStats.reduce((acc, curr) => acc + curr.value, 0)}</h3>
            <div className="flex items-center gap-1 mt-2 text-blue-600">
              <TrendingUp size={12} />
              <span className="text-[10px] font-black uppercase">Consolidação Ativa</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-card overflow-hidden relative border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Não Conformidades</p>
            <h3 className="text-4xl font-black mt-1 text-amber-600">12</h3>
            <div className="flex items-center gap-1 mt-2 text-amber-600">
              <AlertTriangle size={12} />
              <span className="text-[10px] font-black uppercase">Pendências Técnicas</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-card overflow-hidden relative border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Laudos Emitidos</p>
            <h3 className="text-4xl font-black mt-1 text-emerald-600">48</h3>
            <div className="flex items-center gap-1 mt-2 text-emerald-600">
              <CheckCircle2 size={12} />
              <span className="text-[10px] font-black uppercase">Certificações ABNT</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-h4 font-bold text-foreground/90">Tendência de Qualidade (NBR 15575)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold' }} 
                />
                <YAxis 
                  domain={[80, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold' }} 
                />
                <ReTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-h4 font-bold text-foreground/90">Distribuição por Status</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusStats}
                cx="50%" 
                cy="50%" 
                innerRadius={60}
                outerRadius={100} 
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusStats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36}/>
              <ReTooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-h4 font-bold text-foreground/90">Vistorias por Técnico</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart
              data={technicianStats}
              layout="vertical" 
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100} 
                tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.7 }} 
                axisLine={false}
                tickLine={false}
              />
              <ReTooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                }}
              />
              <Bar 
                dataKey="value" 
                fill="hsl(var(--primary))" 
                radius={[0, 4, 4, 0]} 
                barSize={20} 
              />
            </ReBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
