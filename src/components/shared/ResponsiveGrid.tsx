
import React from 'react';
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 'auto';
  gap?: 'sm' | 'md' | 'lg' | 'layout';
  className?: string;
}

export function ResponsiveGrid({
  children,
  columns = 3,
  gap = 'layout',
  className
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: "gap-3-sem",
    md: "gap-6-sem",
    lg: "gap-12-sem",
    layout: "gap-layout-gap"
  };

  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    'auto': "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  };

  return (
    <div className={cn(
      "grid",
      columnClasses[columns as keyof typeof columnClasses],
      gapClasses[gap as keyof typeof gapClasses],
      className
    )}>
      {children}
    </div>
  );
}
