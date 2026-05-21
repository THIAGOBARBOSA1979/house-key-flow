import { useNavigate } from "react-router-dom";
import { MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/Shared/StatusBadge";
import { SupportTicket } from "@/services";

interface RecentTicketsProps {
  tickets: SupportTicket[];
}

export const RecentTickets = ({ tickets }: RecentTicketsProps) => {
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-h2 flex items-center gap-2 font-black">
          <MessageSquare className="text-primary h-5 w-5 md:h-6 md:w-6" />
          Atendimentos Recentes
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 font-bold text-primary" 
          onClick={() => navigate("/admin/support")}
        >
          Ver todos
          <ChevronRight size={16} />
        </Button>
      </div>
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-slow">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className="card-standard p-5 interactive-active border-none bg-card/40 backdrop-blur-md group hover:ring-2 hover:ring-primary/30 rounded-2xl shadow-sem-sm transition-all" 
              onClick={() => navigate("/admin/support")}
            >
              <div className="flex justify-between items-start mb-3">
                <StatusBadge 
                  status={ticket.status === 'pending' ? 'pending' : 'progress'} 
                  label={ticket.status === 'pending' ? 'Aguardando' : 'Em Atendimento'}
                  size="sm"
                />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/30 px-2 py-0.5 rounded-lg">#{ticket.id.substring(0, 8)}</span>
              </div>
              <h4 className="text-label group-hover:text-primary transition-colors font-black leading-tight">{ticket.subject}</h4>
              <p className="text-[11px] text-muted-foreground mt-2 font-bold uppercase tracking-tighter">
                {ticket.messages[0]?.senderName} • {ticket.category}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-muted/10 rounded-2xl border border-dashed">
            <p className="text-xs text-muted-foreground font-black uppercase tracking-widest opacity-40">Sem atendimentos pendentes</p>
          </div>
        )}
      </div>
    </section>
  );
};
