
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
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
    <div className="w-[380px] max-h-[60vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-lg">Notificações</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={markAllAsRead}
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Marcar todas como lidas
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
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Você não tem notificações</p>
          </div>
        )}
      </ScrollArea>
      
      {/* Footer */}
      {notifications.length > 5 && (
        <div className="p-3 border-t">
          <Button variant="outline" size="sm" className="w-full">
            Ver todas notificações
          </Button>
        </div>
      )}
    </div>
  );
}
