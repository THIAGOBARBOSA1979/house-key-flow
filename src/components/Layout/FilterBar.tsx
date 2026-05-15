

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, ListFilter } from "lucide-react";

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Reusable FilterBar following Design System tokens.
 */
export function FilterBar({
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  children,
  className
}: FilterBarProps) {
  return (
    <div className={cn(
      "flex flex-col md:flex-row gap-4 p-2 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500",
      className
    )}>
      <div className="flex-1 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-12 h-12 bg-card border-border/40 shadow-sem-sm hover:border-primary/30 focus-visible:ring-primary/20 transition-all rounded-xl font-medium"
          />
        </div>
        
        {children && (
          <div className="flex flex-wrap items-center gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

