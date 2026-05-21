
import { 
  CheckCircle, 
  Clock, 
  Circle, 
  Lock,
  Calendar,
  ClipboardCheck,
  ShieldCheck,
  UserPlus,
  FileCheck
} from "lucide-react";
import { TimelineItem, TimelineItemStatus, EventType } from "@/types/clientFlow";
import { cn } from "@/lib/utils";

interface TimelineItemProps {
  item: TimelineItem;
  isLast?: boolean;
}

const getStatusIcon = (status: TimelineItemStatus) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'current':
      return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
    case 'pending':
      return <Circle className="h-5 w-5 text-muted-foreground/50" />;
    case 'blocked':
      return <Lock className="h-5 w-5 text-red-600" />;
  }
};

const getEventIcon = (eventType: EventType) => {
  switch (eventType) {
    case 'client_registered':
      return UserPlus;
    case 'inspection_enabled':
    case 'inspection_scheduled':
    case 'inspection_completed':
    case 'inspection_approved':
    case 'inspection_rejected':
      return ClipboardCheck;
    case 'warranty_enabled':
    case 'warranty_requested':
    case 'warranty_completed':
      return ShieldCheck;
    default:
      return FileCheck;
  }
};

const getStatusStyles = (status: TimelineItemStatus) => {
  switch (status) {
    case 'completed':
      return {
        container: 'border-green-200 bg-green-50',
        line: 'bg-green-400',
        dot: 'bg-green-600 border-green-200',
        text: 'text-green-900',
        description: 'text-green-700'
      };
    case 'current':
      return {
        container: 'border-blue-200 bg-blue-50',
        line: 'bg-blue-400',
        dot: 'bg-blue-600 border-blue-200',
        text: 'text-blue-900',
        description: 'text-blue-700'
      };
    case 'pending':
      return {
        container: 'border-muted bg-muted/30',
        line: 'bg-muted',
        dot: 'bg-muted-foreground/30 border-muted',
        text: 'text-muted-foreground',
        description: 'text-muted-foreground/80'
      };
    case 'blocked':
      return {
        container: 'border-red-200 bg-red-50',
        line: 'bg-red-400',
        dot: 'bg-red-600 border-red-200',
        text: 'text-red-900',
        description: 'text-red-700'
      };
  }
};

export function TimelineItemComponent({ item, isLast = false }: TimelineItemProps) {
  const styles = getStatusStyles(item.status);
  const EventIcon = getEventIcon(item.eventType);

  return (
    <div className="relative flex gap-6 group/item">
      {/* Vertical line */}
      {!isLast && (
        <div 
          className={cn(
            "absolute left-[17px] top-10 bottom-0 w-[2px] transition-all duration-700 opacity-20",
            styles.line
          )} 
        />
      )}
      
      {/* Status indicator */}
      <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center mt-1">
        <div 
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all duration-500 group-hover/item:scale-110",
            styles.dot,
            item.status === 'current' && 'animate-pulse ring-2 ring-primary/20 ring-offset-2'
          )}
        >
          <EventIcon className={cn("h-5 w-5", styles.text)} strokeWidth={2.5} />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex flex-col pb-10 flex-1">
        <div className={cn(
          "p-6 rounded-[1.5rem] border-none shadow-sem-sm hover:shadow-sem-lg transition-all duration-500",
          item.status === 'current' ? 'bg-white' : 'bg-muted/20'
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <h4 className={cn(
              "text-sm font-black uppercase tracking-widest",
              styles.text
            )}>
              {item.title}
            </h4>
            {item.date && (
              <span className={cn(
                "text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full",
                styles.container,
                styles.text
              )}>
                {item.date.toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
          {item.description && (
            <p className={cn(
              "text-xs leading-relaxed font-medium transition-colors duration-300",
              item.status === "pending" ? "text-muted-foreground/40" : "text-muted-foreground"
            )}>
              {item.description}
            </p>
          )}
          
          {item.status === 'current' && (
            <div className="mt-4 flex items-center gap-2">
               <div className="h-1 flex-1 bg-primary/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-1/3 animate-[progress-pulse_2s_infinite]" />
               </div>
               <span className="text-[9px] font-black text-primary uppercase animate-pulse">Em análise</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
