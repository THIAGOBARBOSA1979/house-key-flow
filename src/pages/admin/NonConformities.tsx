import { useState } from "react";
import { AlertTriangle, Plus, CheckCircle2, Search, Filter, Calendar as CalendarIcon, FileText, ArrowRight } from "lucide-react";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataView } from "@/components/shared/DataView";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { nonConformityService } from "@/services/operations/NonConformityService";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const NonConformities = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: nonConformities = [], isLoading, error, refetch } = useQuery({
    queryKey: ['non-conformities', user?.company_id],
    queryFn: async () => {
      return await nonConformityService.getAll(user?.company_id, user?.is_super_admin);
    },
    enabled: !!user
  });

  const { data: metrics } = useQuery({
    queryKey: ['non-conformities-metrics', user?.company_id],
    queryFn: async () => {
      return await nonConformityService.getMetrics(user?.company_id, user?.is_super_admin);
    },
    enabled: !!user && nonConformities.length > 0
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const actions = (
    <Button className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
      <Plus className="mr-2 h-4 w-4" strokeWidth={3} />
      Nova Não Conformidade
    </Button>
  );

  return (
    <PageTemplate
      title="Gestão de Não Conformidades"
      description="Rastreabilidade e controle de falhas em conformidade com ISO 9001 e ABNT."
      icon={AlertTriangle}
      actions={actions}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-none bg-primary/5 shadow-none">
          <CardContent className="pt-6">
            <div className="text-3xl font-black">{nonConformities.length}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total de Registros</div>
          </CardContent>
        </Card>
        <Card className="border-none bg-orange-500/10 shadow-none">
          <CardContent className="pt-6">
            <div className="text-3xl font-black text-orange-600">{nonConformities.filter((n: any) => n.status === 'open').length}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-orange-600">Em Aberto</div>
          </CardContent>
        </Card>
        <Card className="border-none bg-blue-500/10 shadow-none">
          <CardContent className="pt-6">
            <div className="text-3xl font-black text-blue-600">{nonConformities.filter((n: any) => n.status === 'corrective_action').length}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-blue-600">Ação Corretiva</div>
          </CardContent>
        </Card>
        <Card className="border-none bg-emerald-500/10 shadow-none">
          <CardContent className="pt-6">
            <div className="text-3xl font-black text-emerald-600">{nonConformities.filter((n: any) => n.status === 'closed').length}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Concluídas</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por título ou descrição..." 
            className="pl-10 h-12 rounded-xl border-border/40 focus:border-primary/40 bg-white/50 dark:bg-black/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-xl border-border/40 font-bold">
          <Filter className="mr-2 h-4 w-4" /> Filtros Avançados
        </Button>
      </div>

      <DataView
        items={nonConformities.filter((n: any) => 
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          n.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        isLoading={isLoading}
        isError={!!error}
        error={error ? { message: (error as any).message, retry: () => refetch() } : undefined}
        viewMode="table"
        columns={[
          {
            header: "ID / Identificação",
            accessorKey: "title",
            cell: (n: any) => (
              <div className="flex flex-col">
                <span className="font-bold">{n.title}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">#{n.id.substring(0, 8)}</span>
              </div>
            )
          },
          {
            header: "Origem",
            accessorKey: "origin",
            cell: (n: any) => (
              <Badge variant="outline" className="text-[10px] font-bold uppercase border-primary/20 bg-primary/5">
                {n.origin === 'inspection' ? 'Vistoria' : 
                 n.origin === 'warranty' ? 'Garantia' : 
                 n.origin === 'audit' ? 'Auditoria' : 'Reclamação'}
              </Badge>
            )
          },
          {
            header: "Severidade",
            accessorKey: "severity",
            cell: (n: any) => (
              <Badge className={`text-[10px] font-black uppercase tracking-widest ${getSeverityColor(n.severity)}`}>
                {n.severity}
              </Badge>
            )
          },
          {
            header: "Data Identificada",
            accessorKey: "identified_at",
            cell: (n: any) => (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="h-3 w-3" />
                <span className="text-[11px] font-bold">
                  {n.identifiedAt ? format(new Date(n.identifiedAt), "dd MMM yyyy", { locale: ptBR }) : 'N/A'}
                </span>
              </div>
            )
          },
          {
            header: "Status",
            accessorKey: "status",
            cell: (n: any) => (
              <StatusBadge status={n.status === 'closed' ? 'complete' : n.status === 'corrective_action' ? 'in_progress' : 'pending'} />
            )
          },
          {
            header: "Ações",
            accessorKey: "id",
            className: "text-right",
            cell: (n: any) => (
              <Button variant="ghost" size="sm" className="font-bold text-primary">
                Ver Detalhes <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            )
          }
        ]}
      />
    </PageTemplate>
  );
};

export default NonConformities;