
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

  const sidebarWidthClass = sidebarCollapsed ? "pl-sidebar-collapsed-width" : "pl-sidebar-width";

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/10">
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      <div className={cn(
        "min-h-screen flex flex-col transition-all duration-normal ease-out-sem",
        !isMobile && sidebarWidthClass
      )}>
        {/* Header - Top bar */}
        <header 
          className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-sticky h-header-height flex items-center shadow-sem-sm"
        >
          <div className="w-full flex items-center justify-between px-4-sem sm:px-6-sem transition-all duration-normal">
            <div className="flex items-center gap-4-sem">
              {isMobile && <div className="w-10-sem" />}
            </div>

            <div className="flex items-center gap-3-sem">
              <Button variant="ghost" size="icon" className="relative h-9-sem w-9-sem rounded-lg hover:bg-primary/5 active:scale-95 transition-all">
                <Bell size={18} className="text-muted-foreground" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-status-critical rounded-full border-2 border-background" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10-sem rounded-lg gap-2 pl-2 pr-3 hover:bg-primary/5 group active:scale-95 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase group-hover:bg-primary group-hover:text-white transition-all">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
                      <span className="text-sem-body-sm font-bold truncate max-w-[120px]">{user?.name}</span>
                      <span className="text-sem-tiny text-muted-foreground uppercase font-bold tracking-tighter">Administrador</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 animate-in zoom-in-95 duration-normal shadow-sem-lg">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1-sem py-1-sem">
                      <p className="text-sem-body-sm font-bold leading-none">{user?.name}</p>
                      <p className="text-sem-tiny text-muted-foreground truncate">{user?.email}</p>
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
          className="flex-1 p-4-sem md:p-6-sem lg:p-8-sem transition-all duration-normal animate-fade-in"
        >
          <div className="container-responsive">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer 
          className="py-6-sem px-8-sem border-t border-border/50 text-center transition-all duration-normal"
        >
          <p className="text-sem-tiny uppercase font-bold tracking-widest text-muted-foreground/60">&copy; 2026 A2 Gestão de Propriedades • v2.8.5</p>
        </footer>
      </div>
    </div>
  );
};
