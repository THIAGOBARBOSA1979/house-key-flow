import { useState, useEffect } from "react";
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
  DollarSign,
  Megaphone,
  Wrench,
  MessageSquare
} from "lucide-react";


import { SidebarGroup } from "./SidebarGroup";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { companyService } from "@/services";
import { AuthGuard } from "@/integration/supabase/auth-guard";


interface SidebarProps {
  className?: string;
  onCollapseChange?: (collapsed: boolean) => void;
}

const operationalItems = [
  { to: "/admin", icon: Home, label: "Dashboard", end: true },
  { to: "/admin/calendar", icon: Calendar, label: "Agendamentos" },
  { to: "/admin/inspections", icon: ClipboardCheck, label: "Vistorias" },
  { to: "/admin/warranty", icon: ShieldCheck, label: "Garantias" },
  { to: "/admin/support", icon: MessageSquare, label: "Suporte" },
  { to: "/admin/financial", icon: DollarSign, label: "Financeiro" },
];

const managementItems = [
  { to: "/admin/properties", icon: Building, label: "Empreendimentos" },
  { to: "/admin/announcements", icon: Megaphone, label: "Comunicados" },
  { to: "/admin/client-area", icon: User, label: "Área do Cliente" },
  { to: "/admin/documents", icon: FileText, label: "Documentos" },
  { to: "/admin/users", icon: Users, label: "Usuários" },
  { to: "/admin/technicians", icon: Wrench, label: "Técnicos" },
];


const systemItems = [
  { to: "/admin/checklist", icon: ClipboardCheck, label: "Checklists", adminOnly: true },
  { to: "/admin/settings", icon: Settings, label: "Configurações", adminOnly: true },
  { to: "/admin/design-system", icon: Layout, label: "Design System", superAdminOnly: true },
  { to: "/admin/audit-logs", icon: Activity, label: "Logs de Auditoria", superAdminOnly: true },
  { to: "/admin/saas", icon: Building, label: "SaaS Admin", superAdminOnly: true },
];



function SidebarContent({ collapsed, onToggleCollapse, onItemClick }: { collapsed: boolean; onToggleCollapse?: () => void; onItemClick?: () => void }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { logout, user } = useAuth();
  const company = user?.company_id ? companyService.getById(user.company_id, undefined, true) : null;


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
      <div className="flex items-center justify-between h-header-height px-5 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shadow-sem-md overflow-hidden">
               {company?.settings?.logo_url ? (
                 <img src={company.settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
               ) : (
                 <Building className="text-sidebar-primary-foreground h-5 w-5" />
               )}
            </div>
            <h1 className="text-h4 font-black text-sidebar-foreground tracking-tighter uppercase truncate max-w-[120px]">
              {company?.settings?.display_name || company?.name || "A2 GESTÃO"}
            </h1>
          </div>
        )}

        {onToggleCollapse && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleCollapse}
            className="text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-normal"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        )}
      </div>

      {!collapsed && (
        <div className="px-5 py-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleLanguage}
            className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest h-8 border-sidebar-border hover:bg-sidebar-accent"
          >
            {i18n.language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
          </Button>
        </div>
      )}

      
      <nav className="flex-1 overflow-y-auto py-4-sem px-3-sem space-y-4-sem scrollbar-none">
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
        <div className="p-4-sem border-t border-sidebar-border animate-fade-in bg-sidebar-accent/5 mt-auto">
          <div className="flex items-center justify-between gap-3-sem">
            <div className="flex items-center gap-3-sem min-w-0 group cursor-pointer p-1 rounded-xl hover:bg-white/5 transition-all" onClick={() => navigate(user?.role === 'admin' ? '/admin/profile' : '/client/profile')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sidebar-primary/20 to-sidebar-accent flex items-center justify-center text-sidebar-primary font-black shadow-sem-sm border border-sidebar-border shrink-0 group-hover:scale-110 transition-transform">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-sem-label font-bold text-sidebar-foreground truncate group-hover:text-primary transition-colors">{user?.name || "Administrador"}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-complete animate-pulse" />
                  <p className="text-sem-tiny text-sidebar-foreground/50 truncate font-black uppercase tracking-tighter">Sessão ativa</p>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-sidebar-foreground/40 hover:text-status-critical hover:bg-status-critical/10 rounded-xl h-10 w-10 transition-all active:scale-95"
              onClick={logout}
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export const Sidebar = ({ className, onCollapseChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange?.(newState);
  };

  // Notify parent of initial state
  useEffect(() => {
    onCollapseChange?.(isCollapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <SheetContent side="left" className="p-0 w-[280px] bg-sidebar border-r-sidebar-border shadow-sem-xl">
          <SidebarContent collapsed={false} onItemClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div 
      className={cn(
        "fixed inset-y-0 left-0 z-sticky bg-sidebar flex flex-col transition-all duration-normal ease-out-sem border-r border-sidebar-border",
        isCollapsed ? "w-sidebar-collapsed-width" : "w-sidebar-width",
        className
      )}
    >
      <SidebarContent 
        collapsed={isCollapsed} 
        onToggleCollapse={handleToggleCollapse} 
      />
    </div>
  );
};

