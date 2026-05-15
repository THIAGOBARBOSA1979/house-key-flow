
import { ClientNotification } from "@/types/clientFlow";
import { cn } from "@/lib/utils";
import { 
  Bell, 
  ClipboardCheck, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationItemProps {
  notification: ClientNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  formatRelativeTime: (date: Date) => string;
}

const getNotificationIcon = (type: ClientNotification['type']) => {
  switch (type) {
    case 'inspection_enabled':
    case 'inspection_scheduled':
    case 'inspection_approved':
    case 'inspection_rejected':
    case 'inspection_reminder':
      return ClipboardCheck;
    case 'warranty_enabled':
    case 'warranty_created':
    case 'warranty_updated':
    case 'warranty_completed':
      return ShieldCheck;
    default:
      return Bell;
  }
};

const getNotificationColors = (type: ClientNotification['type'], urgent: boolean) => {
  if (type.includes('rejected') || (urgent && type.includes('reminder'))) {
    return {
      icon: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200'
    };
  }
  
  if (type.includes('approved') || type.includes('completed') || type.includes('enabled')) {
    return {
      icon: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    };
  }

  return {
    icon: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  };
};

export function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  formatRelativeTime 
}: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.type);
  const colors = getNotificationColors(notification.type, notification.urgent);

  return (
    <div 
      className={cn(
        "p-5 hover:bg-muted/50 cursor-pointer transition-all relative group border-l-4",
        !notification.read ? "bg-primary/5 border-l-primary" : "border-l-transparent"
      )}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          colors.bg
        )}>
          <Icon className={cn("h-4 w-4", colors.icon)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "font-black text-sm tracking-tight leading-tight",
              !notification.read ? "text-primary" : "text-foreground/80"
            )}>
              {notification.title}
            </h4>
            <span className="text-[10px] font-black text-muted-foreground/60 whitespace-nowrap uppercase italic">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 font-medium leading-relaxed">
            {notification.message}
          </p>
          {notification.urgent && !notification.read && (
            <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500 text-white shadow-sm">
              Urgente
            </div>
          )}
        </div>
        
        {/* Delete button - shows on hover */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
