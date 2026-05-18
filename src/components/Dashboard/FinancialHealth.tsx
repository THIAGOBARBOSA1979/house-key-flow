import { useNavigate } from "react-router-dom";
import { DollarSign, ChevronRight, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface FinancialHealthProps {
  metrics: any;
}

export const FinancialHealth = ({ metrics }: FinancialHealthProps) => {
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h2 flex items-center gap-2">
          <DollarSign size={24} className="text-emerald-500" />
          Saúde Financeira
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 font-bold text-primary" 
          onClick={() => navigate("/admin/financial")}
        >
          Detalhes
          <ChevronRight size={16} />
        </Button>
      </div>
      <Card className="card-standard border-none bg-emerald-500/5 backdrop-blur-md overflow-hidden p-6 rounded-3xl border border-emerald-500/10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700/60">Recebido vs Inadimplência</span>
          <Badge className="bg-red-500 text-white border-none font-bold">
            {((metrics.totalOverdue / metrics.totalReceivable) * 100).toFixed(1)}% Atraso
          </Badge>
        </div>
        <div className="text-3xl font-black tracking-tighter text-emerald-700 mb-1">
          {formatCurrency(metrics.totalPaid)}
        </div>
        <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest">
          Inadimplência: {formatCurrency(metrics.totalOverdue)}
        </p>
        
        <div className="mt-6 pt-6 border-t border-emerald-500/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-emerald-700/50 leading-none">Eficiência</p>
              <p className="text-sm font-black text-emerald-700">98.5%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-red-700/50 leading-none">Vencidos</p>
              <p className="text-sm font-black text-red-700">12 títulos</p>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};
