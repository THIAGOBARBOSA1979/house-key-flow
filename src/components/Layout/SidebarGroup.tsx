
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
  
  // Check if any item in this group is active
  const isGroupActive = items.some(item => 
    item.end 
      ? location.pathname === item.to 
      : location.pathname.startsWith(item.to)
  );

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
                "flex items-center justify-center h-12 w-12 rounded-2xl transition-all duration-500 active:scale-90 group relative",
                isActive 
                  ? "bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-sem-lg shadow-sidebar-primary/40 scale-105" 
                  : "hover:bg-sidebar-accent/40 text-sidebar-foreground/40 hover:text-sidebar-foreground"
              )}
            >
              <Icon size={20} className={cn("transition-all duration-500", isActive && "rotate-[10deg]")} />
              
              {/* Enhanced Tooltip for collapsed sidebar */}
              <div className="absolute left-full ml-4 px-4 py-2 bg-sidebar-foreground text-sidebar-background rounded-xl text-[11px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 -translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-tooltip shadow-sem-xl border border-sidebar-border/20 backdrop-blur-md">
                {item.label}
              </div>
            </NavLink>
          );
        })}
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-5 py-2 text-[10px] text-sidebar-foreground/30 hover:text-sidebar-foreground/80 transition-all duration-300 group">
        <span className="font-black uppercase tracking-[0.2em]">{title}</span>
        <ChevronDown className={cn(
          "h-3 w-3 transition-all duration-500 opacity-0 group-hover:opacity-100",
          isOpen && "rotate-180 opacity-100 text-sidebar-primary"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1.5 px-3 pb-2 animate-in fade-in slide-in-from-top-1 duration-normal">
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
                "flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-300 active:scale-95 group",
                isActive 
                  ? "bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-sem-md shadow-sidebar-primary/30 font-black" 
                  : "hover:bg-sidebar-accent/30 text-sidebar-foreground/60 hover:text-sidebar-foreground font-bold"
              )}
            >
              <div className={cn(
                "transition-all duration-500",
                isActive ? "text-sidebar-primary-foreground scale-110" : "text-sidebar-foreground/30 group-hover:text-sidebar-primary/80"
              )}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-sem-body-sm tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
