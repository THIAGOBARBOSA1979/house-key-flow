import { useState, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { 

  Home, 
  Building, 
  ClipboardCheck, 
  ShieldCheck, 
  Settings, 
  Menu, 
  Users, 
  Calendar, 
  User, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Layout,
  LogOut,
  Activity,
  Megaphone,
  Wrench,
  MessageSquare,
  FileSearch
} from "lucide-react";


import { SidebarGroup } from "./SidebarGroup";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile, useService } from "@/hooks";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { companyService } from "@/services";
import { AuthGuard } from "@/integrations/supabase/auth-guard";
import { useUserPreferences } from "@/hooks/core/useUserPreferences";



interface SidebarProps {
  className?: string;
  onCollapseChange?: (collapsed: boolean) => void;
}

const operationalItems = [
  { to: "/admin", icon: Home, label: "Painel Estratégico", end: true },
  { to: "/admin/calendar", icon: Calendar, label: "Cronograma Técnico" },
  { to: "/admin/inspections", icon: ClipboardCheck, label: "Vistorias Técnicas" },
  { to: "/admin/warranty", icon: ShieldCheck, label: "Assistência Técnica" },
  { to: "/admin/support", icon: MessageSquare, label: "Suporte Técnico" },
];

const managementItems = [
  { to: "/admin/properties", icon: Building, label: "Empreendimentos" },
  { to: "/admin/announcements", icon: Megaphone, label: "Comunicados" },
  { to: "/admin/ClientArea", icon: User, label: "Área do Cliente" },
  { to: "/admin/documents", icon: FileText, label: "Documentos" },
  { to: "/admin/users", icon: Users, label: "Usuários" },
  { to: "/admin/technicians", icon: Wrench, label: "Técnicos" },
];


const systemItems = [
  { to: "/admin/checklist", icon: ClipboardCheck, label: "Checklists", adminOnly: true },
  { to: "/admin/settings", icon: Settings, label: "Configurações", adminOnly: true },
  { to: "/admin/design-system", icon: Layout, label: "Design System", superAdminOnly: true },
  { to: "/admin/audit-logs", icon: FileSearch, label: "Auditoria Técnica", superAdminOnly: true },
  { to: "/admin/saas", icon: Building, label: "SaaS Admin", superAdminOnly: true },
];



