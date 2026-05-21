
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, Clock, Trash2, Filter, AlertTriangle, MessageSquare, ShieldCheck, ClipboardCheck, FileText, Settings, Mail, Smartphone } from "lucide-react";
import { useNotifications } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { notificationService } from "@/services";
import { useToast } from "@/hooks";
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
    email: { inspections: true, warranty: true, updates: true, reminders: true },
    sms: { inspections: false, warranty: false, updates: false, reminders: false }
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
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl shadow-sm border border-primary/20">
              <Bell className="h-8 w-8" />
            </div>
            Notificações
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Fique por dentro de todas as atualizações importantes sobre seu imóvel.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {activeTab === 'list' && unreadNotifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="font-black uppercase tracking-widest text-[10px] rounded-xl border-2 h-10 px-4">
              <CheckCircle className="mr-2 h-4 w-4" />
              Marcar lidas
            </Button>
          )}
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-2">
             <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="list" className="flex items-center gap-2 px-6">
            <Bell className="h-4 w-4" />
            Minhas Notificações
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 px-6">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6 outline-none">
          <div className="flex items-center gap-4">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
              className="px-6 font-bold"
            >
              Todas
            </Button>
            <Button 
              variant={filter === 'unread' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('unread')}
              className="relative px-6 font-bold"
            >
              Não lidas
              {unreadNotifications.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground border-none">
                  {unreadNotifications.length}
                </Badge>
              )}
            </Button>
          </div>

          <Card className="border-none shadow-sm overflow-hidden bg-transparent">
            <CardContent className="p-0">
              {filteredNotifications.length > 0 ? (
                <div className="divide-y border rounded-2xl overflow-hidden bg-card">
                  {filteredNotifications.map((notification) => {
                    const Icon = getIcon(notification.type);
                    return (
                      <div 
                        key={notification.id} 
                        className={cn(
                          "p-4 md:p-6 transition-all duration-300 group relative hover:bg-muted/10",
                          !notification.read ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                        )}
                      >
                        <div className="flex gap-4">
                          <div className={cn("p-3 rounded-2xl h-fit shadow-sm", getIconColor(notification.type))}>
                            <Icon className="h-6 w-6" />
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className={cn("font-black text-lg tracking-tight", !notification.read ? "text-primary" : "text-foreground/80")}>
                                {notification.title}
                              </h3>
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] font-black uppercase text-muted-foreground flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded">
                                  <Clock className="h-3 w-3" />
                                  {formatRelativeTime(notification.createdAt)}
                                </span>
                                {notification.urgent && !notification.read && (
                                  <Badge variant="destructive" className="animate-pulse text-[10px] font-black uppercase">Urgente</Badge>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center gap-4 pt-3">
                              {!notification.read && (
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="h-8 text-[10px] font-black uppercase tracking-widest"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  Marcar como lida
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-[10px] font-black uppercase tracking-widest text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
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
                <div className="flex flex-col items-center justify-center py-24 text-center bg-muted/10 rounded-2xl border border-dashed">
                  <div className="bg-background p-6 rounded-full mb-6 shadow-sm border">
                    <Bell className="h-12 w-12 text-muted-foreground/20" />
                  </div>
                  <h3 className="text-xl font-black text-foreground/80 tracking-tight">Nenhuma notificação encontrada</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mt-2 font-medium">
                    {filter === 'unread' 
                      ? "Você leu todas as suas notificações! Tudo em dia." 
                      : "Sua caixa de entrada está vazia no momento."}
                  </p>
                  {filter === 'unread' && notifications.length > 0 && (
                    <Button variant="outline" className="mt-6 font-bold" onClick={() => setFilter('all')}>
                      Ver notificações lidas
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-primary/5 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-black">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  Notificações por E-mail
                </CardTitle>
                <CardDescription className="font-medium">
                  Escolha quais alertas você deseja receber no seu e-mail cadastrado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">Vistorias</Label>
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
                    <Label className="text-base font-bold">Garantias</Label>
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
                    <Label className="text-base font-bold">Atualizações do Imóvel</Label>
                    <p className="text-sm text-muted-foreground">Novidades sobre as fases do seu imóvel.</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.email.updates} 
                    onCheckedChange={() => toggleSetting('email', 'updates')} 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">Lembretes</Label>
                    <p className="text-sm text-muted-foreground">Alertas de proximidade de datas e tarefas.</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.email.reminders} 
                    onCheckedChange={() => toggleSetting('email', 'reminders')} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-primary/5 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-black">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  Notificações por SMS
                </CardTitle>
                <CardDescription className="font-medium">
                  Receba alertas urgentes diretamente no seu celular.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">Vistorias</Label>
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
                    <Label className="text-base font-bold">Garantias</Label>
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
                    <Label className="text-base font-bold">Atualizações Urgentes</Label>
                    <p className="text-sm text-muted-foreground">Alertas críticos sobre seu imóvel.</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.sms.updates} 
                    onCheckedChange={() => toggleSetting('sms', 'updates')} 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">Lembretes</Label>
                    <p className="text-sm text-muted-foreground">Avisos urgentes de compromissos.</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.sms.reminders} 
                    onCheckedChange={() => toggleSetting('sms', 'reminders')} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={handleSaveSettings} size="lg" className="px-10 font-black uppercase tracking-widest shadow-lg">
              Salvar Preferências
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientNotifications;
