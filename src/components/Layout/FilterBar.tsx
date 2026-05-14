

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
      "flex flex-col md:flex-row gap-4 py-4 px-5 bg-card/50 backdrop-blur-sm border-none rounded-xl shadow-sm mb-6",
      className
    )}>
      <div className="relative flex-1 max-w-md group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-10 h-10 border-none bg-background shadow-inner focus-visible:ring-primary/20 placeholder:text-muted-foreground/60 font-medium"
        />
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-6 w-[1px] bg-border/50 mx-1 hidden md:block" />
          {children}
        </div>
      )}
    </div>
  );
}

