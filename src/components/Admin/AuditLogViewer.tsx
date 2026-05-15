import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, User, Shield, ChevronLeft, ChevronRight, Download, Activity, Filter, RotateCcw, Maximize2 } from "lucide-react";
import { isValid } from "date-fns";
import { cn, safeFormat } from "@/lib/utils";
import { auditLogService, AuditLogEntry, AuditEntityType, AuditAction } from "@/services/AuditLogService";
import { exportService } from "@/services/ExportService";

interface AuditLogViewerProps {
  entityType?: AuditEntityType;
  entityId?: string;
  title?: string;
  compact?: boolean;
}

const ACTION_LABELS: Record<AuditAction, string> = {
  created: "Criação",
  updated: "Atualização",
  accepted: "Aprovação",
  rejected: "Recusa",
  scheduled: "Agendamento",
  completed: "Conclusão",
  cancelled: "Cancelamento",
  stage_changed: "Etapa Alterada",
  comment_added: "Comentário",
  info_added: "Info Adicional",
  assigned: "Atribuição",
  exported: "Exportação",
  logged_in: "Login",
  logged_out: "Logout",
  settings_updated: "Configuração",
  downloaded: "Download",
  archived: "Arquivamento",
  published: "Publicação",
  favorited: "Favoritado",
  deleted: "Exclusão",
  viewed: "Visualização",
};

const ACTION_COLORS: Record<AuditAction, string> = {
  created: "bg-status-complete/10 text-status-complete border-status-complete/20",
  updated: "bg-status-progress/10 text-status-progress border-status-progress/20",
  accepted: "bg-status-complete/10 text-status-complete border-status-complete/20",
  rejected: "bg-status-critical/10 text-status-critical border-status-critical/20",
  scheduled: "bg-status-pending/10 text-status-pending border-status-pending/20",
  completed: "bg-status-complete/10 text-status-complete border-status-complete/20",
  cancelled: "bg-status-critical/10 text-status-critical border-status-critical/20",
  stage_changed: "bg-status-pending/10 text-status-pending border-status-pending/20",
  comment_added: "bg-muted text-muted-foreground border-border",
  info_added: "bg-status-progress/10 text-status-progress border-status-progress/20",
  assigned: "bg-brand/10 text-brand border-brand/20",
  exported: "bg-status-progress/10 text-status-progress border-status-progress/20",
  logged_in: "bg-status-complete/10 text-status-complete border-status-complete/20",
  logged_out: "bg-muted text-muted-foreground border-border",
  settings_updated: "bg-brand/10 text-brand border-brand/20",
  downloaded: "bg-status-progress/10 text-status-progress border-status-progress/20",
  archived: "bg-muted text-muted-foreground border-border",
  published: "bg-status-complete/10 text-status-complete border-status-complete/20",
  favorited: "bg-status-pending/10 text-status-pending border-status-pending/20",
  deleted: "bg-status-critical/10 text-status-critical border-status-critical/20",
  viewed: "bg-muted text-muted-foreground border-border",
};

const ITEMS_PER_PAGE = 10;

export const AuditLogViewer = ({ entityType, entityId, title, compact = false }: AuditLogViewerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [page, setPage] = useState(1);

  const allLogs = useMemo(() => {
    if (entityType && entityId) return auditLogService.getLogsByEntity(entityType, entityId);
    if (entityType) return auditLogService.getLogsByEntity(entityType);
    return auditLogService.getAllLogs();
  }, [entityType, entityId]);

  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      const matchesSearch = !searchTerm || 
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.performedByName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = filterAction === "all" || log.action === filterAction;
      const matchesRole = filterRole === "all" || log.performedByRole === filterRole;
      return matchesSearch && matchesAction && matchesRole;
    });
  }, [allLogs, searchTerm, filterAction, filterRole]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const paginatedLogs = filteredLogs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sem-sm">
      <CardHeader className={compact ? "pb-3" : "pb-4 border-b border-border/10"}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            {title || "Logs de Auditoria"}
          </CardTitle>
          {!compact && (
            <Button variant="outline" size="sm" className="h-8 font-bold text-xs" onClick={() => {
              exportService.exportToCSV(allLogs, "logs_auditoria");
            }}>
              <Download className="w-3 h-3 mr-2" /> Exportar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        {!compact && (
          <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/5 rounded-xl border border-border/10 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar nos logs..."
                className="pl-10 h-11 bg-background"
              />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-full sm:w-[160px] h-11 bg-background font-bold shadow-sem-sm">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {Object.entries(ACTION_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-[140px] h-11 bg-background font-bold shadow-sem-sm">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="client">Cliente</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Log entries */}
        {paginatedLogs.length > 0 ? (
          <div className="border border-border/10 rounded-2xl overflow-hidden shadow-sem-sm bg-background/50">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border/10">
                <tr>
                  <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data/Hora</th>
                  <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Usuário</th>
                  <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ação</th>
                  <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden md:table-cell">Detalhes</th>
                  <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedLogs.map(log => (
                  <tr key={log.id} className="group hover:bg-muted/30 transition-all border-b border-border/5 last:border-0">
                    <td className="py-4 px-6 text-muted-foreground whitespace-nowrap font-medium">
                      {safeFormat(log.timestamp, "dd/MM/yy HH:mm")}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {log.performedByRole === "admin" ? (
                            <Shield className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                        <span className="truncate max-w-[150px] font-bold text-foreground/80">{log.performedByName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="secondary" className={cn("rounded-lg px-3 py-1", ACTION_COLORS[log.action])}>
                        {ACTION_LABELS[log.action]}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell text-muted-foreground truncate max-w-[350px]">
                      {log.details}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary hover:text-white shadow-none active:scale-95 transition-all">
                        <Maximize2 className="h-4.5 w-4.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum log encontrado.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {filteredLogs.length} registro(s)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline" size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm flex items-center px-2">
                {page}/{totalPages}
              </span>
              <Button
                variant="outline" size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
