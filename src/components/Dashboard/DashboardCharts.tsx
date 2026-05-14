
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
  LineChart,
  Line
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

export const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Vistorias por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inspectionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar 
                  dataKey="vistorias" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Chamados por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={warrantyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {warrantyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0' 
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
