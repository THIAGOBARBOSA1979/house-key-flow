
import * as React from "react";
import {
  Calculator,
  Calendar,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  User,
  Wrench,
  ClipboardCheck,
  Bell
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";

export function ClientCommandPalette() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-muted-foreground bg-muted/30 hover:bg-muted/50 border border-border/10 rounded-xl transition-all w-full sm:w-64"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Busca inteligente...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="O que você está procurando?" />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Navegação Rápida">
            <CommandItem onSelect={() => runCommand(() => navigate("/client"))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Painel de Controle</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/client/properties"))}>
              <Building className="mr-2 h-4 w-4" />
              <span>Minha Unidade</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/client/financial"))}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Financeiro & Boletos</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/client/documents"))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Dossiê Digital</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Serviços & Suporte">
            <CommandItem onSelect={() => runCommand(() => navigate("/client/inspections"))}>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              <span>Vistorias ABNT</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/client/warranty"))}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              <span>Garantia & Reparos</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/client/maintenance"))}>
              <Wrench className="mr-2 h-4 w-4" />
              <span>Cronograma de Manutenção</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/client/support"))}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Abrir Ticket de Suporte</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Conta">
            <CommandItem onSelect={() => runCommand(() => navigate("/client/profile"))}>
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/client/notifications"))}>
              <Bell className="mr-2 h-4 w-4" />
              <span>Notificações</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
