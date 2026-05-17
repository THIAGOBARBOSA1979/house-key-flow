import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Search, 
  Plus, 
  Building, 
  ClipboardCheck, 
  ShieldCheck, 
  User, 
  Settings, 
  MessageSquare,
  ChevronRight,
  ArrowRight,
  Keyboard,
  Activity,
  Megaphone
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  category: string;
  shortcut?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { 
    id: "new-property", 
    title: "Novo Empreendimento", 
    description: "Cadastrar nova obra ou projeto", 
    icon: Building, 
    path: "/admin/properties", 
    category: "Gestão",
    shortcut: "Alt + P"
  },
  { 
    id: "new-inspection", 
    title: "Agendar Vistoria", 
    description: "Criar novo agendamento de inspeção", 
    icon: ClipboardCheck, 
    path: "/admin/calendar", 
    category: "Operacional",
    shortcut: "Alt + V"
  },
  { 
    id: "new-warranty", 
    title: "Nova Garantia", 
    description: "Registrar solicitação de assistência", 
    icon: ShieldCheck, 
    path: "/admin/warranty", 
    category: "Operacional",
    shortcut: "Alt + G"
  },
  { 
    id: "new-support", 
    title: "Novo Ticket", 
    description: "Abrir chamado de suporte interno", 
    icon: MessageSquare, 
    path: "/admin/support", 
    category: "Sistema"
  },
  { 
    id: "settings", 
    title: "Configurações", 
    description: "Ajustar parâmetros do sistema", 
    icon: Settings, 
    path: "/admin/settings", 
    category: "Sistema",
    shortcut: "Alt + S"
  },
  { 
    id: "announcements", 
    title: "Novo Comunicado", 
    description: "Enviar aviso para clientes", 
    icon: Megaphone, 
    path: "/admin/announcements", 
    category: "Gestão"
  },
  { 
    id: "audit", 
    title: "Ver Auditoria", 
    description: "Consultar logs do sistema", 
    icon: Activity, 
    path: "/admin/audit-logs", 
    category: "Sistema"
  },
  { 
    id: "users", 
    title: "Gerenciar Usuários", 
    description: "Configurar permissões e contas", 
    icon: User, 
    path: "/admin/users", 
    category: "Gestão"
  }
];

export const QuickLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const filteredActions = QUICK_ACTIONS.filter(action => 
    action.title.toLowerCase().includes(search.toLowerCase()) ||
    action.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setSearch("");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'q') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredActions.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
      } else if (e.key === 'Enter' && filteredActions.length > 0) {
        e.preventDefault();
        handleAction(filteredActions[selectedIndex].path);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Remove original declarations since they are now above useEffect
  // ... keep existing code

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-8 right-8 h-14 w-14 rounded-2xl shadow-sem-xl bg-primary text-primary-foreground hover:scale-110 active:scale-95 transition-all duration-300 z-modal group"
          size="icon"
        >
          <Zap className="h-6 w-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute right-full mr-4 px-3 py-1.5 bg-card text-foreground text-[10px] font-black uppercase tracking-widest rounded-lg border shadow-sem-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Ações Rápidas (Ctrl+Q)
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[600px] p-0 overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border-none shadow-sem-xl bg-background/95 backdrop-blur-2xl">
        <DialogHeader className="p-8 border-b border-border/10 bg-primary/5">
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
            <Zap className="text-primary h-6 w-6" />
            Central de Ações
          </DialogTitle>
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="O que você deseja fazer hoje?" 
              className="pl-12 h-14 bg-background border-none rounded-2xl font-bold text-lg shadow-sem-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </DialogHeader>
        <div className="p-4 max-h-[450px] overflow-y-auto">
          <div className="grid gap-2">
            {filteredActions.length > 0 ? (
              filteredActions.map((action, index) => {
                const Icon = action.icon;
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action.path)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "flex items-center justify-between p-3 sm:p-4 rounded-2xl group transition-all text-left border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 touch-manipulation",
                      isSelected 
                        ? "bg-primary/10 border-primary/20 scale-[1.01]" 
                        : "hover:bg-primary/5 border-transparent hover:border-primary/10"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-foreground/90">{action.title}</p>
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest h-4 px-1 bg-muted/20 border-border/40">
                            {action.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">{action.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {action.shortcut && (
                        <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest hidden sm:block">
                          {action.shortcut}
                        </span>
                      )}
                      <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-sem-body-sm font-black text-muted-foreground/40 uppercase tracking-widest">Nenhuma ação encontrada</p>
              </div>
            )}
          </div>
        </div>
        <div className="p-6 bg-muted/5 border-t border-border/10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <kbd className="h-6 px-1.5 rounded-md bg-muted/20 border border-border/40 flex items-center justify-center text-[10px] font-black">Esc</kbd>
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">Sair</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="h-6 px-1.5 rounded-md bg-muted/20 border border-border/40 flex items-center justify-center text-[10px] font-black">↵</kbd>
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">Selecionar</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-primary/40 uppercase tracking-widest">
            A2 Enterprise v3.1
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