const SidebarContent = memo(({ collapsed, onToggleCollapse, onItemClick }: { collapsed: boolean; onToggleCollapse?: () => void; onItemClick?: () => void }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { logout, user } = useAuth();
  
  // Load company data using useService for proper state management and sync
  const { items, isLoading: companyLoading } = useService(companyService);
  const companies = items as any[];
  const company = user?.company_id ? companies.find(c => c.id === user.company_id) : null;


  const toggleLanguage = () => {
    const nextLng = i18n.language === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(nextLng);
  };


  // Filter items based on user role and permissions
  const filterItems = (items: any[]) => items.filter(item => {
    if (item.superAdminOnly && !AuthGuard.isSuperAdmin()) return false;
    if (item.adminOnly && !AuthGuard.isAdmin() && !AuthGuard.isSuperAdmin()) return false;
    return true;
  });

  return (

    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center justify-center py-8 px-5 border-b border-sidebar-border/10">
        {!collapsed ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/60 flex items-center justify-center shadow-sem-xl overflow-hidden ring-4 ring-sidebar-primary/10 border border-white/10 group cursor-pointer hover:rotate-3 transition-transform">
               {company?.settings?.logo_url ? (
                 <img src={company.settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
               ) : (
                 <Building className="text-sidebar-primary-foreground h-8 w-8" />
               )}
            </div>
            <div className="text-center">
              <h1 className="text-xl font-black text-sidebar-foreground tracking-tighter uppercase truncate max-w-[180px] leading-tight">
                {company?.settings?.display_name || company?.name || "A2 GESTÃO"}
              </h1>
              <p className="text-[10px] font-black text-sidebar-primary uppercase tracking-[0.2em] mt-1 opacity-70">Enterprise v3.1</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-sem-lg animate-in fade-in zoom-in duration-500">
            <Building className="text-sidebar-primary-foreground h-5 w-5" />
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-5 py-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleLanguage}
            className="w-full rounded-xl text-[9px] font-black uppercase tracking-widest h-8 border border-sidebar-border/20 hover:bg-sidebar-accent/50 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-all"
          >
            {i18n.language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
          </Button>
        </div>
      )}

      
      <nav className="flex-1 overflow-y-auto py-4-sem px-3-sem space-y-4-sem scrollbar-none pb-20 md:pb-4">
        <SidebarGroup 
          title="Operacional" 
          items={filterItems(operationalItems)} 
          defaultOpen={true}
          collapsed={collapsed}
          onItemClick={onItemClick}
        />
        <SidebarGroup 
          title="Gestão" 
          items={filterItems(managementItems)}
          defaultOpen={true}
          collapsed={collapsed}
          onItemClick={onItemClick}
        />
        <SidebarGroup 
          title="Sistema" 
          items={filterItems(systemItems)}
          defaultOpen={false}
          collapsed={collapsed}
          onItemClick={onItemClick}
        />
      </nav>
      
      {!collapsed && (
        <div className="p-5 border-t border-sidebar-border/10 animate-fade-in bg-sidebar-accent/5 mt-auto relative">
          {onToggleCollapse && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleCollapse}
              className="absolute -top-5 right-5 h-10 w-10 rounded-full bg-sidebar-primary text-sidebar-primary-foreground shadow-sem-xl hover:scale-110 active:scale-90 transition-all z-10 border border-white/10"
              aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </Button>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 group cursor-pointer p-1 rounded-2xl hover:bg-white/5 transition-all" onClick={() => navigate(user?.role === 'admin' ? '/admin/profile' : '/client/profile')}>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/60 flex items-center justify-center text-sidebar-primary-foreground font-black shadow-sem-lg border border-white/10 shrink-0 group-hover:scale-110 transition-transform">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-sidebar-foreground truncate group-hover:text-primary transition-colors leading-tight">{user?.name || "Administrador"}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-complete animate-pulse" />
                  <p className="text-[9px] text-sidebar-foreground/40 truncate font-black uppercase tracking-widest">Sessão ativa</p>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-sidebar-foreground/20 hover:text-status-critical hover:bg-status-critical/10 rounded-2xl h-11 w-11 transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-status-critical"
              aria-label="Sair do sistema"
              onClick={logout}
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

export const Sidebar = memo(({ className, onCollapseChange }: SidebarProps) => {
  const { sidebarCollapsed, setSidebarCollapsed } = useUserPreferences();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleToggleCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    onCollapseChange?.(newState);
  };


  // Notify parent of initial state
  useEffect(() => {
    onCollapseChange?.(sidebarCollapsed);

  }, []);

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button 
            size="icon" 
            variant="ghost" 
            className="fixed left-4 top-3 z-modal lg:hidden shadow-md bg-background/80 backdrop-blur-md hover:bg-primary/10 text-primary border border-primary/20 rounded-xl h-10 w-10 flex items-center justify-center transition-all active:scale-90"
          >
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-sidebar bg-sidebar border-r-sidebar-border shadow-sem-xl">
          <SidebarContent collapsed={false} onItemClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div 
      className={cn(
        "fixed inset-y-0 left-0 z-sticky bg-sidebar flex flex-col transition-all duration-slow ease-spring border-r border-sidebar-border/10 shadow-sem-xl",
        sidebarCollapsed ? "w-sidebar-collapsed-width" : "w-sidebar-width",
        className
      )}
    >
      <SidebarContent 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={handleToggleCollapse} 
      />
    </div>
  );
});