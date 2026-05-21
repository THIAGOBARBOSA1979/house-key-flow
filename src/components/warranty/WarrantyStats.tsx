
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatusStats {
  critical: number;
  pending: number;
  progress: number;
  complete: number;
}

interface WarrantyStatsProps {
  stats: StatusStats;
}

export const WarrantyStats = ({ stats }: WarrantyStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Solicitações críticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Badge variant="destructive" className="h-8 w-8 rounded-full p-1.5 flex items-center justify-center">
              {stats.critical}
            </Badge>
            <div className="text-2xl font-bold">{stats.critical}</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="bg-amber-500 h-8 w-8 rounded-full p-1.5 flex items-center justify-center">
              {stats.pending}
            </Badge>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Em andamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="bg-blue-500 h-8 w-8 rounded-full p-1.5 flex items-center justify-center">
              {stats.progress}
            </Badge>
            <div className="text-2xl font-bold">{stats.progress}</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Concluídas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="bg-green-500 h-8 w-8 rounded-full p-1.5 flex items-center justify-center">
              {stats.complete}
            </Badge>
            <div className="text-2xl font-bold">{stats.complete}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
