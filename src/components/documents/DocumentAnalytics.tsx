
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { documentService } from "@/services";
import { TrendingUp, TrendingDown, Download, Star, Clock, FileText } from "lucide-react";

export function DocumentAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [s, d] = await Promise.all([
        documentService.getDocumentStats(),
        documentService.getAllDocuments()
      ]);
      setStats(s);
      setDocuments(d);
    };
    load();
  }, []);

  if (!stats) return null;
  
  // Calcular estatísticas adicionais
  const totalDownloads = documents.reduce((sum, doc) => sum + (doc.downloads || 0), 0);
  const avgDownloads = documents.length > 0 ? Math.round(totalDownloads / documents.length) : 0;
  const mostDownloaded = [...documents].sort((a, b) => (b.downloads || 0) - (a.downloads || 0))[0];
  
  const statusDistribution = [
    { status: 'published', label: 'Publicados', count: stats.published, color: 'bg-status-complete' },
    { status: 'draft', label: 'Rascunhos', count: stats.draft, color: 'bg-status-pending' },
    { status: 'archived', label: 'Arquivados', count: stats.archived, color: 'bg-muted-foreground' }
  ];

  const priorityStats = {
    high: documents.filter(d => d.priority === 'high').length,
    medium: documents.filter(d => d.priority === 'medium').length,
    low: documents.filter(d => d.priority === 'low').length
  };

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Downloads Totais</p>
                <p className="text-2xl font-bold">{totalDownloads}</p>
                <p className="text-xs text-muted-foreground">Média: {avgDownloads} por doc</p>
              </div>
              <Download className="h-8 w-8 text-brand" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mais Baixado</p>
                <p className="text-lg font-bold truncate">{mostDownloaded?.title || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">{mostDownloaded?.downloads || 0} downloads</p>
              </div>
              <TrendingUp className="h-8 w-8 text-status-complete" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</p>
                <p className="text-2xl font-bold">
                  {stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">{stats.published}/{stats.total}</p>
              </div>
              <Star className="h-8 w-8 text-status-pending" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Docs Vencendo</p>
                <p className="text-2xl font-bold text-red-600">{stats.expiring}</p>
                <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
              </div>
              <Clock className="h-8 w-8 text-status-critical" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por status */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusDistribution.map((item) => (
              <div key={item.status} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.label}</span>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
                <Progress 
                  value={stats.total > 0 ? (item.count / stats.total) * 100 : 0} 
                  className="h-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribuição por prioridade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Prioridade dos Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Alta Prioridade</span>
                <Badge variant="destructive">{priorityStats.high}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Média Prioridade</span>
                <Badge variant="default">{priorityStats.medium}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Baixa Prioridade</span>
                <Badge variant="secondary">{priorityStats.low}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents
                .sort((a, b) => b.downloads - a.downloads)
                .slice(0, 5)
                .map((doc, index) => (
                  <div key={doc.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <span className="text-sm truncate">{doc.title}</span>
                    </div>
                    <Badge variant="outline">{doc.downloads}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
