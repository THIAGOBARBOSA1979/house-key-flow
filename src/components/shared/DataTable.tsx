/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo } from 'react';
import { useDataTable } from "@/hooks/useDataTable";

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

function DataTableComponent<T>({
  columns,
  data,
  isLoading,
  onRowClick,
  emptyState,
  className
}: DataTableProps<T>) {
  const { sortedData, handleSort } = useDataTable<T>(data);


  if (isLoading) return <SkeletonLoader type="table" />;

  if (data.length === 0) {
    return (
      <EmptyState 
        title={emptyState?.title || "Repositório Digital Vazio"} 
        description={emptyState?.description || "Nenhum protocolo ou registro estratégico foi localizado nesta coordenada."}


        icon={emptyState?.icon}
      />
    );
  }

  return (
    <div className={cn("w-full animate-fade-in group/table-container", className)}>
      <div className="hidden lg:block rounded-xl border border-border/50 shadow-sem-sm bg-card/40 backdrop-blur-sm overflow-hidden relative">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          <Table className="min-w-[800px] lg:min-w-full">
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
                      : (item ? (item[column.accessorKey as keyof T] as unknown as React.ReactNode) : null)}

                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
        {data.map((item, idx) => (
          <div 
            key={idx}
            className="card-standard p-5 space-y-4 interactive-active border border-border/40 bg-card/60 backdrop-blur-md shadow-sm rounded-2xl transition-all duration-300 hover:shadow-md hover:border-primary/20 outline-none active:scale-[0.98]"
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
                    : (item ? (item[column.accessorKey as keyof T] as unknown as React.ReactNode) : null)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export const DataTable = memo(DataTableComponent) as typeof DataTableComponent;
