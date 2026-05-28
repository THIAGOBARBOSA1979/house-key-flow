import { Outlet, Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  Home, Building, LogOut, Menu, X, User, Bell, 
  MessageSquare, FileText, ClipboardCheck, ShieldCheck, 
  HelpCircle, ChevronRight, Moon, Sun, Settings, LayoutDashboard, Receipt, Wrench, Search 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Breadcrumbs } from "./Breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { useClientStage, useNotifications } from "@/hooks";
import { useCompany } from "@/hooks/core/useCompany";
import { ClientCommandPalette } from "./ClientCommandPalette";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const ClientNavLink = ({
  to,
  icon: Icon,
  children,
  badgeCount,
}: {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  badgeCount?: number;
}) => {
  return (
    <NavLink 
      to={to} 
      end={to === "/client"}
      className={({ isActive }) => 
        cn(
          "flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden", 
          isActive 
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
            : "hover:bg-primary/5 text-muted-foreground hover:text-primary"
        )
      } 
    >
      <div className="flex items-center gap-4 relative z-10">
        <Icon size={20} className="transition-transform group-hover:scale-110" strokeWidth={2.5} />
        <span className="text-sm font-black uppercase tracking-widest">{children}</span>
      </div>
      {badgeCount !== undefined && badgeCount > 0 && (
        <Badge className="bg-destructive text-destructive-foreground border-none font-black text-[10px] h-5 min-w-[20px] rounded-full">
          {badgeCount}
        </Badge>
      )}
    </NavLink>
  );
};

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const clientId = user?.id || "client-1";
  const { profile, allProfiles, selectedProfileId, setSelectedProfileId } = useClientStage(clientId);
  const { unreadCount } = useNotifications(clientId);
  const { company } = useCompany();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Header Mobile - Enhanced with modern branding */}
      <div className="lg:hidden h-20 px-6 flex items-center justify-between border-b bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          {company?.settings?.logo_url ? (
            <img src={company.settings.logo_url} alt={company.settings.display_name || "Logo"} className="h-10 w-auto object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
              {company?.settings?.display_name?.substring(0, 2).toUpperCase() || "A2"}
            </div>
          )}
          <span className="font-black tracking-tighter text-lg uppercase text-foreground">
            {company?.settings?.display_name || "Portal"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ClientCommandPalette />
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="rounded-xl">
            <Menu size={24} className="text-primary" />
          </Button>
        </div>
      </div>

      {/* Desktop Search Header Overlay - Modern floating look */}
      <div className="hidden lg:flex fixed top-8 left-[352px] right-12 z-40 items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <ClientCommandPalette />
        </div>
        <div className="flex items-center gap-4 pointer-events-auto">
          <Button variant="ghost" size="icon" className="bg-white/80 backdrop-blur-md border border-border/10 rounded-xl h-10 w-10 shadow-sm relative">
             <Bell size={20} className="text-muted-foreground" />
             {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full animate-pulse" />}
          </Button>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-border/40 transition-transform duration-500 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-layout-gap pt-layout-gap-lg">
          <div className="flex items-center justify-between mb-layout-gap-lg">
            <Link to="/client" className="flex items-center gap-4 group">
              {company?.settings?.logo_url ? (
                <img src={company.settings.logo_url} alt={company.settings.display_name || "Logo"} className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
                  {company?.settings?.display_name?.substring(0, 2).toUpperCase() || "A2"}
                </div>
              )}
              <div>
                <span className="block font-black tracking-tighter text-xl leading-none uppercase truncate max-w-[150px]">
                  {company?.settings?.display_name || "PORTAL"}
                </span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Exclusividade</span>
              </div>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden rounded-xl" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </Button>
          </div>

          <div className="mb-10 space-y-4">
            {allProfiles.length > 1 ? (
              <div className="px-4 py-3 rounded-3xl bg-primary/5 border border-primary/10">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2 px-1">Alternar Unidade</p>
                <Select value={selectedProfileId || undefined} onValueChange={setSelectedProfileId}>
                  <SelectTrigger className="bg-white border-none shadow-sm rounded-2xl h-11 text-xs font-bold">
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    {allProfiles.map(p => (
                      <SelectItem key={p.id} value={p.id} className="text-xs font-bold py-3">
                        {p.propertyName} - {p.unitNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <Link to="/client/profile" className="flex items-center gap-4 p-4 rounded-3xl bg-muted/30 border border-border/5 hover:bg-primary/5 hover:border-primary/20 transition-all group">
              <Avatar className="h-12 w-12 border-2 border-primary/10 group-hover:border-primary transition-all">
                <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-xs">
                  {user?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm truncate group-hover:text-primary transition-colors">{user?.name}</p>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">{profile?.unitNumber ? `Unidade ${profile.unitNumber}` : "Proprietário"}</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar py-2">
            <ClientNavLink to="/client" icon={LayoutDashboard}>Resumo</ClientNavLink>
            <ClientNavLink to="/client/properties" icon={Building}>Meu Imóvel</ClientNavLink>
            <ClientNavLink to="/client/financial" icon={Receipt}>Financeiro</ClientNavLink>
            <ClientNavLink to="/client/documents" icon={FileText}>Documentos</ClientNavLink>
            <ClientNavLink to="/client/inspections" icon={ClipboardCheck}>Vistorias</ClientNavLink>
            <ClientNavLink to="/client/warranty" icon={ShieldCheck}>Garantias</ClientNavLink>
            <ClientNavLink to="/client/maintenance" icon={Wrench}>Manutenção</ClientNavLink>
            <ClientNavLink to="/client/notifications" icon={Bell} badgeCount={unreadCount}>Radar</ClientNavLink>
            <ClientNavLink to="/client/support" icon={HelpCircle}>Suporte</ClientNavLink>
          </nav>

          <div className="pt-layout-gap mt-layout-gap border-t layout-stack">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-4 rounded-2xl h-14 text-destructive hover:bg-destructive/5 font-black uppercase tracking-widest text-[10px]"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              Sair da Sessão
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-80 min-h-screen relative overflow-x-hidden">
        <div className="p-4 sm:p-layout-gap-lg lg:p-layout-gap-xl max-w-[1600px] mx-auto">
          <div className="mb-4 sm:mb-8">
            <Breadcrumbs />
          </div>
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation Mobile - Concierge experience */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] z-50 flex items-center justify-around px-4 shadow-2xl">
        <NavLink to="/client" end className={({ isActive }) => cn("flex flex-col items-center gap-1 transition-all", isActive ? "text-primary scale-110" : "text-white/40")}>
          <Home size={20} strokeWidth={2.5} />
          <span className="text-[8px] font-black uppercase tracking-widest">Início</span>
        </NavLink>
        <NavLink to="/client/notifications" className={({ isActive }) => cn("flex flex-col items-center gap-1 transition-all relative", isActive ? "text-primary scale-110" : "text-white/40")}>
          <Bell size={20} strokeWidth={2.5} />
          {unreadCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />}
          <span className="text-[8px] font-black uppercase tracking-widest">Radar</span>
        </NavLink>
        <div className="-mt-10">
           <ClientCommandPalette trigger={
             <div className="p-4 bg-primary rounded-2xl shadow-lg shadow-primary/40 border-4 border-white text-white">
               <Search size={24} strokeWidth={3} />
             </div>
           } />
        </div>
        <NavLink to="/client/support" className={({ isActive }) => cn("flex flex-col items-center gap-1 transition-all", isActive ? "text-primary scale-110" : "text-white/40")}>
          <MessageSquare size={20} strokeWidth={2.5} />
          <span className="text-[8px] font-black uppercase tracking-widest">Suporte</span>
        </NavLink>
        <NavLink to="/client/profile" className={({ isActive }) => cn("flex flex-col items-center gap-1 transition-all", isActive ? "text-primary scale-110" : "text-white/40")}>
          <User size={20} strokeWidth={2.5} />
          <span className="text-[8px] font-black uppercase tracking-widest">Perfil</span>
        </NavLink>
      </div>

      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ClientLayout;
