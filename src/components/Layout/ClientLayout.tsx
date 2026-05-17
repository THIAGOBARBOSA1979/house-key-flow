import { Outlet, Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Home, ClipboardCheck, ShieldCheck, Building, LogOut, Menu, X, User, Bell, MessageSquare, FileText, CalendarDays, DollarSign, HelpCircle, ChevronRight, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useClientStage } from "@/hooks/useClientStage";
import { useNotifications } from "@/hooks/useNotifications";
import { ScheduleMeetingDialog } from "@/components/ClientFlow/ScheduleMeetingDialog";
import { QuickLauncher } from "@/components/shared/QuickLauncher";

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
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        cn("flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all duration-slow group", 
        isActive ? "bg-primary text-primary-foreground font-black shadow-lg shadow-primary/30 active:scale-[0.98]" : "hover:bg-primary/5 text-muted-foreground hover:text-primary")
      } 
      {...props}
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <Icon size={20} className={cn("transition-all duration-normal group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} strokeWidth={isActive ? 2.5 : 2} />
            <span className={cn("text-sm tracking-tight", isActive ? "font-black" : "font-semibold")}>{children}</span>
          </div>
          <div className="flex items-center gap-2">
            {isActive ? (
              <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            ) : (
              typeof badgeCount === 'number' && badgeCount > 0 && (
                <Badge variant="secondary" className="bg-status-critical text-white border-none text-[10px] font-black h-5 min-w-[20px] flex justify-center items-center shadow-sm">
                  {badgeCount}
                </Badge>
              )
            )}
          </div>
        </>
      )}
    </NavLink>
  );
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
  return <div className="flex items-center justify-between h-20 px-6 border-b bg-background/80 backdrop-blur-xl sticky top-0 z-40 md:hidden">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="rounded-xl hover:bg-primary/10">
        <Menu size={24} className="text-primary" />
      </Button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black shadow-lg shadow-primary/20">
          A2
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black tracking-tight leading-none">Portal do Cliente</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">A2 Gestão</span>
        </div>
      </div>
      <div className="w-10"></div>
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
  const location = useLocation();
  const clientId = user?.id || "client-1";
  const { profile } = useClientStage(clientId);
  const { unreadCount, notifications, markAllAsRead } = useNotifications(clientId);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    }
  }, []);

  // Close sidebar on location change for mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

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
      <div className={cn("fixed inset-y-0 left-0 z-fixed w-sidebar-width bg-background border-r border-border/50 transform transition-all duration-slow ease-out-sem md:translate-x-0 shadow-sem-lg", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        {/* Sidebar header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-border/40">
          <Link to="/client" className="flex items-center gap-3" onClick={handleLinkClick}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black shadow-lg shadow-primary/20">
              A2
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight leading-none">Portal A2</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Exclusividade</span>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden rounded-lg" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </Button>
        </div>
        
        {/* User profile */}
        <div className="p-4">
          <Link to="/client/profile" onClick={handleLinkClick} className="flex items-center gap-4 p-3 rounded-2xl bg-muted/30 border border-border/10 hover:bg-primary/5 hover:border-primary/10 transition-all duration-300 group">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-primary/20 group-hover:border-primary transition-all duration-500 group-hover:scale-105">
                <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-xs">{user?.name?.substring(0, 2).toUpperCase() || "CL"}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-emerald-500 border-2 border-background rounded-full animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-foreground truncate group-hover:text-primary transition-colors">{user?.name || "Cliente"}</p>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest truncate mt-0.5">
                {profile?.unitNumber ? `Unidade ${profile.unitNumber}` : "Configurações"}
              </p>
            </div>
          </Link>
        </div>
        <div className="px-6 py-2">
           <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <ClientNavLink to="/client" icon={Home} onClick={handleLinkClick}>Início</ClientNavLink>
          <ClientNavLink to="/client/properties" icon={Building} onClick={handleLinkClick}>Meu Imóvel</ClientNavLink>
          <ClientNavLink to="/client/financial" icon={DollarSign} onClick={handleLinkClick}>Financeiro</ClientNavLink>
          <ClientNavLink to="/client/documents" icon={FileText} onClick={handleLinkClick}>Documentos</ClientNavLink>
          <ClientNavLink to="/client/inspections" icon={ClipboardCheck} onClick={handleLinkClick}>Vistorias</ClientNavLink>
          <ClientNavLink to="/client/warranty" icon={ShieldCheck} onClick={handleLinkClick}>Garantias</ClientNavLink>
          <ClientNavLink to="/client/notifications" icon={Bell} onClick={handleLinkClick} badgeCount={unreadCount}>Notificações</ClientNavLink>
          <ClientNavLink to="/client/profile" icon={User} onClick={handleLinkClick}>Meu Perfil</ClientNavLink>
          
          <Separator className="my-4" />
          
          <div className="px-3 py-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Suporte e ajuda</h4>
            <div className="space-y-1">
              <ClientNavLink to="/client/support" icon={HelpCircle} onClick={handleLinkClick}>Central de Ajuda</ClientNavLink>
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
              <ScheduleMeetingDialog />
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
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
      
      {/* Main content */}
      <div className="md:ml-sidebar-width min-h-screen flex flex-col">
        {/* Desktop header - simplified without images */}
        <header className="sticky top-0 z-30 hidden md:flex items-center justify-between h-20 px-6 lg:px-10 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sem-sm">
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight text-foreground/90">Área Exclusiva</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Portal do Cliente A2</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-11 w-11 rounded-2xl bg-muted/40 hover:bg-primary/5 hover:text-primary transition-all group">
              {theme === 'light' ? (
                <Moon size={20} className="text-muted-foreground group-hover:scale-110 transition-transform" />
              ) : (
                <Sun size={20} className="text-muted-foreground group-hover:scale-110 transition-transform" />
              )}
            </Button>

            {/* Notifications */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-2xl bg-muted/40 hover:bg-primary/5 hover:text-primary transition-all group">
                  <Bell size={20} className="text-muted-foreground group-hover:scale-110 transition-transform" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-status-critical text-[9px] font-black text-white flex items-center justify-center shadow-lg border-2 border-background animate-in zoom-in duration-300">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 border-l border-border/40 shadow-sem-xl rounded-l-[2.5rem]">
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
                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl bg-muted/40 hover:bg-primary/5 hover:text-primary transition-all group">
                  <MessageSquare size={20} className="text-muted-foreground group-hover:scale-110 transition-transform" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 border-l border-border/40 shadow-sem-xl rounded-l-[2.5rem]">
                <ChatSupportPanel />
              </SheetContent>
            </Sheet>
            
            <div className="h-8 w-px bg-border/40 mx-2" />

            <Link to="/client/profile" className="flex items-center gap-3 hover:bg-primary/5 p-1.5 rounded-2xl transition-all duration-300 group border border-transparent hover:border-primary/10">
              <Avatar className="h-10 w-10 border border-border/40 group-hover:border-primary/30 transition-all">
                <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">{user?.name?.substring(0, 2).toUpperCase() || "CL"}</AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col text-left leading-tight">
                <p className="text-sm font-black text-foreground/80 group-hover:text-primary transition-colors">{user?.name || "Cliente"}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Sessão Ativa</p>
              </div>
            </Link>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 p-5 md:p-10 transition-all duration-slow">
          <div className="container-responsive animate-in fade-in slide-in-from-bottom-4 duration-slower">
            <Outlet />
          </div>
        </main>
        
        {/* Footer */}
        <footer className="py-4 px-6 text-center border-t text-sm text-muted-foreground">
          &copy; 2025 A2 Incorporadora. Todos os direitos reservados.
        </footer>
      </div>
      <QuickLauncher />
    </div>;
};

export default ClientLayout;
