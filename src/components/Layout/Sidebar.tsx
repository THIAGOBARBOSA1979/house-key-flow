
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Building, 
  ClipboardCheck, 
  ShieldCheck, 
  Settings, 
  Menu, 
  X, 
  Users, 
  Calendar, 
  User, 
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { SidebarGroup } from "./SidebarGroup";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
}

// Menu items organized by groups
const operationalItems = [
  { to: "/admin", icon: Home, label: "Dashboard", end: true },
  { to: "/admin/calendar", icon: Calendar, label: "Agendamentos" },
  { to: "/admin/inspections", icon: ClipboardCheck, label: "Vistorias" },
  { to: "/admin/warranty", icon: ShieldCheck, label: "Garantias" },
];

const managementItems = [
  { to: "/admin/properties", icon: Building, label: "Empreendimentos" },
  { to: "/admin/client-area", icon: User, label: "Área do Cliente" },
  { to: "/admin/documents", icon: FileText, label: "Documentos" },
  { to: "/admin/users", icon: Users, label: "Usuários" },
];

const systemItems = [
  { to: "/admin/checklist", icon: ClipboardCheck, label: "Checklists" },
  { to: "/admin/settings", icon: Settings, label: "Configurações" },
];

function SidebarContent({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <h1 className="text-xl font-bold text-sidebar-foreground">A2 Imobiliária</h1>
        )}
        {onToggleCollapse && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleCollapse}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        )}
      </div>
      
      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
        <SidebarGroup 
          title="Operacional" 
          items={operationalItems} 
          defaultOpen={true}
          collapsed={collapsed}
        />
        <SidebarGroup 
          title="Gestão" 
          items={managementItems}
          defaultOpen={true}
          collapsed={collapsed}
        />
        <SidebarGroup 
          title="Sistema" 
          items={systemItems}
          defaultOpen={false}
          collapsed={collapsed}
        />
      </nav>
      
      {/* User profile */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">Admin</p>
              <p className="text-xs text-sidebar-foreground/70">admin@construtora.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const Sidebar = ({ className }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  // Mobile: Use Sheet
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button 
            size="icon" 
            variant="outline" 
            className="fixed left-4 top-4 z-50 lg:hidden"
          >
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar">
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop/Tablet: Fixed sidebar with collapse
  return (
    <div 
      className={cn(
        "fixed inset-y-0 left-0 z-40 bg-sidebar flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <SidebarContent 
        collapsed={isCollapsed} 
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
      />
    </div>
  );
};
