import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Phone, Smartphone, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function WarrantyEmergencyBanner() {
  return (
    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-gradient-to-br from-destructive via-red-600 to-red-800 text-white p-10 overflow-hidden relative group">
      <div className="absolute right-[-5%] top-[-10%] opacity-10 group-hover:rotate-12 transition-transform duration-1000">
        <AlertCircle size={280} />
      </div>
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="space-y-6 max-w-xl">
          <Badge className="bg-white text-destructive border-none font-black uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 rounded-xl shadow-lg">Urgência Técnica</Badge>
          <h3 className="text-3xl font-black tracking-tighter leading-tight">Plantão 24h para Falhas Críticas</h3>
          <p className="text-red-100 font-medium leading-relaxed">
            Em caso de vazamentos hidráulicos graves, curto-circuito ou risco estrutural iminente, não aguarde o protocolo comum. Acione nosso plantão de emergência agora.
          </p>
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-lg"><Clock size={16} /></div>
              <span className="text-xs font-black uppercase tracking-widest">Resposta Imediata</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-lg"><Smartphone size={16} /></div>
              <span className="text-xs font-black uppercase tracking-widest">WhatsApp de Plantão</span>
            </div>
          </div>
        </div>
        <Button className="bg-white text-destructive hover:bg-red-50 rounded-[2rem] font-black uppercase tracking-widest text-xs h-20 px-12 shadow-2xl hover:scale-105 active:scale-95 transition-all w-full lg:w-auto">
          <Phone className="mr-3 h-5 w-5" strokeWidth={3} /> Ligar para Emergência
        </Button>
      </div>
    </Card>
  );
}
