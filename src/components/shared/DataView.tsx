
import React from 'react';
import { SearchX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataViewProps<T> {
  items: T[];
  renderGrid: (item: T) => React.ReactNode;
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
}

export function DataView<T>({
  items,
  renderGrid,
  renderList,
  viewMode = 'grid',
  isLoading = false,
  emptyState,
  gridClassName
}: DataViewProps<T>) {
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
      <div className="flex flex-col items-center justify-center section-padding bg-muted/20 rounded-xl border-2 border-dashed border-muted-foreground/10 animate-fade-in">
        {emptyState?.icon || <SearchX className="h-14 w-14 text-muted-foreground/20 mb-4" />}
        <h3 className="text-h3 font-bold text-foreground mb-1">
          {emptyState?.title || "Nenhum registro encontrado"}
        </h3>
        <p className="text-body-base text-muted-foreground mb-6 text-center max-w-md">
          {emptyState?.description || "Tente ajustar seus filtros para encontrar o que procura."}
        </p>
        {emptyState?.action && (
          <Button variant="outline" onClick={emptyState.action.onClick} className="interactive-active">
            {emptyState.action.label}
          </Button>
        )}
      </div>
    );
  }

  if (viewMode === 'list' && renderList) {
    return (
      <div className="animate-fade-in">
        {renderList()}
      </div>
    );
  }

  return (
    <div className={cn("grid-layout animate-fade-in", gridClassName)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {renderGrid(item)}
        </React.Fragment>
      ))}
    </div>
  );
}
