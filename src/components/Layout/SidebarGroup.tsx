
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
}

export function SidebarGroup({ title, items, defaultOpen = true, collapsed = false }: SidebarGroupProps) {
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
      <div className="space-y-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                "flex items-center justify-center h-10 w-10 mx-auto rounded-xl transition-all duration-200 active:scale-95",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-foreground"
              )}
              title={item.label}
            >
              <Icon size={20} />
            </NavLink>
          );
        })}
      </div>
    );
  }


  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-tiny text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors group">
        <span className="font-bold tracking-widest">{title}</span>
        <ChevronDown className={cn(
          "h-3.5 w-3.5 transition-transform duration-300 opacity-0 group-hover:opacity-100",
          isOpen && "rotate-180 opacity-100"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 px-2 pb-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 active:scale-95",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-bold" 
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-foreground font-medium"
              )}
            >
              <Icon size={18} className={cn("transition-transform", isActive ? "scale-110" : "")} />
              <span className="text-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </CollapsibleContent>

    </Collapsible>
  );
}
