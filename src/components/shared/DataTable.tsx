import React, { useMemo, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { SkeletonLoader } from "./SkeletonLoader";
import { EmptyState } from "./EmptyState";
import { LucideIcon, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  emptyState?: {
    title: string;
    description: string;
    icon?: LucideIcon;
  };
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  onRowClick,
  emptyState,
  className
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a: any, b: any) => {
      const aVal = a[sortConfig.key!];
      const bVal = b[sortConfig.key!];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (isLoading) return <SkeletonLoader type="table" />;

  if (data.length === 0) {
    return (
      <EmptyState 
        title={emptyState?.title || "Sem dados"} 
        description={emptyState?.description || "Nenhum registro foi encontrado."}
        icon={emptyState?.icon}
      />
    );
  }

  return (
    <div className={cn("w-full animate-fade-in", className)}>
      <div className="hidden md:block rounded-xl border border-border/50 shadow-sem-sm bg-card/40 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="hover:bg-transparent border-b-border/40">
              {columns.map((column, idx) => (
                <TableHead 
                  key={idx} 
                  className={cn(
                    "text-sem-tiny uppercase tracking-widest text-muted-foreground py-5-sem px-6-sem h-auto whitespace-nowrap font-black",
                    column.className
                  )}
                >
                  {column.sortable ? (
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort(column.accessorKey as string)}
                      className="h-auto p-0 hover:bg-transparent font-black text-sem-tiny uppercase tracking-widest text-muted-foreground flex items-center gap-1"
                    >
                      {column.header}
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  ) : column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, rowIdx) => (
              <TableRow 
                key={rowIdx}
                className={cn(
                  "group transition-all duration-300 border-b-border/20 outline-none focus-within:bg-primary/5",
                  onRowClick ? "cursor-pointer hover:bg-primary/5 active:bg-primary/10" : "cursor-default hover:bg-muted/10"
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, colIdx) => (
                  <TableCell 
                    key={colIdx} 
                    className={cn(
                      "py-4.5-sem px-6-sem text-sem-body-sm font-medium text-foreground/90 group-hover:text-primary transition-colors",
                      column.className
                    )}
                  >
                    {column.cell 
                      ? column.cell(item) 
                      : (item[column.accessorKey as keyof T] as unknown as React.ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-layout-gap md:hidden">
        {data.map((item, idx) => (
          <div 
            key={idx}
            className="card-standard p-4 md:p-6-sem space-y-4 md:space-y-5-sem interactive-active border-none bg-card/50 backdrop-blur-sm shadow-sem-md hover:ring-2 hover:ring-primary/20 focus-within:ring-2 focus-within:ring-primary/40 outline-none"
            onClick={() => onRowClick?.(item)}
            tabIndex={onRowClick ? 0 : -1}
            onKeyDown={(e) => {
              if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onRowClick(item);
              }
            }}
          >
            {columns.map((column, colIdx) => (
              <div key={colIdx} className={cn(
                "flex justify-between items-start gap-4-sem pb-3-sem border-b border-border/10 last:border-0 last:pb-0",
                column.hideOnMobile && "hidden"
              )}>
                <span className="text-sem-tiny uppercase tracking-widest text-muted-foreground font-black shrink-0">
                  {column.header}
                </span>
                <div className="text-sem-body-sm font-medium text-right text-foreground/90">
                  {column.cell 
                    ? column.cell(item) 
                    : (item[column.accessorKey as keyof T] as unknown as React.ReactNode)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
