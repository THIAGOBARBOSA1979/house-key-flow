import { useNavigate } from "react-router-dom";
import { History, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AuditLogEntry } from "@/services";

interface SystemAuditTimelineProps {
  activities: AuditLogEntry[];
}

export const SystemAuditTimeline = ({ activities }: SystemAuditTimelineProps) => {
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-h2 flex items-center gap-2.5 font-black uppercase tracking-tighter">
          <History className="text-primary h-5 w-5" />
          Rastreabilidade Digital
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 font-bold text-primary hover:bg-primary/5 rounded-xl" 
          onClick={() => navigate("/admin/audit-logs")}
        >
          Audit Log
          <ChevronRight size={14} />
        </Button>
      </div>
      <Card className="card-standard border border-border/20 bg-card/30 backdrop-blur-md overflow-hidden rounded-[2.5rem] shadow-sem-sm animate-in fade-in slide-in-from-right-4 duration-slow">
        <CardContent className="p-8">
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 md:before:ml-0 md:before:left-1/2 before:-translate-x-px md:before:-translate-x-1/2 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/50 before:to-transparent">
            {activities.map((activity, idx) => (
              <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shadow-sem-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 group-hover:scale-110 transition-transform duration-500">
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(var(--primary),0.4)] transition-all duration-500",
                    idx === 0 ? "bg-primary animate-pulse" : "bg-muted-foreground/30 group-hover:bg-primary/50"
                  )} />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-[1.75rem] bg-white/[0.03] border border-border/40 shadow-sem-sm group-hover:shadow-sem-md group-hover:border-primary/20 transition-all duration-500">
                  <div className="flex items-center justify-between space-x-2 mb-1.5">
                    <div className="font-black text-foreground text-xs uppercase tracking-widest">{activity.performedByName}</div>
                    <time className="text-[10px] font-bold text-muted-foreground/40 uppercase">
                        {new Date(activity.timestamp).toLocaleDateString('pt-BR')}
                    </time>
                  </div>
                  <div className="text-sem-body-sm text-muted-foreground/80 font-medium leading-relaxed line-clamp-2">
                    {activity.details}
                  </div>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="p-10 text-center">
                <p className="text-sm font-bold text-muted-foreground/30 uppercase tracking-widest">Sem interações registradas</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
