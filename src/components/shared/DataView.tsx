import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { SkeletonLoader } from "./SkeletonLoader";
import { DataViewMode } from "@/types/dataView";
import { DataTable } from "./DataTable";

export interface DataViewProps<T> {
  items: T[];
  viewMode?: DataViewMode;
  isLoading?: boolean;
  skeletonType?: 'card' | 'table' | 'page' | 'list';
  itemsPerPage?: number;
  gridClassName?: string;
  emptyState?: {
    title: string;
    description: string;
    icon?: LucideIcon;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  renderGrid?: (item: T) => React.ReactNode;
  renderList?: (items: T[]) => React.ReactNode;
  renderTimeline?: (items: T[]) => React.ReactNode;
  renderTable?: (items: T[]) => React.ReactNode;
  renderCalendar?: (items: T[]) => React.ReactNode;
  /** Custom columns for the default table implementation */
  columns?: any[];
  /** On row click for the default table implementation */
  onRowClick?: (item: T) => void;
}

/**
 * DataView Component
 * 
 * A standardized component to display data in different formats (grid, table, list, etc.)
 * with built-in support for pagination, loading states, and empty states.
 * 
 * @example
 * <DataView
 *   items={properties}
 *   viewMode="grid"
 *   renderGrid={(item) => <PropertyCard item={item} />}
 * />
 */
export function DataView<T>({
  items,
  viewMode = 'grid',
  isLoading = false,
  skeletonType = 'card',
  itemsPerPage = 0,
  gridClassName,
  emptyState,
  renderGrid,
  renderList,
  renderTimeline,
  renderTable,
  renderCalendar,
  columns,
  onRowClick,
}: DataViewProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (containerRef.current) {
      const yOffset = -100;
      const y = containerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return <SkeletonLoader type={skeletonType} count={itemsPerPage || 6} />;
  }

  if (items.length === 0) {
    return (
      <EmptyState 
        title={emptyState?.title || "Nenhum registro encontrado"}
        description={emptyState?.description || "Tente ajustar seus filtros para encontrar o que procura."}
        icon={emptyState?.icon}
        action={emptyState?.action}
      />
    );
  }

  const totalItems = items.length;
  const isPaginationEnabled = itemsPerPage > 0 && totalItems > itemsPerPage;
  const totalPages = isPaginationEnabled ? Math.ceil(totalItems / itemsPerPage) : 1;
  const effectivePage = Math.min(currentPage, totalPages);
  
  const displayedItems = isPaginationEnabled 
    ? items.slice((effectivePage - 1) * itemsPerPage, effectivePage * itemsPerPage)
    : items;

  const renderContent = () => {
    switch (viewMode) {
      case 'list':
        if (renderList) {
          return <div className="animate-fade-in">{renderList(displayedItems)}</div>;
        }
        // Fallback to vertical grid if renderList is missing
        return (
          <div className={cn("flex flex-col gap-4 animate-fade-in", gridClassName)}>
            {displayedItems.map((item, index) => (
              <React.Fragment key={index}>
                {renderGrid ? renderGrid(item) : (item as any).name || (item as any).id}
              </React.Fragment>
            ))}
          </div>
        );
      case 'timeline':
        if (renderTimeline) {
          return <div className="animate-fade-in">{renderTimeline(displayedItems)}</div>;
        }
        break;
      case 'table':
        if (renderTable) {
          return <div className="animate-fade-in">{renderTable(displayedItems)}</div>;
        }
        if (columns) {
          return (
            <div className="animate-fade-in">
              <DataTable 
                columns={columns} 
                data={displayedItems} 
                onRowClick={onRowClick}
              />
            </div>
          );
        }
        break;
      case 'calendar':
        if (renderCalendar) {
          return <div className="animate-fade-in">{renderCalendar(displayedItems)}</div>;
        }
        break;
      case 'grid':
      default:
        if (renderGrid) {
          return (
            <div className={cn("grid-layout animate-fade-in", gridClassName)}>
              {displayedItems.map((item, index) => (
                <React.Fragment key={index}>
                  {renderGrid(item)}
                </React.Fragment>
              ))}
            </div>
          );
        }
    }
    return (
      <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border/50">
        <p className="text-muted-foreground font-medium">Visualização "{viewMode}" não implementada para este conteúdo.</p>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {renderContent()}
      
      {isPaginationEnabled && (
        <div className="flex flex-col sm:flex-row items-center justify-between py-6 border-t border-border/10 gap-4 mt-8">
          <p className="text-sm text-muted-foreground font-medium">
            Mostrando <span className="font-bold text-foreground">{(effectivePage - 1) * itemsPerPage + 1}</span> a <span className="font-bold text-foreground">{Math.min(effectivePage * itemsPerPage, totalItems)}</span> de <span className="font-bold text-foreground">{totalItems}</span> registros
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-border/10 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-30"
              disabled={effectivePage === 1}
              onClick={() => handlePageChange(Math.max(1, effectivePage - 1))}
            >
              <ChevronLeft size={16} />
            </Button>
            
            <div className="flex items-center gap-1">
              {/* Pagination numbers logic - showing current, first, last and neighbors */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - effectivePage) <= 1)
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-1 text-muted-foreground/30">...</span>
                    )}
                    <Button
                      variant={effectivePage === page ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-9 w-9 rounded-lg text-xs font-bold transition-all shrink-0",
                        effectivePage === page 
                          ? "shadow-sm bg-primary text-primary-foreground" 
                          : "text-muted-foreground/60 hover:bg-primary/5 hover:text-primary"
                      )}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-border/10 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-30"
              disabled={effectivePage === totalPages}
              onClick={() => handlePageChange(Math.min(totalPages, effectivePage + 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
