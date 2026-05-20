import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, CheckCircle2 } from "lucide-react";

interface NextPaymentCardProps {
  nextPayment: { value: number; dueDate: Date } | null;
  formatCurrency: (val: number) => string;
  onPay: () => void;
}

export const NextPaymentCard = ({ nextPayment, formatCurrency, onPay }: NextPaymentCardProps) => (
  <Card className="shadow-xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-3xl">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
    <CardHeader className="pb-2">
      <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/70">Próximo Vencimento</CardDescription>
      <CardTitle className="text-2xl font-bold">
        {nextPayment ? formatCurrency(nextPayment.value) : 'Nenhum'}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {nextPayment ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm bg-white/10 p-3 rounded-xl border border-white/20">
            <Calendar className="h-4 w-4" />
            <span className="font-bold">{nextPayment.dueDate.toLocaleDateString('pt-BR')}</span>
          </div>
          <Button 
            className="w-full rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px] h-14 bg-white text-primary hover:bg-white/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
            onClick={onPay}
          >
            <CreditCard className="h-4 w-4" />
            Pagar Agora (Boleto/PIX)
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
          <div className="p-3 bg-white/20 rounded-full">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <span className="text-sm font-bold">Contrato em dia!</span>
          <p className="text-[10px] text-white/70 uppercase tracking-widest font-black">Nenhuma pendência encontrada</p>
        </div>
      )}
    </CardContent>
  </Card>
);
