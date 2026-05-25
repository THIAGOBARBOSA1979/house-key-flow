
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SidebarItem {
  to: string;
  icon: React.ElementType;
  label: string;
  end?: boolean;
}

interface SidebarGroupProps {
  title: string;
  items: SidebarItem[];
  defaultOpen?: boolean;
  collapsed?: boolean;
  onItemClick?: () => void;
}

export function SidebarGroup({ title, items, defaultOpen = true, collapsed = false, onItemClick }: SidebarGroupProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  if (collapsed) {
    return (
      <div className="space-y-4 py-6 flex flex-col items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.end 
            ? location.pathname === item.to 
            : location.pathname.startsWith(item.to);
            
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              className={cn(
                "flex items-center justify-center h-13 w-13 rounded-2xl transition-all duration-500 active:scale-90 group relative",
                isActive 
                  ? "bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-sem-xl shadow-sidebar-primary/40 scale-110 border border-white/20" 
                  : "hover:bg-sidebar-accent/40 text-sidebar-foreground/40 hover:text-sidebar-foreground"
              )}
            >
              <Icon size={22} className={cn("transition-all duration-500", isActive && "rotate-[10deg]")} />
              
              <div className="absolute left-full ml-4 px-5 py-2.5 bg-sidebar-foreground text-sidebar-background rounded-2xl text-[11px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 -translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-tooltip shadow-sem-2xl border border-sidebar-border/20 backdrop-blur-xl">
                {item.label}
              </div>
            </NavLink>
          );
        })}
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-5 py-3 text-[10px] text-sidebar-foreground/30 hover:text-sidebar-foreground/80 transition-all duration-300 group uppercase font-black tracking-[0.25em]">
        <span>{title}</span>
        <ChevronDown className={cn(
          "h-3.5 w-3.5 transition-all duration-500 opacity-0 group-hover:opacity-100",
          isOpen && "rotate-180 opacity-100 text-sidebar-primary"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1.5 px-3 pb-2 animate-in fade-in slide-in-from-top-2 duration-slow">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.end 
            ? location.pathname === item.to 
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-500 active:scale-95 group relative overflow-hidden",
                isActive 
                  ? "bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-sem-lg shadow-sidebar-primary/30 font-black scale-[1.02] border border-white/10" 
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/60 hover:text-sidebar-foreground font-bold hover:translate-x-1.5"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl"></div>
              )}
              <div className={cn(
                "transition-all duration-500 relative z-10",
                isActive ? "text-sidebar-primary-foreground scale-110" : "text-sidebar-foreground/30 group-hover:text-sidebar-primary/80"
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-sem-body-sm tracking-tight relative z-10">{item.label}</span>
            </NavLink>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
