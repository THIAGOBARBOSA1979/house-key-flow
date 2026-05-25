// Optimized UI state component with standardized premium microcopy.
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";


interface SkeletonLoaderProps {
  type: 'card' | 'table' | 'page' | 'list';
  count?: number;
  className?: string;
}

export function SkeletonLoader({ type, count = 3, className }: SkeletonLoaderProps) {
  const { t } = useTranslation();

  if (type === 'card') {
    return (
      <div className={cn("grid-layout gap-layout-gap-lg", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card-standard p-8 space-y-6 rounded-[2.5rem] bg-card/40 border-none shadow-none ring-1 ring-black/[0.02] dark:ring-white/[0.02] overflow-hidden">
            <div className="relative -mt-8 -mx-8 mb-6 h-40">
              <Skeleton className="h-full w-full rounded-none opacity-50" />
            </div>
            <div className="flex items-center gap-5">
              <Skeleton className="h-14 w-14 rounded-2xl opacity-60" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-5 w-3/4 rounded-lg" />
                <Skeleton className="h-3.5 w-1/2 rounded-lg opacity-50" />
              </div>
            </div>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-14 rounded-2xl opacity-40" />
                <Skeleton className="h-14 rounded-2xl opacity-40" />
              </div>
              <div className="space-y-2 pt-4">
                <div className="flex justify-between items-center mb-1">
                  <Skeleton className="h-3 w-20 rounded-lg opacity-40" />
                  <Skeleton className="h-3 w-10 rounded-lg opacity-40" />
                </div>
                <Skeleton className="h-2 w-full rounded-full opacity-30" />
              </div>
            </div>
            <div className="flex gap-3 pt-6 border-t border-border/5">
              <Skeleton className="h-11 flex-1 rounded-xl opacity-60" />
              <Skeleton className="h-11 w-11 rounded-xl opacity-50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={cn("space-y-8", className)}>
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-14 w-80 rounded-2xl" />
          <Skeleton className="h-14 w-40 rounded-2xl" />
        </div>
        <div className="border border-border/20 rounded-[2rem] overflow-hidden shadow-none bg-card/10 backdrop-blur-sm">
          <div className="bg-muted/30 p-6 border-b border-border/10">
            <div className="grid grid-cols-4 gap-8">
              <Skeleton className="h-5 w-32 rounded-lg" />
              <Skeleton className="h-5 w-32 rounded-lg" />
              <Skeleton className="h-5 w-32 rounded-lg" />
              <Skeleton className="h-5 w-32 rounded-lg" />
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-6 border-b border-border/5 last:border-0">
              <div className="grid grid-cols-4 gap-8 items-center">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-6 w-28 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-12 w-32 rounded-xl ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={cn("space-y-5", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 p-6 card-standard rounded-[2rem] bg-card/30 border-none shadow-none ring-1 ring-black/[0.02] dark:ring-white/[0.02]">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-1/5 rounded-lg" />
              <Skeleton className="h-4 w-1/3 rounded-lg" />
            </div>
            <Skeleton className="h-12 w-28 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'page') {
    return (
      <div className={cn("space-y-12 animate-in fade-in duration-700", className)} aria-label={t('common.loading', 'Carregando...')}>
        <div className="space-y-5">
          <Skeleton className="h-16 w-1/3 rounded-2xl" />
          <Skeleton className="h-8 w-1/2 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-48 rounded-[2rem]" />
          <Skeleton className="h-48 rounded-[2rem]" />
          <Skeleton className="h-48 rounded-[2rem]" />
        </div>
        <Skeleton className="h-[600px] rounded-[3.5rem] w-full" />
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", className)} aria-label={t('common.loading', 'Carregando protocolo...')}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  );
}

