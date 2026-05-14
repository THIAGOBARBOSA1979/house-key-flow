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
      <div className="flex flex-col items-center justify-center section-padding bg-muted/20 rounded-xl border-2 border-dashed border-muted-foreground/10 animate-fade-in py-20">
        <div className="p-4 bg-muted/20 rounded-full mb-4">
          {emptyState?.icon || <SearchX className="h-12 w-12 text-muted-foreground/30" />}
        </div>
        <h3 className="text-h3 font-bold text-foreground mb-1">
          {emptyState?.title || "Nenhum registro encontrado"}
        </h3>
        <p className="text-body-base text-muted-foreground mb-6 text-center max-w-md">
          {emptyState?.description || "Tente ajustar seus filtros para encontrar o que procura."}
        </p>
        {emptyState?.action && (
          <Button onClick={emptyState.action.onClick} className="rounded-lg h-10 px-6 font-bold active:scale-95 transition-all">
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
        <div className="flex items-center justify-between py-4 border-t border-border/10">
          <p className="text-sem-body-sm text-muted-foreground">
            Mostrando <span className="font-bold text-foreground">{(effectivePage - 1) * itemsPerPage + 1}</span> a <span className="font-bold text-foreground">{Math.min(effectivePage * itemsPerPage, totalItems)}</span> de <span className="font-bold text-foreground">{totalItems}</span> registros
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg"
              disabled={effectivePage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              <ChevronLeft size={16} />
            </Button>
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={effectivePage === page ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-lg text-xs font-bold transition-all",
                    effectivePage === page ? "shadow-sem-md" : "text-muted-foreground"
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
              className="h-9 w-9 rounded-lg"
              disabled={effectivePage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
