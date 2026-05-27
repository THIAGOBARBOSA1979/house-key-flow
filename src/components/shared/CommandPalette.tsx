import React, { useEffect, useState } from "react";
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList, 
  CommandSeparator 
} from "@/components/ui/command";
import { 
  Calculator, 
  Calendar, 
  Settings, 
  User, 
  Building, 
  ShieldCheck, 
  FileText, 
  MessageSquare,
  Search,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCommandPalette } from "@/hooks/shared/useCommandPalette";

export function CommandPalette() {
  const navigate = useNavigate();
  const { isOpen, setIsOpen } = useCommandPalette();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, setIsOpen]);

  const runCommand = (command: () => void) => {
    setIsOpen(false);
    command();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Digite um comando ou pesquise..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Sugestões">
          <CommandItem onSelect={() => runCommand(() => navigate("/app/properties"))}>
            <Building className="mr-2 h-4 w-4" />
            <span>Ver Propriedades</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/app/inspections"))}>
            <Search className="mr-2 h-4 w-4" />
            <span>Inspeções Técnicas</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/app/warranty"))}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            <span>Fluxo de Garantia</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Ações Rápidas">
          <CommandItem onSelect={() => runCommand(() => navigate("/app/profile"))}>
            <User className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/app/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/app/support"))}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Suporte Técnico</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
