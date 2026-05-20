import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

interface PaymentHistoryProps {
  data: Array<{ month: string; value: number }>;
  formatCurrency: (val: number) => string;
}

export const PaymentHistory = ({ data, formatCurrency }: PaymentHistoryProps) => (
  <Card className="shadow-lg border-none bg-white overflow-hidden rounded-3xl">
    <CardHeader className="pb-2">
      <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Histórico de Pagamentos</CardDescription>
      <CardTitle className="text-xl font-bold">Últimos 6 meses</CardTitle>
    </CardHeader>
    <CardContent className="h-48 pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
          />
          <YAxis hide />
          {/* @ts-ignore */}
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);
