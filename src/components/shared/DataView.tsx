import React, { useState } from 'react';
import { SearchX, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataViewProps<T> {
  items: T[];
  renderGrid?: (item: T) => React.ReactNode;
  renderList?: () => React.ReactNode;
  viewMode?: 'grid' | 'list';
  isLoading?: boolean;
  emptyState?: {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  gridClassName?: string;
  itemsPerPage?: number;
}

export function DataView<T>({
  items,
  renderGrid,
  renderList,
  viewMode = 'grid',
  isLoading = false,
  emptyState,
  gridClassName,
  itemsPerPage = 0
}: DataViewProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-sem-body-base text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center section-padding bg-muted/20 rounded-3xl border-2 border-dashed border-muted-foreground/10 animate-fade-in py-24 shadow-sem-inner">
        <div className="p-6 bg-muted/40 rounded-3xl mb-6 shadow-sem-sm">
          {emptyState?.icon || <SearchX className="h-14 w-14 text-muted-foreground/40" />}
        </div>
        <h3 className="text-2xl font-black text-foreground mb-2 tracking-tight">
          {emptyState?.title || "Nenhum registro encontrado"}
        </h3>
        <p className="text-sem-body-base text-muted-foreground mb-8 text-center max-w-md leading-relaxed">
          {emptyState?.description || "Tente ajustar seus filtros para encontrar o que procura."}
        </p>
        {emptyState?.action && (
          <Button onClick={emptyState.action.onClick} className="h-12 px-8 font-black uppercase tracking-widest text-xs">
            {emptyState.action.label}
          </Button>
        )}
      </div>
    );
  }

  // Pagination logic
  const totalItems = items.length;
  const isPaginationEnabled = itemsPerPage > 0 && totalItems > itemsPerPage;
  const totalPages = isPaginationEnabled ? Math.ceil(totalItems / itemsPerPage) : 1;
  const effectivePage = Math.min(currentPage, totalPages);
  
  const displayedItems = isPaginationEnabled 
    ? items.slice((effectivePage - 1) * itemsPerPage, effectivePage * itemsPerPage)
    : items;

  const renderContent = () => {
    if (viewMode === 'list' && renderList) {
      return (
        <div className="animate-fade-in">
          {renderList()}
        </div>
      );
    }

    return (
      <div className={cn("grid-layout animate-fade-in", gridClassName)}>
        {displayedItems.map((item, index) => (
          <React.Fragment key={index}>
            {renderGrid ? renderGrid(item) : null}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderContent()}
      
      {isPaginationEnabled && (
        <div className="flex flex-col sm:flex-row items-center justify-between py-6 border-t border-border/10 gap-4">
          <p className="text-sem-body-sm text-muted-foreground font-medium">
            Mostrando <span className="font-black text-foreground">{(effectivePage - 1) * itemsPerPage + 1}</span> a <span className="font-black text-foreground">{Math.min(effectivePage * itemsPerPage, totalItems)}</span> de <span className="font-black text-foreground">{totalItems}</span> registros
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-2"
              disabled={effectivePage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              <ChevronLeft size={18} />
            </Button>
            <div className="flex items-center gap-1.5 mx-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={effectivePage === page ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-xl text-xs font-black transition-all",
                    effectivePage === page ? "shadow-sem-md scale-110" : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-2"
              disabled={effectivePage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
