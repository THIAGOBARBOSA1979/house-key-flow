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
  { to: "/admin/inbox", icon: MessageSquare, label: "Inbox WhatsApp", adminOnly: true },
];

const managementItems = [
  { to: "/admin/properties", icon: Building, label: "Empreendimentos" },
  { to: "/admin/announcements", icon: Megaphone, label: "Comunicados" },
  { to: "/admin/ClientArea", icon: User, label: "Clientes" },
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
  
  const { items, isLoading: companyLoading } = useService(companyService);
  const companies = items as any[];
  const company = user?.company_id ? companies.find(c => c.id === user.company_id) : null;

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(nextLng);
  };

  const filterItems = (items: any[]) => items.filter(item => {
    if (item.superAdminOnly && !AuthGuard.isSuperAdmin()) return false;
    if (item.adminOnly && !AuthGuard.isAdmin() && !AuthGuard.isSuperAdmin()) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col items-center justify-center py-layout-gap-xl px-layout-gap border-b border-sidebar-border/5">
        {!collapsed ? (
          <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-700">
            <div className="relative group">
              <div className="absolute -inset-2 bg-sidebar-primary/20 rounded-xl blur-xl group-hover:bg-sidebar-primary/30 transition-all duration-700"></div>
              <div className="relative w-24 h-24 rounded-card bg-gradient-to-br from-sidebar-primary to-sidebar-primary/60 flex items-center justify-center shadow-sem-xl overflow-hidden ring-1 ring-white/20 border border-white/10 cursor-pointer hover:rotate-2 transition-all duration-slow">
                {company?.settings?.logo_url ? (
                  <img src={company.settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building className="text-sidebar-primary-foreground h-11 w-11" />
                )}
              </div>
            </div>
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-black text-sidebar-foreground tracking-tighter uppercase truncate max-w-[220px] leading-tight">
                {company?.settings?.display_name || company?.name || "A2 GESTÃO"}
              </h1>
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-sidebar-primary/10 border border-sidebar-primary/20 backdrop-blur-md shadow-inner">
                <span className="w-2 h-2 rounded-full bg-sidebar-primary animate-pulse shadow-[0_0_8px_rgba(var(--sidebar-primary),0.6)]" />
                <p className="text-[10px] font-black text-sidebar-primary uppercase tracking-[0.3em] opacity-90 leading-none">Enterprise Elite</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <div className="absolute -inset-1 bg-sidebar-primary/40 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-12 h-12 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-sem-lg animate-in fade-in zoom-in duration-500 hover:scale-110 transition-transform cursor-pointer">
              <Building className="text-sidebar-primary-foreground h-7 w-7" />
            </div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-layout-gap py-layout-gap-sm">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleLanguage}
            className="w-full rounded-xl text-[9px] font-black uppercase tracking-widest h-9 border-sidebar-border/20 hover:bg-sidebar-accent/50 text-sidebar-foreground/60 hover:text-sidebar-foreground transition-all backdrop-blur-sm"
          >
            {i18n.language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
          </Button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-4-sem space-y-2-sem scrollbar-hide pb-24">
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
        <div className="p-layout-gap border-t border-sidebar-border/5 animate-fade-in bg-sidebar-accent/5 mt-auto relative backdrop-blur-md">
          {onToggleCollapse && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleCollapse}
              className="absolute -top-6 right-6 h-12 w-12 rounded-full bg-sidebar-primary text-sidebar-primary-foreground shadow-sem-xl hover:scale-110 active:scale-90 transition-all z-10 border border-white/20"
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </Button>
          )}

          <div className="flex items-center justify-between gap-card-gap">
            <div className="flex items-center gap-card-gap min-w-0 group cursor-pointer p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300" onClick={() => navigate(user?.role === 'admin' ? '/admin/profile' : '/client/profile')}>
              <div className="relative">
                <div className="w-16 h-16 rounded-card bg-gradient-to-br from-sidebar-primary to-sidebar-primary/60 flex items-center justify-center text-sidebar-primary-foreground font-black text-xl shadow-sem-lg border border-white/10 shrink-0 group-hover:scale-105 transition-transform duration-slow">
                  {user?.name?.charAt(0) || "A"}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-status-complete border-2 border-sidebar-background rounded-full shadow-lg"></div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-sidebar-foreground truncate group-hover:text-sidebar-primary transition-colors leading-tight">
                  {user?.name || "Administrador"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-[10px] text-sidebar-foreground/40 truncate font-black uppercase tracking-[0.2em] leading-none">Online</p>
                </div>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="text-sidebar-foreground/30 hover:text-status-critical hover:bg-status-critical/10 rounded-xl h-12 w-12 transition-all active:scale-90 border border-transparent hover:border-status-critical/20"
              aria-label="Sair"
              onClick={logout}
            >
              <LogOut size={22} />
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
