import { Activity, ShieldCheck, Database, HardDrive, Cpu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SystemHealthMetrics } from "@/services";
import { cn } from "@/lib/utils";

interface SystemHealthProps {
  metrics: SystemHealthMetrics;
}

export const SystemHealth = ({ metrics }: SystemHealthProps) => {
  return (
    <section className="animate-in fade-in slide-in-from-right-4 duration-slow delay-75">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-h2 flex items-center gap-2.5 font-black uppercase tracking-tighter">
          <Activity className="text-primary h-5 w-5" />
          Saúde do Ecossistema
        </h2>
        <StatusBadge 
          status={metrics.status === 'healthy' ? 'success' : metrics.status} 
          label={metrics.status === 'healthy' ? 'Estável' : (metrics.status === 'warning' ? 'Alerta' : 'Crítico')}
          size="sm"
        />
      </div>
      <Card className="card-standard border border-border/20 bg-card/30 backdrop-blur-md p-8 rounded-[2rem] shadow-sem-sm group hover:shadow-sem-xl transition-all duration-500">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-1.5 group/metric">
            <div className="flex items-center gap-2 text-muted-foreground/60 group-hover/metric:text-primary transition-colors">
              <ShieldCheck size={12} />
              <p className="text-[9px] font-black uppercase tracking-[0.1em]">Auditoria</p>
            </div>
            <p className="text-2xl font-black tracking-tight">{metrics.database.auditLogCount}</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-muted-foreground/60">
              <HardDrive size={12} />
              <p className="text-[9px] font-black uppercase tracking-[0.1em]">Armazenamento</p>
            </div>
            <p className="text-2xl font-black tracking-tight">{metrics.storageUsage}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-muted-foreground/60">
              <Cpu size={12} />
              <p className="text-[9px] font-black uppercase tracking-[0.1em]">Uptime</p>
            </div>
            <p className="text-sm font-bold text-emerald-600/90">{metrics.uptime}</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-muted-foreground/60">
              <Database size={12} />
              <p className="text-[9px] font-black uppercase tracking-[0.1em]">Performance</p>
            </div>
            <p className="text-sm font-bold text-foreground/80">{metrics.database.cacheHitRate}</p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border/10 space-y-4">
          {metrics.services.map((service) => (
            <div key={service.name} className="flex items-center justify-between group/service">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 group-hover/service:text-foreground transition-colors">{service.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-medium text-muted-foreground/40">{service.latency}</span>
                <div className={cn(
                  "w-2 h-2 rounded-full transition-all duration-500",
                  service.status === 'online' 
                    ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" 
                    : "bg-amber-500 animate-pulse"
                )} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
};

