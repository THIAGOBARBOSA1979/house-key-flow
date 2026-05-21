import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useWarranty } from "@/hooks";

export const CriticalWarranties = () => {
  const navigate = useNavigate();
  const { requests: claims } = useWarranty();
  const criticalClaims = claims
    .filter(c => c.priority === 'high' || c.priority === 'critical')
    .slice(0, 3);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-h2 flex items-center gap-2 font-black">
          <ShieldCheck className="text-status-critical h-5 w-5 md:h-6 md:w-6" />
          Patologias Críticas
        </h2>
      </div>
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-slow">
        {criticalClaims.length > 0 ? (
          criticalClaims.map((claim) => (
            <div 
              key={claim.id} 
              className="card-standard p-5 interactive-active border-none bg-card/40 backdrop-blur-md group hover:ring-2 hover:ring-status-critical/30 rounded-2xl shadow-sem-sm transition-all" 
              onClick={() => navigate("/admin/warranty")}
            >
              <div className="flex justify-between items-start mb-3">
                <StatusBadge 
                  status={claim.priority === 'high' || claim.priority === 'critical' ? 'critical' : 'warning'} 
                  label={claim.priority === 'high' ? 'URGENTE' : claim.priority === 'critical' ? 'EMERGÊNCIA' : 'Média'}
                  size="sm"
                />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/30 px-2 py-0.5 rounded-lg">ID: {claim.id.slice(0, 6)}</span>
              </div>
              <h4 className="text-label group-hover:text-status-critical transition-colors font-black leading-tight">{claim.title}</h4>
              <p className="text-[11px] text-muted-foreground mt-2 font-bold uppercase tracking-tighter italic">{claim.propertyName} • UN. {claim.unitNumber}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-muted/10 rounded-2xl border border-dashed">
            <p className="text-xs text-muted-foreground font-black uppercase tracking-widest opacity-40">Governança OK: Nenhuma patologia crítica</p>
          </div>
        )}
      </div>
      <Button 
        variant="outline" 
        className="w-full text-[10px] font-black uppercase tracking-widest rounded-xl h-12 border-dashed border-primary/20 hover:border-primary/50 hover:bg-primary/5 mt-4 transition-all" 
        onClick={() => navigate("/admin/warranty")}
      >
        Matriz de Assistência Técnica
      </Button>

    </section>
  );
};
