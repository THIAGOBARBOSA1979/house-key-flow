import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Home, ClipboardCheck, ShieldCheck, Building, LogOut, Menu, X, User, Bell, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useClientStage } from "@/hooks/useClientStage";
import { useNotifications } from "@/hooks/useNotifications";

const ClientNavLink = ({
  to,
  icon: Icon,
  children,
  badgeCount,
  ...props
}: {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  badgeCount?: number;
  [key: string]: any;
}) => {
  return <NavLink to={to} className={({
    isActive
  }) => cn("flex items-center justify-between gap-3 px-3 py-3 rounded-md transition-colors", isActive ? "bg-primary/90 text-primary-foreground font-medium" : "hover:bg-primary/10 text-foreground/80 hover:text-foreground")} {...props}>
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <span>{children}</span>
      </div>
      {typeof badgeCount === 'number' && badgeCount > 0 && <Badge variant="secondary" className="ml-auto">{badgeCount}</Badge>}
    </NavLink>;
};

const NotificationPanel = ({ 
  notifications, 
  unreadCount, 
  markAllAsRead 
}: { 
  notifications: any[]; 
  unreadCount: number; 
  markAllAsRead: () => void;
}) => {
  return <div className="w-[380px] max-h-[80vh] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium text-lg">Notificações</h3>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" className="text-xs" onClick={markAllAsRead}>
            Marcar todas como lidas
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-auto">
        {notifications.length > 0 ? <div className="divide-y">
            {notifications.map(notification => <div key={notification.id} className={cn("p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-0", !notification.read && "bg-primary/5 border-l-2 border-primary")}>
                <div className="flex items-start justify-between gap-2">
                  <h4 className={cn("font-bold text-sm leading-tight", !notification.read ? "text-primary" : "text-foreground")}>
                    {notification.title}
                  </h4>
                  <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground shrink-0 mt-0.5">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs mt-1.5 text-muted-foreground leading-relaxed line-clamp-2">{notification.message}</p>
              </div>)}
          </div> : <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Você não tem notificações</p>
          </div>}
      </div>
      
      <div className="p-3 border-t">
        <Link to="/client/notifications">
          <Button variant="outline" size="sm" className="w-full">
            Ver todas notificações
          </Button>
        </Link>
      </div>
    </div>;
};

const ChatSupportPanel = () => {
  const [message, setMessage] = useState("");
  const {
    toast
  } = useToast();
  const handleSend = () => {
    if (message.trim()) {
      toast({
        description: "Mensagem enviada com sucesso"
      });
      setMessage("");
    }
  };
  return <div className="w-[380px] h-[500px] flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Suporte" />
          <AvatarFallback>A2</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">Suporte A2 Imobiliária</h3>
          <p className="text-xs text-muted-foreground">Tempo médio de resposta: 15 minutos</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="flex justify-start">
          <div className="bg-muted rounded-lg rounded-tl-none p-3 max-w-[80%]">
            <p className="text-sm">Olá! Como posso ajudar você com seu imóvel hoje?</p>
            <span className="text-xs text-muted-foreground mt-1 block">10:30</span>
          </div>
        </div>
        
        <div className="flex justify-end">
          <div className="bg-primary text-primary-foreground rounded-lg rounded-tr-none p-3 max-w-[80%]">
            <p className="text-sm">Tenho dúvidas sobre o prazo de garantia do meu imóvel.</p>
            <span className="text-xs text-primary-foreground/70 mt-1 block">10:32</span>
          </div>
        </div>
        
        <div className="flex justify-start">
          <div className="bg-muted rounded-lg rounded-tl-none p-3 max-w-[80%]">
            <p className="text-sm">Claro! A garantia estrutural é de 5 anos, sistemas hidráulicos e elétricos de 2 anos, e acabamentos de 1 ano. Posso enviar o manual completo de garantias se preferir.</p>
            <span className="text-xs text-muted-foreground mt-1 block">10:35</span>
          </div>
        </div>
      </div>
      
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Digite sua mensagem..." onKeyPress={e => e.key === 'Enter' && handleSend()} />
          <Button onClick={handleSend} type="button">Enviar</Button>
        </div>
      </div>
    </div>;
};

// Helper component for the mobile header
const MobileHeader = ({
  onToggleSidebar
}: {
  onToggleSidebar: () => void;
}) => {
  return <div className="flex items-center justify-between h-16 px-4 border-b md:hidden">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
        <Menu size={20} />
      </Button>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
          A2
        </div>
        <span className="text-lg font-semibold">Portal do Cliente</span>
      </div>
      <div className="w-8"></div> {/* Spacer for centering */}
    </div>;
};

// Input component
const Input = ({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  return <input className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
};

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const clientId = user?.id || "client-1";
  const { profile } = useClientStage(clientId);
  const { unreadCount, notifications, markAllAsRead } = useNotifications(clientId);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Check if the screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Close the sidebar when a link is clicked on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  return <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <MobileHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Sidebar for desktop and mobile */}
      <div className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out md:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link to="/client" className="flex items-center gap-2" onClick={handleLinkClick}>
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
              A2
            </div>
            <span className="text-xl font-semibold">Portal do Cliente</span>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </Button>
        </div>
        
        {/* User profile */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "CL"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name || "Cliente"}</p>
              <p className="text-xs text-muted-foreground">
                {profile?.propertyName ? `${profile.propertyName} - Unidade ${profile.unitNumber}` : "Carregando..."}
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <ClientNavLink to="/client" icon={Home} onClick={handleLinkClick}>Início</ClientNavLink>
          <ClientNavLink to="/client/properties" icon={Building} onClick={handleLinkClick}>Meu Imóvel</ClientNavLink>
          <ClientNavLink to="/client/documents" icon={FileText} onClick={handleLinkClick}>Documentos</ClientNavLink>
          <ClientNavLink to="/client/inspections" icon={ClipboardCheck} onClick={handleLinkClick}>Vistorias</ClientNavLink>
          <ClientNavLink to="/client/warranty" icon={ShieldCheck} onClick={handleLinkClick}>Garantias</ClientNavLink>
          <ClientNavLink to="/client/notifications" icon={Bell} onClick={handleLinkClick} badgeCount={unreadCount}>Notificações</ClientNavLink>
          
          <Separator className="my-4" />
          
          <div className="px-3 py-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Suporte e ajuda</h4>
            <div className="space-y-1">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full justify-start" onClick={handleLinkClick}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Falar com suporte
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0">
                  <ChatSupportPanel />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
        
        {/* User controls */}
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
      
      {/* Backdrop overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
      
      {/* Main content */}
      <div className="md:ml-64 min-h-screen flex flex-col">
        {/* Desktop header - simplified without images */}
        <header className="sticky top-0 z-30 hidden md:flex items-center justify-between h-16 px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h1 className="text-xl font-semibold">Portal do Cliente</h1>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0">
                <NotificationPanel 
                  notifications={notifications} 
                  unreadCount={unreadCount} 
                  markAllAsRead={markAllAsRead} 
                />
              </SheetContent>
            </Sheet>
            
            {/* Chat support */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <MessageSquare size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0">
                <ChatSupportPanel />
              </SheetContent>
            </Sheet>
            
            {/* User menu */}
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "CL"}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user?.name || "Cliente"}</p>
                <p className="text-xs text-muted-foreground">Cliente</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
        
        {/* Footer */}
        <footer className="py-4 px-6 text-center border-t text-sm text-muted-foreground">
          &copy; 2025 A2 Incorporadora. Todos os direitos reservados.
        </footer>
      </div>
    </div>;
};

export default ClientLayout;
