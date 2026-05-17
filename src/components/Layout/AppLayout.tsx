import { useState, useEffect, useCallback, useMemo } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Bell, Search, X, Building, Users, FileText, ChevronRight, Home as HomeIcon, Keyboard } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { propertyService } from "@/services/PropertyService";
import { userService } from "@/services/UserService";
import { documentService } from "@/services/DocumentService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Main Application Layout refactored with Design System tokens.
 */
export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const sidebarWidthClass = sidebarCollapsed ? "pl-sidebar-collapsed-width" : "pl-sidebar-width";

  // Global search logic
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return { properties: [], users: [], documents: [] };
    
    const query = searchQuery.toLowerCase();
    return {
      properties: propertyService.getAll().filter(p => p.name.toLowerCase().includes(query)).slice(0, 3),
      users: userService.getAll().filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)).slice(0, 3),
      documents: documentService.searchDocuments(searchQuery, {}).slice(0, 3)
    };
  }, [searchQuery]);

  const hasResults = searchResults.properties.length > 0 || searchResults.users.length > 0 || searchResults.documents.length > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsShortcutsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
          <div className="w-full flex items-center justify-between px-6 md:px-8 transition-all duration-slow">
            <div className="flex items-center gap-4 flex-1">
              <div className="hidden lg:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/40 mr-4">
                <HomeIcon size={14} />
                <ChevronRight size={12} />
                <span className="text-primary/60">Painel Administrativo</span>
              </div>

              {isMobile ? <div className="w-10" /> : (
                <div className="relative max-w-md w-full group hidden md:block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all" />
                  <Input
                    placeholder="Busca global... (Ctrl+K)"
                    className="pl-11 h-11 bg-muted/20 border-none rounded-xl font-bold placeholder:font-medium transition-all focus-visible:ring-primary/20 w-full"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (e.target.value.length >= 2) setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                  />
                  
                  {isSearchOpen && (
                    <>
                      <div className="fixed inset-0 z-[-1]" onClick={() => setIsSearchOpen(false)} />
                      <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-card rounded-2xl shadow-sem-xl border border-border/40 animate-in fade-in zoom-in-95 duration-200">
                        <ScrollArea className="max-h-[400px]">
                          {hasResults ? (
                            <div className="p-2 space-y-4">
                              {searchResults.properties.length > 0 && (
                                <div>
                                  <p className="px-3 text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest mb-2 flex items-center gap-2">
                                    <Building size={12} /> Empreendimentos
                                  </p>
                                  {searchResults.properties.map(p => (
                                    <button 
                                      key={p.id}
                                      onClick={() => { navigate('/admin/properties'); setIsSearchOpen(false); }}
                                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 group transition-all"
                                    >
                                      <span className="font-bold text-sm text-foreground/80 group-hover:text-primary">{p.name}</span>
                                      <ChevronRight size={14} className="text-muted-foreground/40 group-hover:translate-x-1 transition-all" />
                                    </button>
                                  ))}
                                </div>
                              )}
                              {searchResults.users.length > 0 && (
                                <div>
                                  <p className="px-3 text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest mb-2 flex items-center gap-2">
                                    <Users size={12} /> Usuários
                                  </p>
                                  {searchResults.users.map(u => (
                                    <button 
                                      key={u.id}
                                      onClick={() => { navigate('/admin/users'); setIsSearchOpen(false); }}
                                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 group transition-all"
                                    >
                                      <div className="text-left">
                                        <p className="font-bold text-sm text-foreground/80 group-hover:text-primary">{u.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{u.email}</p>
                                      </div>
                                      <ChevronRight size={14} className="text-muted-foreground/40 group-hover:translate-x-1 transition-all" />
                                    </button>
                                  ))}
                                </div>
                              )}
                              {searchResults.documents.length > 0 && (
                                <div>
                                  <p className="px-3 text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest mb-2 flex items-center gap-2">
                                    <FileText size={12} /> Documentos
                                  </p>
                                  {searchResults.documents.map(d => (
                                    <button 
                                      key={d.id}
                                      onClick={() => { navigate('/admin/documents'); setIsSearchOpen(false); }}
                                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 group transition-all"
                                    >
                                      <span className="font-bold text-sm text-foreground/80 group-hover:text-primary">{d.title}</span>
                                      <ChevronRight size={14} className="text-muted-foreground/40 group-hover:translate-x-1 transition-all" />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-10 text-center space-y-2">
                              <Search className="h-10 w-10 text-muted-foreground/20 mx-auto" />
                              <p className="text-sem-body-sm font-black text-muted-foreground/40 uppercase tracking-widest">
                                {searchQuery.length < 2 ? "Digite para pesquisar" : "Nenhum resultado"}
                              </p>
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    </>
                  )}
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
                  <DropdownMenuItem 
                    className="py-3 px-4 rounded-xl font-bold cursor-pointer focus:bg-primary/5 focus:text-primary transition-all"
                    onClick={() => setIsShortcutsOpen(true)}
                  >
                    <Keyboard className="mr-3 h-4 w-4 opacity-50" />
                    <span className="text-sem-body-sm">Atalhos do Teclado</span>
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
          className="flex-1 p-4 md:p-8 transition-all duration-slow"
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
                <Badge variant="outline" className="h-8 px-3 rounded-lg font-black bg-muted/20 border-border/50">{shortcut.key}</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
