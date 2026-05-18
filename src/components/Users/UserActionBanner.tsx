import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface UserActionBannerProps {
  stats: { total: number };
  children: ReactNode;
}

export const UserActionBanner = ({ stats, children }: UserActionBannerProps) => {
  return (
    <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-black">U{i}</div>
              ))}
              <div className="w-9 h-9 rounded-full border-2 border-background bg-primary text-white flex items-center justify-center text-[10px] font-black">+{Math.max(0, stats.total - 3)}</div>
            </div>
            <p className="text-sem-body-sm font-bold text-muted-foreground tracking-tight">Gestão centralizada de permissões</p>
          </div>
          {children}
        </div>
      </CardContent>
    </Card>
  );
};
