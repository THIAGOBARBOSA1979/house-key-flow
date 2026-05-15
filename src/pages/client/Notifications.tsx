
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, Clock, Trash2, Filter, AlertTriangle, MessageSquare, ShieldCheck, ClipboardCheck, FileText, Settings, Mail, Smartphone } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { notificationService } from "@/services/NotificationService";
import { useToast } from "@/hooks/use-toast";
import { NotificationSettings } from "@/types/clientFlow";

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
  const [activeTab, setActiveTab] = useState('list');
  const { toast } = useToast();
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: { inspections: true, warranty: true, updates: true },
    sms: { inspections: false, warranty: false, updates: false }
  });

  useEffect(() => {
    if (clientId) {
      setNotificationSettings(notificationService.getSettings(clientId));
    }
  }, [clientId]);

  const handleSaveSettings = () => {
    notificationService.updateSettings(clientId, notificationSettings);
    toast({
      title: "Configurações salvas",
      description: "Suas preferências de notificação foram atualizadas com sucesso.",
    });
  };

  const toggleSetting = (channel: 'email' | 'sms', category: keyof NotificationSettings['email']) => {
    setNotificationSettings(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [category]: !prev[channel][category]
      }
    }));
  };

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
          {activeTab === 'list' && unreadNotifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Minhas Notificações
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <div className="flex items-center gap-4 mb-2">
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

        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Notificações por E-mail
                </CardTitle>
                <CardDescription>
                  Escolha quais alertas você deseja receber no seu e-mail cadastrado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Vistorias</Label>
                    <p className="text-sm text-muted-foreground">Agendamentos, lembretes e relatórios.</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.email.inspections} 
                    onCheckedChange={() => toggleSetting('email', 'inspections')} 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Garantias</Label>
                    <p className="text-sm text-muted-foreground">Abertura de chamados e atualizações de status.</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.email.warranty} 
                    onCheckedChange={() => toggleSetting('email', 'warranty')} 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Atualizações do Imóvel</Label>
                    <p className="text-sm text-muted-foreground">Novidades sobre as fases do seu imóvel.</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.email.updates} 
                    onCheckedChange={() => toggleSetting('email', 'updates')} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Notificações por SMS
                </CardTitle>
                <CardDescription>
                  Receba alertas urgentes diretamente no seu celular.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Vistorias</Label>
                    <p className="text-sm text-muted-foreground">Lembretes 24h antes da sua visita.</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.sms.inspections} 
                    onCheckedChange={() => toggleSetting('sms', 'inspections')} 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Garantias</Label>
                    <p className="text-sm text-muted-foreground">Avisos de conclusão de reparos.</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.sms.warranty} 
                    onCheckedChange={() => toggleSetting('sms', 'warranty')} 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Atualizações Urgentes</Label>
                    <p className="text-sm text-muted-foreground">Alertas críticos sobre seu imóvel.</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.sms.updates} 
                    onCheckedChange={() => toggleSetting('sms', 'updates')} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveSettings} size="lg">
              Salvar Preferências
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientNotifications;
