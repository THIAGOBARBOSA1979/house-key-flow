import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { SkeletonLoader } from "./SkeletonLoader";

interface DataViewProps<T> {
  items: T[];
  renderGrid?: (item: T) => React.ReactNode;
  renderList?: (items: T[]) => React.ReactNode;
  renderTimeline?: (items: T[]) => React.ReactNode;
  viewMode?: 'grid' | 'list' | 'timeline';
  isLoading?: boolean;
  skeletonType?: 'card' | 'table' | 'page' | 'list';
  emptyState?: {
    title: string;
    description: string;
    icon?: LucideIcon;
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
  renderTimeline,
  isLoading = false,
  skeletonType = 'card',
  emptyState,
  gridClassName,
  itemsPerPage = 0
}: DataViewProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (containerRef.current) {
      const yOffset = -100; // Offset to account for sticky header
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
          {renderList(displayedItems)}
        </div>
      );
    }

    if (viewMode === 'timeline' && renderTimeline) {
      return (
        <div className="animate-fade-in">
          {renderTimeline(displayedItems)}
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
    <div ref={containerRef} className="space-y-6-sem">
      {renderContent()}
      
      {isPaginationEnabled && (
        <div className="flex flex-col sm:flex-row items-center justify-between py-8-sem border-t border-border/10 gap-6-sem">
          <p className="text-sem-body-sm text-muted-foreground/60 font-medium">
            Mostrando <span className="font-black text-foreground">{(effectivePage - 1) * itemsPerPage + 1}</span> a <span className="font-black text-foreground">{Math.min(effectivePage * itemsPerPage, totalItems)}</span> de <span className="font-black text-foreground">{totalItems}</span> registros
          </p>
          <div className="flex items-center gap-2-sem">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-border/10 hover:bg-primary/5 hover:text-primary transition-all active:scale-90 disabled:opacity-30"
              disabled={effectivePage === 1}
              onClick={() => handlePageChange(Math.max(1, effectivePage - 1))}
            >
              <ChevronLeft size={18} />
            </Button>
            <div className="flex items-center gap-1.5-sem mx-2-sem overflow-x-auto no-scrollbar max-w-[150px] sm:max-w-none px-2 py-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={effectivePage === page ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-xl text-xs font-black transition-all duration-300 shrink-0",
                    effectivePage === page 
                      ? "shadow-sem-lg scale-110 bg-gradient-to-br from-primary to-primary/80 ring-2 ring-primary/20" 
                      : "text-muted-foreground/40 hover:bg-primary/5 hover:text-primary active:scale-95"
                  )}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-border/10 hover:bg-primary/5 hover:text-primary transition-all active:scale-90 disabled:opacity-30"
              disabled={effectivePage === totalPages}
              onClick={() => {
                setCurrentPage(prev => Math.min(totalPages, prev + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
