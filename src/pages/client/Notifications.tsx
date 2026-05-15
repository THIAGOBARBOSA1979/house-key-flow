
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, Clock, Trash2, Filter, AlertTriangle, MessageSquare, ShieldCheck, ClipboardCheck, FileText } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

const getIcon = (type: string) => {
  switch (type) {
    case 'warranty': return ShieldCheck;
    case 'inspection': return ClipboardCheck;
    case 'document': return FileText;
    case 'message': return MessageSquare;
    case 'alert': return AlertTriangle;
    default: return Bell;
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case 'warranty': return 'text-blue-500 bg-blue-50';
    case 'inspection': return 'text-purple-500 bg-purple-50';
    case 'document': return 'text-emerald-500 bg-emerald-50';
    case 'alert': return 'text-amber-500 bg-amber-50';
    default: return 'text-primary bg-primary/10';
  }
};

const ClientNotifications = () => {
  const { user } = useAuth();
  const clientId = user?.id || "client-1";
  const { 
    notifications, 
    unreadNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    formatRelativeTime,
    isLoading 
  } = useNotifications(clientId);
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread' 
    ? unreadNotifications 
    : notifications;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notificações
          </h1>
          <p className="text-muted-foreground mt-1">
            Fique por dentro das atualizações do seu imóvel
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadNotifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todas
        </Button>
        <Button 
          variant={filter === 'unread' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('unread')}
          className="relative"
        >
          Não lidas
          {unreadNotifications.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground border-none">
              {unreadNotifications.length}
            </Badge>
          )}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y">
              {filteredNotifications.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <div 
                    key={notification.id} 
                    className={cn(
                      "p-4 md:p-6 transition-colors group relative",
                      !notification.read ? "bg-primary/5" : "hover:bg-muted/30"
                    )}
                  >
                    <div className="flex gap-4">
                      <div className={cn("p-3 rounded-full h-fit", getIconColor(notification.type))}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className={cn("font-semibold text-lg", !notification.read ? "text-primary" : "text-foreground")}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(notification.createdAt)}
                            </span>
                            {notification.urgent && !notification.read && (
                              <Badge variant="destructive" className="animate-pulse">Urgente</Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground leading-relaxed">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-4 pt-2">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Marcar como lida
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted p-6 rounded-full mb-4">
                <Bell className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-semibold">Nenhuma notificação encontrada</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                {filter === 'unread' 
                  ? "Você leu todas as suas notificações. Ótimo trabalho!" 
                  : "Não temos nenhuma notificação para mostrar no momento."}
              </p>
              {filter === 'unread' && notifications.length > 0 && (
                <Button variant="link" className="mt-4" onClick={() => setFilter('all')}>
                  Ver notificações antigas
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings Hint */}
      <Card className="bg-muted/50 border-none">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-background rounded-lg">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Gerencie suas notificações</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Você pode configurar quais tipos de alertas deseja receber por e-mail nas configurações do seu perfil.
              </p>
              <Button variant="link" className="p-0 h-auto text-xs mt-2" disabled>
                Ir para configurações de perfil (Em breve)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientNotifications;
