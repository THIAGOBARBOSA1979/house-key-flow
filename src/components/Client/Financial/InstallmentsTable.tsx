import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, FileText } from "lucide-react";
import { StatusBadge } from "@/components/Shared/StatusBadge";
import { Installment } from "@/services";

interface InstallmentsTableProps {
  installments: Installment[];
  formatCurrency: (val: number) => string;
  onPay?: (id: string) => void;
}

export const InstallmentsTable = ({ installments, formatCurrency }: InstallmentsTableProps) => {
  const getStatusInfo = (status: Installment['status']) => {
    switch (status) {
      case 'paid': return { label: 'Pago', status: 'complete' as const };
      case 'overdue': return { label: 'Atrasado', status: 'critical' as const };
      default: return { label: 'Pendente', status: 'pending' as const };
    }
  };

  const getTypeLabel = (type: Installment['type']) => {
    switch (type) {
      case 'monthly': return 'Mensal';
      case 'annual': return 'Anual';
      case 'delivery': return 'Chaves';
      default: return 'Extra';
    }
  };

  return (
    <Card className="shadow-sem-lg border-none rounded-[2rem] overflow-hidden bg-card/40 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 p-8 border-b border-border/10">
        <div>
          <CardTitle className="text-xl font-black tracking-tight text-foreground/90">Cronograma de Parcelas</CardTitle>
          <CardDescription className="font-medium">Histórico completo e previsões futuras do seu contrato</CardDescription>
        </div>
        <Badge className="font-black px-4 py-1.5 rounded-xl bg-primary/10 text-primary border-none uppercase text-[10px] tracking-widest">
          {installments.length} Registros
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30 text-[10px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">
                <th className="py-5 px-8 text-left">Ref</th>
                <th className="py-5 px-8 text-left">Categoria</th>
                <th className="py-5 px-8 text-left">Vencimento</th>
                <th className="py-5 px-8 text-left">Valor Atualizado</th>
                <th className="py-5 px-8 text-center">Status</th>
                <th className="py-5 px-8 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {installments.length > 0 ? installments.map((item) => {
                const statusInfo = getStatusInfo(item.status);
                return (
                  <tr key={item.id} className="group hover:bg-primary/[0.02] transition-colors">
                    <td className="py-5 px-8">
                      <span className="text-sm font-black text-foreground/80">#{String(item.number).padStart(3, '0')}</span>
                    </td>
                    <td className="py-5 px-8">
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest rounded-lg border-border/40 text-muted-foreground/80 bg-background/50">
                        {getTypeLabel(item.type)}
                      </Badge>
                    </td>
                    <td className="py-5 px-8 text-sm font-bold text-muted-foreground">
                      {item.dueDate.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-5 px-8 font-black text-sm text-foreground/90">
                      {formatCurrency(item.value)}
                    </td>
                    <td className="py-5 px-8 text-center">
                      <StatusBadge status={statusInfo.status} label={statusInfo.label} size="sm" />
                    </td>
                    <td className="py-5 px-8 text-right">
                      {item.status !== 'paid' ? (
                        <Button variant="ghost" size="sm" className="h-10 px-4 gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-xl transition-all active:scale-95">
                          <Download className="h-4 w-4" /> Boleto
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-10 px-4 gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all active:scale-95">
                          <CheckCircle2 className="h-4 w-4" /> Recibo
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center">
                         <FileText className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <p className="text-muted-foreground font-bold italic">Nenhum registro financeiro disponível.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
