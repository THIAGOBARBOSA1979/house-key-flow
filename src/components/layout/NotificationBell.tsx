import { useState, useEffect } from "react";
import { Bell, Check, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { notificationService } from "@/services/core/NotificationService";
import { ClientNotification } from "@/types/clientFlow";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks";

export const NotificationBell = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getAll(user.company_id);
        setNotifications(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    // In a real app, we would set up a Supabase realtime subscription here
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar como lida.",
        variant: "destructive"
      });
    }
  };

  const handleClearAll = async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível limpar as notificações.",
        variant: "destructive"
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-card hover:bg-primary/5 active:scale-90 transition-all group border border-transparent hover:border-primary/10">
          <Bell size={20} className="text-muted-foreground group-hover:text-primary transition-all duration-slow group-hover:rotate-12" strokeWidth={2.5} />
          {unreadCount > 0 && (
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-status-critical rounded-full border-2 border-background animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 rounded-card border-none shadow-sem-xl bg-background/95 backdrop-blur-xl">
        <div className="flex items-center justify-between p-4 border-b border-border/10">
          <DropdownMenuLabel className="font-black uppercase tracking-widest text-[10px] text-muted-foreground p-0">
            Notificações ({unreadCount})
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearAll}
              className="h-7 text-[9px] font-black uppercase tracking-widest hover:text-primary p-0"
            >
              Limpar tudo
            </Button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={cn(
                  "p-4 border-b border-border/5 hover:bg-primary/5 transition-colors group relative",
                  !n.read && "bg-primary/[0.02]"
                )}
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4 className={cn("text-xs font-black tracking-tight leading-none", !n.read ? "text-foreground" : "text-muted-foreground")}>
                    {n.title}
                  </h4>
                  {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-0.5" />}
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2 font-medium">
                  {n.message}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.read && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-lg text-primary hover:bg-primary/10" 
                        onClick={() => handleMarkAsRead(n.id!)}
                      >
                        <Check size={12} />
                      </Button>
                    )}
                    {n.metadata?.url && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-lg text-muted-foreground hover:bg-muted/10"
                        onClick={() => window.open(n.metadata.url, '_blank')}
                      >
                        <ExternalLink size={12} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/20 mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                Nenhuma notificação
              </p>
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator className="m-0 bg-border/5" />
        <Button 
          variant="ghost" 
          className="w-full rounded-none rounded-b-card h-12 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
        >
          Ver histórico completo
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};