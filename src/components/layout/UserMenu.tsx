
import { LogOut, User, Keyboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  companyName?: string;
  onOpenShortcuts: () => void;
}

export function UserMenu({ companyName, onOpenShortcuts }: UserMenuProps) {
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-11 lg:h-13 rounded-2xl gap-3 lg:gap-4 pl-2 lg:pl-2.5 pr-3 lg:pr-5 hover:bg-primary/5 group active:scale-95 transition-all border border-transparent hover:border-primary/10 shadow-sem-sm">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center font-black text-xs lg:text-sm uppercase group-hover:rotate-6 transition-all shrink-0 border border-primary/20 shadow-inner">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="hidden sm:flex flex-col items-start leading-tight gap-0.5">
            <span className="text-sem-label font-black truncate max-w-[100px] lg:max-w-[140px] tracking-tight group-hover:text-primary transition-colors">{user?.name}</span>
            <span className="text-[9px] text-muted-foreground/30 uppercase font-black tracking-[0.2em]">
              {user?.is_super_admin ? "SaaS Master" : (companyName || "Administrador")}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-2 mt-4 animate-in zoom-in-95 slide-in-from-top-2 duration-slow shadow-sem-xl rounded-[1.5rem] border-none bg-background/90 backdrop-blur-3xl ring-1 ring-black/5 dark:ring-white/10">
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-sem-body-sm font-black leading-none">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground font-medium truncate">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-2 bg-border/40" />
        <DropdownMenuItem className="py-3 px-4 rounded-2xl font-bold cursor-pointer focus:bg-primary/5 focus:text-primary transition-all">
          <User className="mr-3 h-4 w-4 opacity-50" />
          <span className="text-sem-body-sm">Perfil do Sistema</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="py-3 px-4 rounded-2xl font-bold cursor-pointer focus:bg-primary/5 focus:text-primary transition-all"
          onClick={onOpenShortcuts}
        >
          <Keyboard className="mr-3 h-4 w-4 opacity-50" />
          <span className="text-sem-body-sm">Atalhos do Teclado</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="mx-2 bg-border/40" />
        <DropdownMenuItem onClick={logout} className="py-3 px-4 rounded-2xl font-black text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer transition-all">
          <LogOut className="mr-3 h-4 w-4 opacity-50" />
          <span className="text-sem-body-sm uppercase tracking-widest">Sair com segurança</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
