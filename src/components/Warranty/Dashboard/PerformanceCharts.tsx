
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WarrantyMetrics, WARRANTY_STAGES, STAGE_ORDER, WarrantyStage } from "@/types/warrantyFlow";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";

interface PerformanceChartsProps {
  metrics: WarrantyMetrics;
}

export function PerformanceCharts({ metrics }: PerformanceChartsProps) {
  // Pie chart colors
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
  
  // SLA Status data
  const slaData = [
    { name: 'No prazo', value: metrics.onTrackCount, color: '#10b981' },
    { name: 'Em alerta', value: metrics.warningCount, color: '#f59e0b' },
    { name: 'Atrasados', value: metrics.expiredCount, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Stage distribution data
  const stageData = STAGE_ORDER.map(stage => ({
    name: WARRANTY_STAGES[stage].label.split(' ')[0], // Short name
    fullName: WARRANTY_STAGES[stage].label,
    count: metrics.stageDistribution[stage] || 0
  }));

  // Priority distribution data
  const priorityData = [
    { name: 'Crítica', value: metrics.byPriority.critical || 0, color: '#ef4444' },
    { name: 'Alta', value: metrics.byPriority.high || 0, color: '#f97316' },
    { name: 'Média', value: metrics.byPriority.medium || 0, color: '#3b82f6' },
    { name: 'Baixa', value: metrics.byPriority.low || 0, color: '#6b7280' }
  ].filter(d => d.value > 0);

  // By type data
  const typeData = Object.entries(metrics.byType).map(([type, data]) => ({
    name: type.split(' ')[0], // Short name
    fullName: type,
    total: data.total,
    avgTime: Math.round(data.avgTime / 24), // Convert to days
    slaCompliance: data.slaCompliance
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* SLA Status Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status do SLA</CardTitle>
          <CardDescription>Distribuição por cumprimento de prazo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {slaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {slaData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }} 
                />
                <span className="text-sm text-muted-foreground">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stage Distribution Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuição por Etapa</CardTitle>
          <CardDescription>Quantidade de solicitações em cada etapa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'Solicitações']}
                  labelFormatter={(label) => stageData.find(d => d.name === label)?.fullName || label}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Por Prioridade</CardTitle>
          <CardDescription>Distribuição por nível de prioridade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* By Type - Time Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tempo Médio por Tipo</CardTitle>
          <CardDescription>Dias para resolução por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'avgTime') return [`${value} dias`, 'Tempo médio'];
                    if (name === 'total') return [value, 'Total'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => typeData.find(d => d.name === label)?.fullName || label}
                />
                <Bar dataKey="avgTime" fill="#8b5cf6" name="Tempo médio (dias)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
