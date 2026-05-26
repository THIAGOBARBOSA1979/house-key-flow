import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Fingerprint, Globe, Monitor, Terminal, MapPin, Share2, Link } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  User, 
  Shield, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Activity, 
  Filter, 
  RotateCcw, 
  Maximize2,
  Database,
  Calendar,
  Clock as ClockIcon,
  Tag,
  Hash
} from "lucide-react";
import { isValid } from "date-fns";
import { cn, safeFormat } from "@/lib/utils";
import { auditLogService, AuditLogEntry, AuditEntityType, AuditAction } from "@/services";
import { exportService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable } from "@/components/shared/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Code, Eye, FileJson, Copy, Check } from "lucide-react";

interface AuditLogViewerProps {
  entityType?: AuditEntityType;
  entityId?: string;
  title?: string;
  compact?: boolean;
  className?: string;
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
  payment_received: "Pagamento Recebido",
  invoice_issued: "Fatura Emitida",
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
  payment_received: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  invoice_issued: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const ITEMS_PER_PAGE = 10;

const SEVERITY_LABELS = {
  info: "Informativo",
  warning: "Aviso",
  critical: "Crítico",
  debug: "Debug"
};

const SEVERITY_COLORS = {
  info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  critical: "bg-red-500/10 text-red-600 border-red-500/20",
  debug: "bg-slate-500/10 text-slate-600 border-slate-500/20"
};

export const AuditLogViewer = ({ entityType, entityId, title, compact = false, className }: AuditLogViewerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterEntityType, setFilterEntityType] = useState<string>(entityType || "all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>(compact ? 'timeline' : 'table');
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    const handleNewLog = () => setUpdateTrigger(prev => prev + 1);
    window.addEventListener('a2_audit_log_created', handleNewLog);
    return () => window.removeEventListener('a2_audit_log_created', handleNewLog);
  }, []);

  const { user } = useAuth();
  
  const filteredLogs = useMemo(() => {
    return auditLogService.getFilteredLogs({
      searchTerm,
      action: filterAction,
      role: filterRole,
      entityType: filterEntityType,
      entityId,
      severity: filterSeverity === 'all' ? undefined : filterSeverity,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      companyId: user?.company_id,
      isSuperAdmin: user?.is_super_admin
    });
  }, [searchTerm, filterAction, filterRole, filterEntityType, entityId, filterSeverity, dateFrom, dateTo, user?.company_id, user?.is_super_admin]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const paginatedLogs = filteredLogs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <Card className={cn("border-none bg-card/50 backdrop-blur-sm shadow-sem-sm", className)}>
        <CardHeader className={compact ? "pb-3" : "pb-4 border-b border-border/10"}>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              {title || "AuditLog de Governança Digital"}
            </CardTitle>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-muted/20 p-1 rounded-xl border border-border/10">
                <Button 
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="h-7 px-3 rounded-lg text-[10px] font-black uppercase tracking-tight"
                  onClick={() => setViewMode('table')}
                >
                  Tabela
                </Button>
                <Button 
                  variant={viewMode === 'timeline' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="h-7 px-3 rounded-lg text-[10px] font-black uppercase tracking-tight"
                  onClick={() => setViewMode('timeline')}
                >
                  Linha do Tempo
                </Button>
              </div>
              {!compact && (
                <Button variant="outline" size="sm" className="h-8 font-bold text-xs" onClick={() => {
                  exportService.exportToCSV(filteredLogs, "logs_auditoria_filtrados");
                }}>
                  <Download className="w-3 h-3 mr-2" /> Exportar Filtrados
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {/* Filters */}
          {!compact && (
            <div className="flex flex-col gap-4 p-4 bg-muted/5 rounded-xl border border-border/10 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por descrição, nome, ID da entidade ou transação..."
                    className="pl-10 h-11 bg-background rounded-xl"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterEntityType} onValueChange={setFilterEntityType}>
                  <SelectTrigger className="w-full sm:w-[150px] h-11 bg-background font-bold shadow-sem-sm">
                    <SelectValue placeholder="Entidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas entidades</SelectItem>
                    <SelectItem value="inspection">Vistorias</SelectItem>
                    <SelectItem value="warranty">Garantias</SelectItem>
                    <SelectItem value="property">Imóveis</SelectItem>
                    <SelectItem value="document">Documentos</SelectItem>
                    <SelectItem value="user">Usuários</SelectItem>
                    <SelectItem value="financial">Financeiro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="w-full sm:w-[140px] h-11 bg-background font-bold shadow-sem-sm">
                    <SelectValue placeholder="Ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas ações</SelectItem>
                    {Object.entries(ACTION_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-full sm:w-[130px] h-11 bg-background font-bold shadow-sem-sm">
                    <SelectValue placeholder="Severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Severidades</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Aviso</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-full sm:w-[130px] h-11 bg-background font-bold shadow-sem-sm">
                    <SelectValue placeholder="Perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos perfis</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2 flex-1 w-full">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="date" 
                    className="h-10 text-xs font-bold" 
                    value={dateFrom} 
                    onChange={e => setDateFrom(e.target.value)} 
                  />
                  <span className="text-muted-foreground font-black text-[10px] uppercase">até</span>
                  <Input 
                    type="date" 
                    className="h-10 text-xs font-bold" 
                    value={dateTo} 
                    onChange={e => setDateTo(e.target.value)} 
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 font-bold text-xs text-muted-foreground hover:text-primary"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterAction("all");
                    setFilterRole("all");
                    setFilterEntityType(entityType || "all");
                    setDateFrom("");
                    setDateTo("");
                  }}
                >
                  <RotateCcw className="w-3 h-3 mr-2" /> Limpar Filtros
                </Button>
              </div>
            </div>
          )}

          {/* Log entries */}
          {paginatedLogs.length > 0 ? (
            viewMode === 'table' ? (
              <DataTable
                columns={[
                  { 
                    header: "Data/Hora", 
                    accessorKey: "timestamp", 
                    sortable: true,
                    cell: (log: AuditLogEntry) => (
                      <span className="text-muted-foreground font-black tracking-tighter">
                        {safeFormat(log.timestamp, "dd/MM/yy HH:mm")}
                      </span>
                    ) 
                  },
                  { 
                    header: "Usuário", 
                    accessorKey: "performedByName",
                    sortable: true,
                    cell: (log: AuditLogEntry) => (
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                          {log.performedByRole === "admin" ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </div>
                        <span className="truncate max-w-[150px] font-bold text-foreground/80">{log.performedByName}</span>
                      </div>
                    )
                  },
                  { 
                    header: "Ação", 
                    accessorKey: "action",
                    sortable: true,
                    cell: (log: AuditLogEntry) => (
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary" className={cn("rounded-lg px-2 py-0.5 font-black uppercase tracking-widest text-[8px] border shadow-none", ACTION_COLORS[log.action as AuditAction])}>
                          {ACTION_LABELS[log.action as AuditAction] || log.action}
                        </Badge>
                        {log.severity && log.severity !== 'info' && (
                          <Badge variant="outline" className={cn("rounded-lg px-2 py-0.5 font-black uppercase tracking-widest text-[7px] border", SEVERITY_COLORS[log.severity])}>
                            {SEVERITY_LABELS[log.severity]}
                          </Badge>
                        )}
                      </div>
                    )
                  },
                  { 
                    header: "Entidade", 
                    accessorKey: "entityType",
                    className: "hidden lg:table-cell",
                    cell: (log: AuditLogEntry) => (
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{log.entityType}</span>
                        <span className="text-[9px] font-mono text-muted-foreground truncate max-w-[80px]">{log.entityId || '-'}</span>
                      </div>
                    )
                  },
                  { 
                    header: "Detalhes", 
                    accessorKey: "details",
                    className: "hidden md:table-cell max-w-[250px]",
                    cell: (log: AuditLogEntry) => (
                      <span className="text-muted-foreground truncate block italic font-medium">
                        {log.details}
                      </span>
                    )
                  },
                  {
                    header: "Ver",
                    accessorKey: "id",
                    className: "text-right",
                    cell: (log: AuditLogEntry) => (
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Maximize2 className="h-4.5 w-4.5" />
                        </Button>
                      </div>
                    )
                  }
                ]}
                data={paginatedLogs}
              />
            ) : (
              <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/10">
                {paginatedLogs.map((log, idx) => (
                  <div key={log.id} className="relative pl-12 group">
                    <div className={cn(
                      "absolute left-0 top-1 w-9 h-9 rounded-xl border-2 border-background flex items-center justify-center transition-all duration-300 z-10",
                      ACTION_COLORS[log.action]
                    )}>
                      {log.performedByRole === "admin" ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className="p-4 bg-muted/5 rounded-2xl border border-border/10 group-hover:bg-muted/10 group-hover:border-primary/30 group-hover:shadow-sem-md transition-all cursor-pointer" onClick={() => {
                      setSelectedLog(log);
                      setIsDetailOpen(true);
                    }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          {safeFormat(log.timestamp, "dd/MM/yyyy HH:mm:ss")}
                        </span>
                        <Badge variant="secondary" className={cn("rounded-lg px-2 py-0.5 font-black uppercase tracking-widest text-[8px] border shadow-none", ACTION_COLORS[log.action])}>
                          {ACTION_LABELS[log.action]}
                        </Badge>
                      </div>
                      <p className="text-sm font-bold text-foreground/80 mb-1">{log.details}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Por: {log.performedByName} ({log.performedByRole})</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12 bg-muted/5 rounded-2xl border border-dashed border-border/20">
              <Activity className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-sem-body-sm font-black uppercase tracking-widest text-muted-foreground/60">Nenhum evento registrado no período</p>

            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border/5">
              <span className="text-sm text-muted-foreground">
                {filteredLogs.length} registro(s)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm flex items-center px-2 font-bold">
                  {page}/{totalPages}
                </span>
                <Button
                  variant="outline" 
                  size="sm"
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

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden rounded-[2rem] border-none shadow-sem-xl bg-background/95 backdrop-blur-2xl">
          <DialogHeader className="px-10 pt-10 pb-8 bg-primary/5 border-b border-border/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex gap-2">
                <Badge variant="outline" className={cn("rounded-lg px-3 py-1 font-black uppercase tracking-widest text-[10px]", selectedLog && ACTION_COLORS[selectedLog.action as AuditAction])}>
                  {selectedLog && (ACTION_LABELS[selectedLog.action as AuditAction] || selectedLog.action)}
                </Badge>
                {selectedLog?.severity && (
                   <Badge variant="outline" className={cn("rounded-lg px-3 py-1 font-black uppercase tracking-widest text-[10px]", SEVERITY_COLORS[selectedLog.severity])}>
                    {SEVERITY_LABELS[selectedLog.severity]}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs uppercase tracking-widest">
                <ClockIcon size={14} className="opacity-50" />
                {selectedLog && safeFormat(selectedLog.timestamp, "dd/MM/yyyy HH:mm:ss")}
              </div>
            </div>
            <DialogTitle className="text-3xl font-black tracking-tighter leading-tight text-foreground/90">
              Detalhes do Evento
            </DialogTitle>
            <DialogDescription className="text-sem-body-sm font-bold text-muted-foreground mt-2">
              {selectedLog?.details}
            </DialogDescription>
          </DialogHeader>

          <div className="p-10 space-y-8">
          <Tabs defaultValue="overview" className="w-full">
            <div className="px-10 border-b border-border/10">
              <TabsList className="bg-transparent gap-6 h-14">
                <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-14 font-black uppercase tracking-widest text-[10px]">Visão Geral</TabsTrigger>
                <TabsTrigger value="trace" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-14 font-black uppercase tracking-widest text-[10px]">Rastreabilidade</TabsTrigger>
                <TabsTrigger value="raw" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-14 font-black uppercase tracking-widest text-[10px]">Dados Brutos</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-10 m-0 space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                    <User size={12} /> Responsável
                  </span>
                  <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-2xl border border-border/10">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">
                      {selectedLog?.performedByName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{selectedLog?.performedByName}</p>
                      <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">{selectedLog?.performedByRole}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                    <Tag size={12} /> Entidade Afetada
                  </span>
                  <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-2xl border border-border/10">
                    <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center font-black text-muted-foreground">
                      <Database size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-foreground uppercase tracking-tight">{selectedLog?.entityType}</p>
                      <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest truncate max-w-[150px]">ID: {selectedLog?.entityId}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-muted/10 rounded-xl border border-border/5 space-y-1">
                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 flex items-center gap-1.5"><Globe size={10} /> Origem</p>
                   <p className="text-xs font-bold uppercase">{selectedLog?.origin || 'Web-App'}</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-xl border border-border/5 space-y-1">
                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 flex items-center gap-1.5"><Terminal size={10} /> Ambiente</p>
                   <p className="text-xs font-bold uppercase text-emerald-600">{selectedLog?.environment || 'Production'}</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-xl border border-border/5 space-y-1">
                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 flex items-center gap-1.5"><Fingerprint size={10} /> Integridade</p>
                   <p className="text-[10px] font-mono truncate text-muted-foreground" title={selectedLog?.event_hash}>{selectedLog?.event_hash?.substring(0, 16)}...</p>
                </div>
              </div>

              {selectedLog?.previous_values && (
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                    <Activity size={12} /> Alteração Detectada
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-red-500/60 ml-2">Estado Anterior</p>
                      <ScrollArea className="h-[120px] w-full rounded-xl border border-red-500/10 bg-red-500/5 p-4">
                        <pre className="text-[10px] font-mono text-red-600/80">
                          {JSON.stringify(selectedLog.previous_values, null, 2)}
                        </pre>
                      </ScrollArea>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60 ml-2">Novo Estado</p>
                      <ScrollArea className="h-[120px] w-full rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
                        <pre className="text-[10px] font-mono text-emerald-600/80">
                          {JSON.stringify(selectedLog.payload, null, 2)}
                        </pre>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="trace" className="p-10 m-0 space-y-6 animate-in fade-in duration-500">
               <div className="space-y-6">
                  <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                      <Share2 size={24} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h4 className="font-black uppercase tracking-tight text-lg">Cadeia de Correlação</h4>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                        Este evento faz parte de uma sequência operacional maior. Use os IDs abaixo para reconstruir o fluxo completo.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="group flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/10 hover:border-primary/30 transition-all">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Correlation ID</p>
                        <p className="text-xs font-mono font-bold text-foreground/80">{selectedLog?.correlation_id || 'N/A'}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                        if (selectedLog?.correlation_id) {
                          setSearchTerm(selectedLog.correlation_id);
                          setIsDetailOpen(false);
                        }
                      }}>
                        <Link size={14} />
                      </Button>
                    </div>

                    <div className="group flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/10 hover:border-primary/30 transition-all">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Trace ID</p>
                        <p className="text-xs font-mono font-bold text-foreground/80">{selectedLog?.trace_id || 'N/A'}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                        if (selectedLog?.trace_id) {
                          setSearchTerm(selectedLog.trace_id);
                          setIsDetailOpen(false);
                        }
                      }}>
                        <Link size={14} />
                      </Button>
                    </div>

                    <div className="p-4 bg-muted/20 rounded-xl border border-border/10">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">IP de Origem / User Agent</p>
                        <p className="text-xs font-mono font-bold text-foreground/80">{selectedLog?.ip_address || '127.0.0.1'}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{selectedLog?.user_agent}</p>
                      </div>
                    </div>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="raw" className="p-10 m-0 animate-in fade-in duration-500">
               <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                  <Database size={12} /> Payload JSON Estruturado
                </span>
                <ScrollArea className="h-[350px] w-full rounded-2xl border border-border/10 bg-muted/10 p-6">
                  <pre className="text-xs font-mono leading-relaxed text-muted-foreground/80">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
          </div>

          <div className="p-10 pt-0 flex justify-end">
            <Button 
              onClick={() => setIsDetailOpen(false)}
              className="rounded-xl h-12 px-8 font-black uppercase text-[11px] tracking-widest shadow-lg shadow-primary/20"
            >
              Fechar Visualização
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};