
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, FileText, Printer, Download, MapPin, User, Calendar, Clock, AlertCircle } from "lucide-react";
import { WarrantyRequestFlow, WARRANTY_STAGES } from "@/types/warrantyFlow";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface TechnicalReportDialogProps {
  request: WarrantyRequestFlow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TechnicalReportDialog({ request, open, onOpenChange }: TechnicalReportDialogProps) {
  if (!request) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-sem-xl rounded-[2rem] bg-white print:shadow-none print:max-h-none">
        <div className="p-10 space-y-8 print:p-0">
          {/* Header do Laudo */}
          <div className="flex justify-between items-start border-b-2 border-primary/10 pb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-2xl">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Laudo Técnico de Assistência</h2>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Protocolo: #{request.id.split('-')[0].toUpperCase()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black uppercase text-muted-foreground">Data de Emissão</p>
              <p className="font-bold">{format(new Date(), "dd/MM/yyyy HH:mm")}</p>
            </div>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                <MapPin size={10} /> Empreendimento
              </p>
              <p className="font-bold">{request.propertyName}</p>
              <p className="text-xs text-muted-foreground">Unidade {request.unitNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                <User size={10} /> Solicitante
              </p>
              <p className="font-bold">{request.clientName}</p>
              <p className="text-xs text-muted-foreground">ID: {request.clientId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                <Calendar size={10} /> Abertura
              </p>
              <p className="font-bold">{format(new Date(request.createdAt), "dd/MM/yyyy")}</p>
              <p className="text-xs text-muted-foreground">SLA: {request.slaStatus === 'expired' ? 'Excedido' : 'No Prazo'}</p>
            </div>
          </div>

          {/* Descrição do Problema */}
          <div className="space-y-4 p-6 bg-muted/30 rounded-2xl border border-border/50">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <AlertCircle size={16} className="text-primary" /> 
              Descrição Técnica do Chamado
            </h3>
            <div className="space-y-2">
              <p className="text-base font-bold text-foreground">{request.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{request.description}</p>
            </div>
            <div className="flex gap-4 pt-2">
               <div className="flex-1">
                 <p className="text-[10px] font-black uppercase text-muted-foreground">Categoria</p>
                 <Badge variant="outline" className="mt-1 font-bold">{request.category}</Badge>
               </div>
               <div className="flex-1">
                 <p className="text-[10px] font-black uppercase text-muted-foreground">Prioridade</p>
                 <StatusBadge status={request.priority === 'high' ? 'critical' : request.priority === 'medium' ? 'warning' : 'success'} label={request.priority.toUpperCase()} size="sm" className="mt-1" />
               </div>
            </div>
          </div>

          {/* Itens Verificados */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest border-l-4 border-primary pl-3">Itens de Verificação e Status</h3>
            <div className="divide-y border rounded-2xl overflow-hidden">
              {request.problems?.map((prob, idx) => (
                <div key={prob.id} className="p-4 flex items-center justify-between bg-white">
                  <div className="flex gap-4 items-center">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                    <div>
                      <p className="font-bold text-sm">{prob.description}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">{prob.location}</p>
                    </div>
                  </div>
                  <Badge variant={prob.status === 'resolved' ? 'default' : 'outline'} className={cn("font-black text-[10px] uppercase", prob.status === 'resolved' ? "bg-emerald-500" : "text-amber-600 border-amber-200")}>
                    {prob.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Assinaturas */}
          <div className="grid grid-cols-2 gap-12 pt-12">
            <div className="text-center space-y-2">
              <div className="border-t-2 border-muted-foreground/30 pt-2 mx-4">
                <p className="text-xs font-black uppercase">Responsável Técnico</p>
                <p className="text-[10px] text-muted-foreground">{request.assignedToName || 'Nome do Técnico'}</p>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="border-t-2 border-muted-foreground/30 pt-2 mx-4">
                <p className="text-xs font-black uppercase">Assinatura do Cliente</p>
                <p className="text-[10px] text-muted-foreground">{request.clientName}</p>
              </div>
            </div>
          </div>

          {/* Rodapé do Laudo */}
          <div className="pt-8 text-center text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-50">
            A2 Gestão de Propriedades • Sistema de Assistência Técnica Digital • Documento gerado eletronicamente
          </div>
        </div>

        <DialogFooter className="p-8 bg-muted/10 border-t border-border/50 gap-3 print:hidden">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl h-12 font-bold">Fechar</Button>
          <Button variant="outline" className="rounded-xl h-12 gap-2 font-bold" onClick={() => window.alert("Simulando download de PDF...")}>
            <Download size={18} /> Baixar PDF
          </Button>
          <Button onClick={handlePrint} className="rounded-xl h-12 gap-2 font-black uppercase text-[11px] tracking-widest shadow-lg shadow-primary/20">
            <Printer size={18} /> Imprimir Laudo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
