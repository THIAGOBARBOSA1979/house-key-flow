/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, memo } from 'react';
import { ChevronLeft, ChevronRight, LucideIcon, List, LayoutGrid, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { SkeletonLoader } from "./SkeletonLoader";
import { DataTable } from "./DataTable";
import { ResponsiveGrid } from "./ResponsiveGrid";

/**
 * Common view modes for data display components.
 * Use this type instead of string literals for viewMode props.
 */
export type DataViewMode = 'grid' | 'list' | 'timeline' | 'table' | 'calendar';

export interface DataViewProps<T> {
  items: T[];
  viewMode?: DataViewMode;
  isLoading?: boolean;
  isError?: boolean;
  error?: {
    title?: string;
    message?: string;
    retry?: () => void;
  };
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
 */

function DataViewComponent<T>({
  items,
  viewMode = 'grid',
  isLoading = false,
  isError = false,
  error,
  skeletonType,
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
      const headerOffset = 80; // Estimate header height
      const y = containerRef.current.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    const effectiveSkeletonType = skeletonType || (viewMode === 'table' ? 'table' : viewMode === 'list' ? 'list' : 'card');
    return <SkeletonLoader type={effectiveSkeletonType} count={itemsPerPage || 6} />;
  }

  if (isError) {
    return (
      <EmptyState 
        variant="error"
        title={error?.title || "Sincronização interrompida"}
        description={error?.message || "Não foi possível processar sua solicitação no momento. Verifique sua conexão estratégica e tente novamente."}

        actionLabel={error?.retry ? "Tentar Novamente" : undefined}
        onAction={error?.retry}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState 
        title={emptyState?.title || "Nenhum dado encontrado"}
        description={emptyState?.description || "Ajuste seus parâmetros de busca para refinar os resultados."}

        icon={emptyState?.icon}
        action={emptyState?.action}
      />
    );
  }

  const totalItems = items.length;
  const isPaginationEnabled = itemsPerPage > 0 && totalItems > itemsPerPage;
  const totalPages = isPaginationEnabled ? Math.ceil(totalItems / itemsPerPage) : 1;
  const effectivePage = Math.min(currentPage, totalPages);
  
  const displayedItems = useMemo(() => {
    if (!isPaginationEnabled) return items;
    return items.slice((effectivePage - 1) * itemsPerPage, effectivePage * itemsPerPage);
  }, [items, isPaginationEnabled, effectivePage, itemsPerPage]);

  const renderContent = () => {
    switch (viewMode) {
      case 'list':
        if (renderList) {
          return <div className="animate-fade-in">{renderList(displayedItems)}</div>;
        }
        return (
          <div className={cn("flex flex-col gap-4 animate-fade-in", gridClassName)}>
            {displayedItems.map((item, index) => (
              <React.Fragment key={index}>
                {renderGrid ? renderGrid(item) : (
                  <div className="p-4 card-standard flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <LayoutGrid size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{(item as any)?.name || (item as any)?.title || (item as any)?.id || 'Sem nome'}</p>
                      <p className="text-xs text-muted-foreground">{(item as any)?.description || (item as any)?.location || ''}</p>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        );
      case 'timeline':
        if (renderTimeline) {
          return <div className="animate-fade-in">{renderTimeline(displayedItems)}</div>;
        }
        return (
          <div className="space-y-4 animate-fade-in">
            {displayedItems.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-4 w-4 rounded-full bg-primary" />
                  <div className="w-0.5 flex-1 bg-border" />
                </div>
                <div className="pb-8 flex-1">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                    {(item as any)?.date ? new Date((item as any).date).toLocaleDateString('pt-BR') : 'Sem data'}
                  </p>
                  <div className="mt-2 p-4 card-standard">
                    <p className="font-bold">{(item as any)?.name || (item as any)?.title || 'Sem título'}</p>
                    <p className="text-sm text-muted-foreground">{(item as any)?.description || (item as any)?.notes || ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
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
        return (
          <div className="animate-fade-in border rounded-xl overflow-hidden">
             <table className="w-full text-sm text-left">
               <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-black">
                 <tr><th className="p-4">Registro</th><th className="p-4">Detalhes</th></tr>
               </thead>
               <tbody>
                 {displayedItems.map((item, i) => (
                   <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                     <td className="p-4 font-bold">{(item as any)?.name || (item as any)?.title || (item as any)?.id || 'N/A'}</td>
                     <td className="p-4 text-muted-foreground">{(item as any)?.description || (item as any)?.email || ''}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        );
      case 'calendar':
        if (renderCalendar) {
          return <div className="animate-fade-in">{renderCalendar(displayedItems)}</div>;
        }
        return (
          <div className="p-12 text-center card-standard border-dashed bg-muted/5 animate-fade-in">
            <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <h4 className="font-black text-lg">Visualização em Calendário</h4>
            <p className="text-muted-foreground max-w-xs mx-auto text-sm">Esta funcionalidade requer uma implementação específica de `renderCalendar` para os dados atuais.</p>
          </div>
        );
      case 'grid':
      default:
        if (renderGrid) {
          return (
            <ResponsiveGrid columns={3} mobileCols={1} tabletCols={2} gap="layout" className={cn("animate-fade-in w-full", gridClassName)}>
              {displayedItems.map((item, index) => (
                <React.Fragment key={index}>
                  {renderGrid(item)}
                </React.Fragment>
              ))}
            </ResponsiveGrid>
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
        <div className="flex flex-col md:flex-row items-center justify-between py-6 border-t border-border/10 gap-4 mt-8">
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

export const DataView = memo(DataViewComponent) as typeof DataViewComponent;
