
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Star, Clock, Archive, AlertTriangle, TrendingUp } from "lucide-react";
import { documentService } from "@/services/DocumentService";
import { StatsCard } from "@/components/shared/StatsCard";

export function DocumentsDashboard() {
  const stats = documentService.getDocumentStats();
  const expiringDocs = documentService.getExpiringDocuments();
  const favoriteDocs = documentService.getFavoriteDocuments();

  return (
    <div className="space-y-6">
      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          label="Total Arquivos" 
          value={stats.total} 
          icon={FileText} 
          variant="brand" 
          description="Contratos e licenças"
        />
        <StatsCard 
          label="Publicados" 
          value={stats.published} 
          icon={TrendingUp} 
          variant="complete" 
          description="Visíveis para clientes"
        />
        <StatsCard 
          label="Favoritos" 
          value={stats.favorites} 
          icon={Star} 
          variant="pending" 
          description="Acesso rápido"
        />
        <StatsCard 
          label="Vencendo" 
          value={stats.expiring} 
          icon={AlertTriangle} 
          variant="critical" 
          description="Próximos 30 dias"
        />
      </div>

      {/* Documentos por categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos por Categoria</CardTitle>
          <CardDescription>Distribuição dos documentos por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium text-xs uppercase tracking-tight">{category}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Documentos favoritos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Documentos Favoritos
            </CardTitle>
            <CardDescription>Seus documentos marcados como favoritos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {favoriteDocs.slice(0, 3).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.downloads} downloads</p>
                  </div>
                  <Badge variant="outline">{doc.category}</Badge>
                </div>
              ))}
              {favoriteDocs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum documento favorito
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documentos vencendo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Documentos Vencendo
            </CardTitle>
            <CardDescription>Documentos que vencem nos próximos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringDocs.slice(0, 3).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Vence em {doc.expiresAt?.toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="destructive">Urgente</Badge>
                </div>
              ))}
              {expiringDocs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum documento vencendo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
