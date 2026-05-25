import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Bell, ChevronRight, Home as HomeIcon, Keyboard } from "lucide-react";
import { useIsMobile } from "@/hooks";
import { cn } from "@/lib/utils";
import { companyService } from "@/services";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { QuickLauncher } from "@/components/shared/QuickLauncher";
import { useUserPreferences } from "@/hooks/core/useUserPreferences";
import { motion, AnimatePresence } from "framer-motion";
import { GlobalSearch } from "./GlobalSearch";
import { UserMenu } from "./UserMenu";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useUserPreferences();

  const [company, setCompany] = useState<any>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  useEffect(() => {
    if (user?.company_id) {
      companyService.getById(user.company_id, undefined, true).then(setCompany);
    }
  }, [user]);

  const sidebarWidthClass = sidebarCollapsed ? "md:pl-sidebar-collapsed-width" : "md:pl-sidebar-width";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 transition-colors duration-slower">
      <Sidebar 
        onCollapseChange={(collapsed) => {
          setSidebarCollapsed(collapsed);
        }} 
      />

      <div className={cn(
        "min-h-screen flex flex-col transition-all duration-slow ease-out-sem",
        !isMobile && sidebarWidthClass,
        isMobile && "pt-0 md:pt-16"
      )}>
        <header 
          className="border-b border-border/5 bg-background/40 backdrop-blur-3xl sticky top-0 z-sticky h-header-height flex items-center shadow-sem-sm w-full transition-all duration-300"
        >


          <div className="w-full flex items-center justify-between px-4 lg:px-8 transition-all duration-slow max-w-[1600px] mx-auto">
            <div className="flex items-center gap-2 md:gap-4 flex-1">
              <div className="hidden lg:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/40 mr-4 group cursor-default">
                <HomeIcon size={14} className="group-hover:text-primary transition-colors" />
                <ChevronRight size={12} />
                <span className="text-primary/60 group-hover:text-primary transition-colors">Painel Administrativo</span>
              </div>

              {isMobile ? <div className="w-10" /> : (
                <GlobalSearch />
              )}
            </div>

            <div className="flex items-center gap-2 lg:gap-6 shrink-0">
              <Button variant="ghost" size="icon" className="relative h-10 w-10 lg:h-11 lg:w-11 rounded-2xl hover:bg-primary/5 active:scale-90 transition-all group">
                <Bell size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-status-critical rounded-full border-2 border-background animate-pulse" />
              </Button>

              <UserMenu 
                companyName={company?.settings?.display_name || company?.name || 'A2'} 
                onOpenShortcuts={() => setIsShortcutsOpen(true)} 
              />
            </div>
          </div>
        </header>
        
        <main 
          className="flex-1 p-[var(--content-padding)] transition-all duration-slow overflow-x-hidden w-full"
        >
          <div className="container-responsive">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {children || <Outlet />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <footer 
          className="py-12 px-10 border-t border-border/10 text-center transition-all duration-slow bg-muted/[0.02] backdrop-blur-sm"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 max-w-7xl mx-auto">
            <div className="flex flex-col lg:items-start items-center gap-2">
              <p className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground/30">
                A2 Gestão de Propriedades • Enterprise Suite 2026
              </p>
              <p className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-widest">Tecnologia para Incorporadoras de Alta Performance</p>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-[9px] font-black text-primary/30 uppercase tracking-widest">Versão 3.1.2 STABLE</span>
              <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
            </div>
          </div>
        </footer>


      </div>

      <Dialog open={isShortcutsOpen} onOpenChange={setIsShortcutsOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-sem-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Keyboard className="text-primary" />
              Atalhos de Teclado
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {[
              { key: 'Ctrl + K', desc: 'Abrir Busca Global' },
              { key: 'Ctrl + /', desc: 'Ver Atalhos' },
              { key: 'Esc', desc: 'Fechar Modais e Menus' },
              { key: 'Alt + D', desc: 'Ir para Dashboard' },
              { key: 'Alt + P', desc: 'Ir para Empreendimentos' },
              { key: 'Alt + G', desc: 'Ir para Garantias' }
            ].map(shortcut => (
              <div key={shortcut.key} className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{shortcut.desc}</span>
                <Badge variant="outline" className="h-8 px-3 rounded-2xl font-black bg-muted/20 border-border/50">{shortcut.key}</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <QuickLauncher />
    </div>
  );
};
