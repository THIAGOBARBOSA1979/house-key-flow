import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { SkeletonLoader } from "./SkeletonLoader";

interface DataViewProps<T> {
  items: T[];
  renderGrid?: (item: T) => React.ReactNode;
  renderList?: () => React.ReactNode;
  viewMode?: 'grid' | 'list';
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
  isLoading = false,
  skeletonType = 'card',
  emptyState,
  gridClassName,
  itemsPerPage = 0
}: DataViewProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

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
              className="h-10 w-10 rounded-md border-2"
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
                    "h-10 w-10 rounded-md text-xs font-black transition-all",
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
