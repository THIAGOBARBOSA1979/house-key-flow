import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 transition-colors duration-slower">
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      <div className={cn(
        "min-h-screen flex flex-col transition-all duration-slow ease-out-sem",
        !isMobile && sidebarWidthClass
      )}>
        {/* Header - Top bar */}
        <header 
          className="border-b-border/40 bg-background/80 backdrop-blur-2xl sticky top-0 z-sticky h-header-height flex items-center shadow-sem-sm"
        >
          <div className="w-full flex items-center justify-between px-6 md:px-10 transition-all duration-slow">
            <div className="flex items-center gap-6">
              {isMobile && <div className="w-10" />}
              {!isMobile && (
                <div className="hidden lg:flex items-center gap-2 bg-muted/20 px-3 py-1.5 rounded-xl border border-border/10 text-muted-foreground">
                  <Search size={14} className="opacity-50" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Pressione / para buscar</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-2xl hover:bg-primary/5 active:scale-90 transition-all group">
                <Bell size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-status-critical rounded-full border-2 border-background animate-pulse" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-12 rounded-2xl gap-3 pl-2 pr-4 hover:bg-primary/5 group active:scale-95 transition-all border border-transparent hover:border-primary/10">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center font-black text-xs uppercase group-hover:scale-105 transition-all">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-tight gap-0">
                      <span className="text-sem-label font-black truncate max-w-[140px] tracking-tight">{user?.name}</span>
                      <span className="text-[9px] text-muted-foreground/40 uppercase font-black tracking-widest">Master Admin</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 mt-4 animate-in zoom-in-95 slide-in-from-top-2 duration-slow shadow-sem-xl rounded-2xl border-none">
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sem-body-sm font-black leading-none">{user?.name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="mx-2 bg-border/40" />
                  <DropdownMenuItem className="py-3 px-4 rounded-xl font-bold cursor-pointer focus:bg-primary/5 focus:text-primary transition-all">
                    <User className="mr-3 h-4 w-4 opacity-50" />
                    <span className="text-sem-body-sm">Perfil do Sistema</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-2 bg-border/40" />
                  <DropdownMenuItem onClick={logout} className="py-3 px-4 rounded-xl font-black text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer transition-all">
                    <LogOut className="mr-3 h-4 w-4 opacity-50" />
                    <span className="text-sem-body-sm uppercase tracking-widest">Sair com segurança</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main 
          className="flex-1 p-6 md:p-10 transition-all duration-slow"
        >
          <div className="container-responsive animate-in fade-in slide-in-from-bottom-4 duration-slower">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer 
          className="py-10 px-10 border-t border-border/20 text-center transition-all duration-slow bg-muted/5 backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto">
            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground/30">
              A2 Gestão de Propriedades • Enterprise Suite 2026
            </p>
            <div className="flex items-center gap-6">
              <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Versão 3.1.2 STABLE</span>
              <div className="h-1 w-8 bg-primary/20 rounded-full" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
