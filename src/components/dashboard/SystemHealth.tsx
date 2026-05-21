import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SystemHealthMetrics } from "@/services";

interface SystemHealthProps {
  metrics: SystemHealthMetrics;
}

export const SystemHealth = ({ metrics }: SystemHealthProps) => {
  return (
    <section className="animate-in fade-in slide-in-from-right-4 duration-slow delay-75">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-h2 flex items-center gap-2 font-black">
          <Activity className="text-primary h-5 w-5 md:h-6 md:w-6" />
          Saúde do Ecossistema
        </h2>
        <StatusBadge 
          status={metrics.status === 'healthy' ? 'success' : metrics.status} 
          label={metrics.status === 'healthy' ? 'Estável' : (metrics.status === 'warning' ? 'Alerta' : 'Crítico')}
          size="sm"
        />
      </div>
      <Card className="card-standard border-none bg-card/40 backdrop-blur-md p-6 rounded-3xl shadow-sem-md group hover:shadow-sem-lg transition-all duration-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Logs de Rastreabilidade</p>
            <p className="text-xl font-black group-hover:text-primary transition-colors animate-pulse">{metrics.database.auditLogCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Patrimônio Digital</p>
            <p className="text-xl font-black">{metrics.storageUsage}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Disponibilidade Operacional</p>
            <p className="text-sm font-bold text-emerald-600">{metrics.uptime}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Cache Hit</p>
            <p className="text-sm font-bold">{metrics.database.cacheHitRate}</p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border/10 space-y-3">
          {metrics.services.map((service) => (
            <div key={service.name} className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">{service.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground/50">{service.latency}</span>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${service.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
};
