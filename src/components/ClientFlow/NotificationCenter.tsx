import { Link } from "react-router-dom";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks";
import { NotificationItem } from "./NotificationItem";

interface NotificationCenterProps {
  clientId: string;
}

export function NotificationCenter({ clientId }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    formatRelativeTime
  } = useNotifications(clientId);

  if (isLoading) {
    return (
      <div className="w-[380px] max-h-[60vh] flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-medium text-lg">Notificações</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[380px] md:w-[420px] max-h-[70vh] flex flex-col bg-card rounded-2xl shadow-2xl border border-primary/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-black text-base tracking-tight leading-none">Notificações</h3>
            <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">Sua central de alertas</p>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-primary text-primary-foreground font-black text-[10px] px-2 h-5 rounded-full border-none shadow-sm">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[10px] font-black uppercase tracking-widest h-8 px-3 hover:bg-primary/5 hover:text-primary transition-all"
            onClick={markAllAsRead}
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
            Lidas
          </Button>
        )}
      </div>
      
      {/* Notifications list */}
      <ScrollArea className="flex-1">
        {notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                formatRelativeTime={formatRelativeTime}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="p-4 bg-muted/50 rounded-full mb-4 shadow-inner">
              <Inbox className="h-10 w-10 text-muted-foreground/20" />
            </div>
            <h4 className="font-bold text-sm text-foreground/80">Nenhuma nova notificação</h4>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Você está em dia com todos os seus alertas.</p>
          </div>
        )}
      </ScrollArea>
      
      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-4 border-t bg-muted/20">
          <Button variant="outline" size="sm" className="w-full font-black uppercase tracking-widest text-[10px] h-10 border-2 rounded-xl" asChild>
            <Link to="/client/notifications">
              Ver todas notificações
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
