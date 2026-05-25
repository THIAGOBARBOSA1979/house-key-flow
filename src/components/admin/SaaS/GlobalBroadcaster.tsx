import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Megaphone, 
  Send, 
  Users, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks";
import { cn } from "@/lib/utils";

export const GlobalBroadcaster = () => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("all");
  const [severity, setSeverity] = useState("info");

  const [history, setHistory] = useState([
    { 
      id: 1, 
      title: "Manutenção Programada", 
      sentAt: new Date(Date.now() - 86400000).toISOString(), 
      target: "all", 
      status: "delivered",
      reach: 142
    },
    { 
      id: 2, 
      title: "Novos Módulos de Garantia", 
      sentAt: new Date(Date.now() - 432000000).toISOString(), 
      target: "admins", 
      status: "delivered",
      reach: 28
    }
  ]);

  const handleSend = () => {
    if (!title || !message) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e mensagem são necessários para o broadcast.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    // Simulating API call
    setTimeout(() => {
      const newBroadcast = {
        id: Date.now(),
        title,
        sentAt: new Date().toISOString(),
        target,
        status: "delivered",
        reach: target === 'all' ? 150 : 30
      };
      setHistory([newBroadcast, ...history]);
      setTitle("");
      setMessage("");
      setIsSending(false);
      toast({
        title: "Broadcast Enviado",
        description: "A notificação global foi enviada com sucesso para os canais selecionados.",
      });
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="lg:col-span-2 rounded-[2.5rem] border-none bg-card/40 backdrop-blur-md shadow-sem-lg overflow-hidden">
        <CardHeader className="p-8">
          <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
            <Megaphone className="text-primary" /> Transmissão Global (Broadcaster)
          </CardTitle>
          <CardDescription>Envie comunicações estratégicas e alertas de sistema para todos os tenants.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Público-Alvo</label>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger className="h-12 rounded-xl bg-background border-border/10 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Usuários</SelectItem>
                  <SelectItem value="admins">Apenas Admins</SelectItem>
                  <SelectItem value="clients">Apenas Clientes</SelectItem>
                  <SelectItem value="technical">Equipe Técnica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Severidade</label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="h-12 rounded-xl bg-background border-border/10 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Informativo</SelectItem>
                  <SelectItem value="warning">Aviso / Alerta</SelectItem>
                  <SelectItem value="critical">Crítico / Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Título do Comunicado</label>
            <Input 
              placeholder="Ex: Atualização do Módulo de Vistorias" 
              className="h-12 rounded-xl bg-background border-border/10 font-bold"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Conteúdo da Mensagem</label>
            <Textarea 
              placeholder="Descreva aqui o comunicado que será enviado para os usuários..." 
              className="min-h-[150px] rounded-2xl bg-background border-border/10 p-4 font-medium"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/10">
            <Button variant="outline" className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px]">
              Agendar para Depois
            </Button>
            <Button 
              onClick={handleSend}
              disabled={isSending}
              className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
            >
              {isSending ? "Processando..." : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Disparar Agora
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-none bg-card/40 backdrop-blur-md shadow-sem-lg overflow-hidden flex flex-col">
        <CardHeader className="p-8">
          <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
            <Clock className="text-primary" /> Histórico Recente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-4 flex-1">
          {history.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl bg-muted/20 border border-border/5 space-y-3 group hover:bg-muted/30 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm leading-tight mb-1">{item.title}</h4>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Enviado em: {new Date(item.sentAt).toLocaleDateString()} às {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-black uppercase">
                  OK
                </Badge>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                <div className="flex items-center gap-3">
                   <span className="flex items-center gap-1.5"><Users size={12} /> {item.reach}</span>
                   <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> {item.target}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-muted-foreground/30 hover:text-destructive transition-colors">
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          ))}

          {history.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 opacity-20">
              <AlertCircle size={40} className="mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">Nenhum registro</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
