
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Breadcrumbs } from "./Breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Main Application Layout refactored with Design System tokens.
 */
export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed ? "64px" : "256px";

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/10">
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      <div className="min-h-screen flex flex-col transition-all duration-300">
        {/* Header - Top bar */}
        <header 
          className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-sticky h-16 flex items-center shadow-sm"
        >
          <div 
            className="w-full flex items-center justify-between px-4 sm:px-6 transition-all duration-300"
            style={{ marginLeft: isMobile ? 0 : sidebarWidth }}
          >
            <div className="flex items-center gap-4">
              {isMobile && <div className="w-10" />}
              <Breadcrumbs />
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-primary/5 active:scale-95">
                <Bell size={18} className="text-muted-foreground" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-status-critical rounded-full border-2 border-background" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 rounded-xl gap-2 pl-2 pr-3 hover:bg-primary/5 group active:scale-95">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase group-hover:bg-primary group-hover:text-white transition-all">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
                      <span className="text-xs font-bold truncate max-w-[120px]">{user?.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Administrador</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 animate-in zoom-in-95 duration-200">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1 py-1">
                      <p className="text-sm font-bold leading-none">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="py-2.5 font-medium cursor-pointer">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="py-2.5 font-bold text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair do Sistema</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main 
          className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 animate-fade-in"
          style={{ marginLeft: isMobile ? 0 : sidebarWidth }}
        >
          {children}
        </main>

        {/* Footer */}
        <footer 
          className="py-6 px-8 border-t border-border/50 text-center transition-all duration-300"
          style={{ marginLeft: isMobile ? 0 : sidebarWidth }}
        >
          <p className="text-tiny">&copy; 2026 A2 Gestão de Propriedades • v2.4.0</p>
        </footer>
      </div>
    </div>
  );
};

