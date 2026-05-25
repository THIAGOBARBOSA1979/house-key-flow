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
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 transition-colors duration-slower bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background dark:from-primary/5 dark:via-background dark:to-background">
      <Sidebar 
        onCollapseChange={(collapsed) => {
          setSidebarCollapsed(collapsed);
        }} 
      />

      <div className={cn(
        "min-h-screen flex flex-col transition-all duration-slow ease-out-sem",
        !isMobile && sidebarWidthClass,
        isMobile && "pt-0 md:pt-header-height"
      )}>
        <header 
          className="border-b border-border/20 bg-background/60 backdrop-blur-xl sticky top-0 z-sticky h-header-height flex items-center shadow-sem-sm w-full transition-all duration-300"
        >
          <div className="w-full flex items-center justify-between px-header-padding-x lg:px-layout-gap-xl transition-all duration-slow max-w-container mx-auto">
            <div className="flex items-center gap-component-gap-md md:gap-stack-gap flex-1">
              <div className="hidden lg:flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/30 mr-6 group cursor-default">
                <HomeIcon size={14} className="group-hover:text-primary transition-all duration-slow" strokeWidth={3} />
                <ChevronRight size={12} className="opacity-40" strokeWidth={3} />
                <span className="group-hover:text-primary group-hover:tracking-[0.35em] transition-all duration-slow">Painel Estratégico</span>
              </div>

              {isMobile ? <div className="w-10" /> : (
                <GlobalSearch />
              )}
            </div>

            <div className="flex items-center gap-3 lg:gap-layout-gap-lg shrink-0">
              <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-2xl hover:bg-primary/5 active:scale-90 transition-all group border border-transparent hover:border-primary/10">
                <Bell size={20} className="text-muted-foreground group-hover:text-primary transition-all duration-slow group-hover:rotate-12" strokeWidth={2.5} />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-status-critical rounded-full border-2 border-background animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              </Button>

              <UserMenu 
                companyName={company?.settings?.display_name || company?.name || 'A2'} 
                onOpenShortcuts={() => setIsShortcutsOpen(true)} 
              />
            </div>
          </div>
        </header>
        
        <main 
          className="flex-1 p-layout-gap lg:p-layout-gap-lg transition-all duration-slow overflow-x-hidden w-full"
        >
          <div className="container-responsive max-w-container mx-auto min-h-[calc(100vh-20rem)]">
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
          className="mt-layout-gap-xl py-footer-padding-y px-footer-padding-x border-t border-border/20 transition-all duration-slow"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-layout-gap-lg max-w-container mx-auto">
            <div className="space-y-3 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 opacity-60">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-indigo-600 flex items-center justify-center text-brand-foreground font-black text-sm shadow-brand/20 shadow-lg">
                  A2
                </div>
                <span className="font-black tracking-tighter text-foreground text-xl italic">A2 Incorporadora</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 leading-relaxed">
                © {new Date().getFullYear()} A2 Gestão de Portfólio Estratégico.<br />
                Tecnologia de Alta Performance para o Setor Imobiliário.
              </p>
            </div>
            
            <div className="flex items-center gap-layout-gap-lg">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/20 mb-1">Status do Ecossistema</p>
                <div className="flex items-center gap-2 justify-end">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">Operacional</span>
                </div>
              </div>
            </div>
          </div>
        </footer>



      </div>

      <Dialog open={isShortcutsOpen} onOpenChange={setIsShortcutsOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-card border-none shadow-sem-xl">
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
                <Badge variant="outline" className="h-8 px-3 rounded-xl font-black bg-muted/20 border-border/50">{shortcut.key}</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <QuickLauncher />
    </div>
  );
};
