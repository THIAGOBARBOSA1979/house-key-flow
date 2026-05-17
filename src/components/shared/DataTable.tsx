
import React from 'react';
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
import { LucideIcon } from "lucide-react";

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
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
  if (isLoading) {
    return <SkeletonLoader type="table" />;
  }

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
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-border/50 shadow-sem-sm overflow-x-auto bg-card/40 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="hover:bg-transparent border-b-border/40">
              {columns.map((column, idx) => (
                <TableHead 
                  key={idx} 
                  className={cn(
                    "font-black text-sem-tiny uppercase tracking-widest text-muted-foreground py-5-sem px-6-sem h-auto",
                    column.className
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, rowIdx) => (
              <TableRow 
                key={rowIdx}
                className={cn(
                  "group transition-all duration-300 border-b-border/20",
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

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-layout-gap md:hidden">
        {data.map((item, idx) => (
          <div 
            key={idx}
            className="card-standard p-6-sem space-y-5-sem interactive-active border-none bg-card/50 backdrop-blur-sm shadow-sem-md hover:ring-2 hover:ring-primary/20"
            onClick={() => onRowClick?.(item)}
          >
            {columns.map((column, colIdx) => (
              <div key={colIdx} className={cn(
                "flex justify-between items-center gap-4-sem pb-3-sem border-b border-border/10 last:border-0 last:pb-0",
                column.hideOnMobile && "hidden"
              )}>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 shrink-0">
                  {column.header}
                </span>
                <div className="text-sem-body-sm font-bold text-right">
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
