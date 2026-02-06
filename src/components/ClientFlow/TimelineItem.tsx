
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
    <div className="relative flex gap-4">
      {/* Vertical line */}
      {!isLast && (
        <div 
          className={cn(
            "absolute left-[17px] top-10 w-0.5 h-[calc(100%-8px)]",
            styles.line
          )} 
        />
      )}
      
      {/* Status indicator */}
      <div className="relative z-10 flex-shrink-0">
        <div 
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center border-2",
            styles.dot
          )}
        >
          {getStatusIcon(item.status)}
        </div>
      </div>
      
      {/* Content */}
      <div className={cn(
        "flex-1 pb-6 pt-1"
      )}>
        <div className={cn(
          "p-3 rounded-lg border",
          styles.container
        )}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <EventIcon className={cn("h-4 w-4", styles.text)} />
              <h4 className={cn("font-medium", styles.text)}>
                {item.title}
              </h4>
            </div>
            {item.date && (
              <span className={cn("text-xs flex items-center gap-1", styles.description)}>
                <Calendar className="h-3 w-3" />
                {item.date.toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
          {item.description && (
            <p className={cn("text-sm mt-1", styles.description)}>
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
