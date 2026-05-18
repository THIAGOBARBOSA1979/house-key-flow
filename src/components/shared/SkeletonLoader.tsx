
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  type: 'card' | 'table' | 'page' | 'list';
  count?: number;
  className?: string;
}

export function SkeletonLoader({ type, count = 3, className }: SkeletonLoaderProps) {
  if (type === 'card') {
    return (
      <div className={cn("grid-layout", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card-standard p-6-sem space-y-5-sem rounded-2xl bg-card/20 border-none shadow-none">
            <div className="flex items-center gap-4-sem">
              <Skeleton className="h-14 w-14 rounded-xl" />
              <div className="space-y-2-sem flex-1">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
            <div className="space-y-3-sem">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="flex justify-between items-center pt-4-sem border-t border-border/10">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={cn("space-y-6-sem", className)}>
        <div className="flex justify-between items-center mb-6-sem">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
        <div className="border border-border/20 rounded-2xl overflow-hidden shadow-none bg-card/10 backdrop-blur-sm">
          <div className="bg-muted/30 p-5-sem border-b border-border/10">
            <div className="grid grid-cols-4 gap-6-sem">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-5-sem border-b border-border/5 last:border-0">
              <div className="grid grid-cols-4 gap-6-sem">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-10 w-28 rounded-xl ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={cn("space-y-4-sem", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-5-sem p-5-sem card-standard rounded-2xl bg-card/20 border-none shadow-none">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-2-sem">
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'page') {
    return (
      <div className={cn("space-y-10-sem animate-in fade-in duration-500", className)}>
        <div className="space-y-4-sem">
          <Skeleton className="h-14 w-1/4 rounded-2xl" />
          <Skeleton className="h-7 w-1/2 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-layout-gap">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
        <Skeleton className="h-[500px] rounded-3xl w-full" />
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  );
}

