
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
    <div className={cn("w-full overflow-hidden", className)}>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-border/50 shadow-sem-sm overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              {columns.map((column, idx) => (
                <TableHead 
                  key={idx} 
                  className={cn(
                    "font-bold text-foreground py-4 px-6 h-auto",
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
                  "cursor-pointer transition-colors hover:bg-muted/40",
                  onRowClick ? "cursor-pointer" : "cursor-default"
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, colIdx) => (
                  <TableCell 
                    key={colIdx} 
                    className={cn("py-4 px-6", column.className)}
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
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {data.map((item, idx) => (
          <div 
            key={idx}
            className="card-standard p-5 space-y-4 interactive-active border-border/60"
            onClick={() => onRowClick?.(item)}
          >
            {columns.map((column, colIdx) => (
              <div key={colIdx} className={cn(
                "flex flex-col gap-1",
                column.hideOnMobile && "hidden"
              )}>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  {column.header}
                </span>
                <div className="text-sem-body-sm font-medium">
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
