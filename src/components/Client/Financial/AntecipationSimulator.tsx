import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TrendingUp, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks";

interface AntecipationSimulatorProps {
  formatCurrency: (val: number) => string;
}

export const AntecipationSimulator = ({ formatCurrency }: AntecipationSimulatorProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<number>(0);

  const handleSimulate = () => {
    if (amount <= 0) {
      toast({ title: "Erro", description: "Informe um valor válido para simulação.", variant: "destructive" });
      return;
    }
    
    const discountRate = amount >= 50000 ? 0.10 : amount >= 10000 ? 0.07 : 0.05;
    const discount = amount * discountRate;
    const finalValue = amount - discount;

    toast({
      title: "Simulação de Antecipação",
      description: (
        <div className="space-y-1">
          <p>Valor simulado: <span className="font-bold">{formatCurrency(amount)}</span></p>
          <p>Desconto ({discountRate * 100}%): <span className="font-bold text-green-600">-{formatCurrency(discount)}</span></p>
          <p className="border-t pt-1 mt-1">Valor final: <span className="font-bold">{formatCurrency(finalValue)}</span></p>
        </div>
      ) as any,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="border-dashed cursor-pointer hover:bg-primary/5 transition-colors group">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Simulador de Antecipação</CardTitle>
              <CardDescription>Economize juros antecipando parcelas futuras</CardDescription>
            </div>
            <ChevronRight className="text-muted-foreground" />
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">Simular Desconto</DialogTitle>
          <DialogDescription className="font-medium">Saiba quanto você economiza ao quitar parcelas com antecedência.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Valor que deseja antecipar</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground/60">R$</span>
              <Input 
                id="amount" 
                type="number" 
                className="h-14 pl-12 rounded-2xl text-lg font-black" 
                placeholder="0,00"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="bg-muted/30 p-5 rounded-2xl border border-border/10 space-y-3">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Regras de Desconto</h4>
             <ul className="space-y-2 text-xs font-bold text-muted-foreground">
                <li className="flex justify-between"><span>Até R$ 10.000</span> <span className="text-foreground">5% OFF</span></li>
                <li className="flex justify-between"><span>R$ 10k a R$ 50k</span> <span className="text-foreground">7% OFF</span></li>
                <li className="flex justify-between"><span>Acima de R$ 50k</span> <span className="text-foreground">10% OFF</span></li>
             </ul>
          </div>
          <Button onClick={handleSimulate} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20">Calcular Benefício</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
