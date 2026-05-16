
import React from 'react';
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 'auto';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'layout' | 'xs-sem' | 'sm-sem' | 'md-sem' | 'lg-sem' | '4-sem';
  className?: string;
}

export function ResponsiveGrid({
  children,
  columns = 3,
  gap = 'layout',
  className
}: ResponsiveGridProps) {
  const gapClasses = {
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-6",
    lg: "gap-12",
    layout: "gap-layout-gap",
    'xs-sem': "gap-1",
    'sm-sem': "gap-2",
    'md-sem': "gap-6",
    'lg-sem': "gap-12",
    '4-sem': "gap-4"
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
