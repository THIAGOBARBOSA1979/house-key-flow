

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
import { cn } from "@/lib/utils";

const inspectionData = [
  { name: 'Jan', vistorias: 40 },
  { name: 'Fev', vistorias: 30 },
  { name: 'Mar', vistorias: 20 },
  { name: 'Abr', vistorias: 27 },
  { name: 'Mai', vistorias: 18 },
  { name: 'Jun', vistorias: 23 },
];

const warrantyData = [
  { name: 'Elétrica', value: 400 },
  { name: 'Hidráulica', value: 300 },
  { name: 'Pintura', value: 300 },
  { name: 'Estrutural', value: 200 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

/**
 * Dashboard charts refactored with Design System aesthetic.
 */
export const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="card-standard border-none bg-background/50 backdrop-blur-md">
        <CardHeader className="pb-4 border-b border-border/10">
          <CardTitle className="text-h3 font-bold">Vistorias por Mês</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inspectionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--muted))" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid hsl(var(--border))',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '12px',
                    fontWeight: 'bold'
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

      <Card className="card-standard border-none bg-background/50 backdrop-blur-md">
        <CardHeader className="pb-4 border-b border-border/10">
          <CardTitle className="text-h3 font-bold">Chamados por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={warrantyData}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {warrantyData.map((entry, index) => (
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
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-tiny font-bold text-muted-foreground uppercase tracking-wider ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

