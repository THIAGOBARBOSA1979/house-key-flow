import React from 'react';
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  animation = 'pulse',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted/40",
        variant === 'circular' && "rounded-full",
        variant === 'text' && "h-4 w-full rounded-md",
        variant === 'rectangular' && "rounded-xl",
        animation === 'pulse' && "animate-pulse",
        animation === 'wave' && "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[wave_2s_linear_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}
