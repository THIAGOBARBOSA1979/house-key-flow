

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
      "flex flex-col lg:flex-row gap-layout-gap md:gap-layout-gap p-1 mb-layout-gap-lg animate-in fade-in slide-in-from-bottom-2 duration-slow",
      className
    )}>
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-w-0">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-12 h-13 bg-card/60 backdrop-blur-3xl border-border/30 shadow-sem-md hover:border-primary/20 focus-visible:ring-primary/10 focus-visible:border-primary/40 transition-all rounded-2xl font-black uppercase tracking-widest text-[11px] placeholder:font-black placeholder:text-muted-foreground/30 hover:shadow-sem-lg focus:bg-card w-full"
            autoComplete="off"
            spellCheck={false}
          />

        </div>
        
        {children && (
          <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

