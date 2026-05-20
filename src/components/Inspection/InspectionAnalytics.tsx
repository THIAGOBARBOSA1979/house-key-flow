
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
  Legend 
} from 'recharts';

interface InspectionAnalyticsProps {
  statusStats: { name: string; value: number }[];
  technicianStats: { name: string; value: number }[];
}

export const InspectionAnalytics = ({ statusStats, technicianStats }: InspectionAnalyticsProps) => {
  const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
