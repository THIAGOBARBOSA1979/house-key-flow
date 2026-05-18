import React from 'react';
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto' | '2-wide';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'layout' | 'xs-sem' | 'sm-sem' | 'md-sem' | 'lg-sem' | '4-sem' | 'layout-gap';
  className?: string;
  mobileCols?: 1 | 2;
  tabletCols?: 1 | 2 | 3;
}

export function ResponsiveGrid({
  children,
  columns = 3,
  gap = 'layout',
  className,
  mobileCols,
  tabletCols
}: ResponsiveGridProps) {
  const gapClasses = {
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-6",
    lg: "gap-12",
    xl: "gap-16",
    layout: "gap-layout-gap",
    'layout-gap': "gap-layout-gap",
    'xs-sem': "gap-1",
    'sm-sem': "gap-2",
    'md-sem': "gap-6",
    'lg-sem': "gap-12",
    '4-sem': "gap-4-sem"
  };

  const columnClasses = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
    'auto': "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    '2-wide': "md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
  };

  const tabletColMap = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3'
  };

  const mobileColMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-2'
  };

  if (columns === 'auto') {
    return (
      <div className={cn(
        "grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
        gapClasses[gap as keyof typeof gapClasses],
        className
      )}>
        {children}
      </div>
    );
  }

  // Determine defaults based on props or existing patterns
  const finalMobile = mobileCols || 1;
  const finalTablet = tabletCols || (columns === 1 ? 1 : 2);
  const finalDesktop = columnClasses[columns as keyof typeof columnClasses] || "lg:grid-cols-3";

  return (
    <div className={cn(
      "grid w-full",
      mobileColMap[finalMobile as keyof typeof mobileColMap],
      tabletColMap[finalTablet as keyof typeof tabletColMap],
      finalDesktop,
      gapClasses[gap as keyof typeof gapClasses],
      className
    )}>
      {children}
    </div>
  );
}
