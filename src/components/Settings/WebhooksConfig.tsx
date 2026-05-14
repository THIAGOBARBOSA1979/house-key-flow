
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Save, Check, X, AlertTriangle, Webhook } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const eventTypes = [
  { id: "property_created", name: "Criação de novo empreendimento" },
  { id: "warranty_created", name: "Nova solicitação de garantia registrada" },
  { id: "client_created", name: "Novo cliente cadastrado" },
  { id: "inspection_scheduled", name: "Vistoria agendada" },
  { id: "inspection_completed", name: "Vistoria concluída" },
  { id: "warranty_status_updated", name: "Atualização de status de garantia" },
  { id: "warranty_in_progress", name: "Garantia em atendimento" },
  { id: "warranty_completed", name: "Garantia concluída" },
];

const httpMethods = ["POST", "PUT"];

const initialWebhooks = [
  {
    id: "1",
    name: "Notificação de nova garantia",
    eventType: "warranty_created",
    url: "https://api.example.com/webhooks/warranty",
    method: "POST",
    headers: '{"Authorization": "Bearer {token}"}',
    bodyTemplate: '{"event": "{event}", "data": "{data}"}',
    active: true,
    retryCount: 3,
  },
  {
    id: "2",
    name: "Atualização de sistema externo",
    eventType: "warranty_status_updated",
    url: "https://external-system.com/api/update",
    method: "PUT",
    headers: '{"Authorization": "Bearer {token}", "Content-Type": "application/json"}',
    bodyTemplate: '{"status": "{status}", "id": "{id}", "timestamp": "{timestamp}"}',
    active: true,
    retryCount: 5,
  },
];

const WebhooksConfig = () => {
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [newWebhook, setNewWebhook] = useState({
    id: "",
    name: "",
    eventType: "",
    url: "",
    method: "POST",
    headers: '{"Authorization": "Bearer {token}"}',
    bodyTemplate: '{"event": "{event}", "data": "{data}"}',
    active: true,
    retryCount: 3,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTestResultOpen, setIsTestResultOpen] = useState(false);
  const [testResult, setTestResult] = useState({ success: false, message: "" });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewWebhook((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewWebhook((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewWebhook((prev) => ({ ...prev, active: checked }));
  };

  const handleRetryCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setNewWebhook((prev) => ({ ...prev, retryCount: value }));
    }
  };

  const handleSaveWebhook = () => {
    if (!newWebhook.name || !newWebhook.eventType || !newWebhook.url) {
      toast({ title: "Campos obrigatórios", description: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    try {
      JSON.parse(newWebhook.headers);
      JSON.parse(newWebhook.bodyTemplate);

      const webhookToSave = { ...newWebhook, id: newWebhook.id || Date.now().toString() };

      if (newWebhook.id) {
        setWebhooks((prev) => prev.map((wh) => (wh.id === newWebhook.id ? webhookToSave : wh)));
        toast({ title: "Webhook atualizado" });
      } else {
        setWebhooks((prev) => [...prev, webhookToSave]);
        toast({ title: "Webhook criado" });
      }

      setNewWebhook({
        id: "", name: "", eventType: "", url: "", method: "POST",
        headers: '{"Authorization": "Bearer {token}"}',
        bodyTemplate: '{"event": "{event}", "data": "{data}"}',
        active: true, retryCount: 3,
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: "Formato inválido", description: "JSON inválido em headers ou body", variant: "destructive" });
    }
  };

  const handleEditWebhook = (webhook: any) => {
    setNewWebhook(webhook);
    setIsDialogOpen(true);
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((wh) => wh.id !== id));
    toast({ title: "Webhook removido" });
  };

  const handleToggleActive = (id: string) => {
    setWebhooks((prev) => prev.map((wh) => wh.id === id ? { ...wh, active: !wh.active } : wh));
  };

  const handleTestWebhook = (webhook: any) => {
    setTimeout(() => {
      const success = Math.random() > 0.3;
      setTestResult({
        success,
        message: success ? "Webhook testado com sucesso. Resposta: 200 OK" : "Erro ao testar webhook. Resposta: 404 Not Found",
      });
      setIsTestResultOpen(true);
    }, 1000);
  };

  return (
    <div className="space-y-6 focus-visible:outline-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-h4 font-bold">Webhooks Configurados</h3>
          <p className="text-sem-body-sm text-muted-foreground font-medium">Integre eventos do sistema com suas ferramentas externas em tempo real.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-lg font-bold bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Novo Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{newWebhook.id ? "Editar Webhook" : "Novo Webhook"}</DialogTitle>
              <DialogDescription>Configure as integrações via HTTP callback.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Amigável</Label>
                <Input id="name" name="name" value={newWebhook.name} onChange={handleInputChange} placeholder="Ex: Slack Devs" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventType">Evento Gatilho</Label>
                  <Select value={newWebhook.eventType} onValueChange={(value) => handleSelectChange("eventType", value)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>{eventTypes.map((event) => (<SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Método</Label>
                  <Select value={newWebhook.method} onValueChange={(value) => handleSelectChange("method", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{httpMethods.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL do Endpoint</Label>
                <Input id="url" name="url" value={newWebhook.url} onChange={handleInputChange} placeholder="https://api.empresa.com/webhook" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="headers">Headers Customizados (JSON)</Label>
                <Textarea id="headers" name="headers" value={newWebhook.headers} onChange={handleInputChange} rows={3} className="font-mono text-xs" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bodyTemplate">Template do Corpo (JSON)</Label>
                <Textarea id="bodyTemplate" name="bodyTemplate" value={newWebhook.bodyTemplate} onChange={handleInputChange} rows={3} className="font-mono text-xs" />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div className="space-y-0.5">
                  <Label>Status do Webhook</Label>
                  <p className="text-sem-tiny text-muted-foreground">O webhook está {newWebhook.active ? 'habilitado' : 'desativado'}</p>
                </div>
                <Switch checked={newWebhook.active} onCheckedChange={handleSwitchChange} />
              </div>
            </div>

            <DialogFooter className="flex justify-between gap-3 pt-6 border-t border-border/10">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-lg font-bold">Cancelar</Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => handleTestWebhook(newWebhook)} className="rounded-lg font-bold">Testar Conexão</Button>
                <Button type="button" onClick={handleSaveWebhook} className="rounded-lg font-bold bg-primary hover:bg-primary/90">
                  <Save className="mr-2 h-4 w-4" /> Salvar Webhook
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {webhooks.length > 0 ? (
          webhooks.map((webhook) => (
            <Card key={webhook.id} className="card-standard border-none bg-card/50 backdrop-blur-sm overflow-hidden group">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-label font-bold group-hover:text-primary transition-colors">{webhook.name}</h4>
                    <Badge variant="outline" className={cn(
                      "text-sem-tiny font-black uppercase rounded-lg",
                      webhook.active ? "bg-status-complete/10 text-status-complete border-status-complete/20" : "bg-muted text-muted-foreground"
                    )}>
                      {webhook.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sem-tiny text-muted-foreground font-bold uppercase tracking-tighter">
                      {eventTypes.find((e) => e.id === webhook.eventType)?.name}
                    </p>
                    <p className="text-sem-body-sm text-primary font-medium truncate max-w-md">
                      {webhook.url}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 md:pl-4 md:border-l md:border-border/10">
                  <Button size="sm" variant="ghost" className="rounded-lg h-9 font-bold text-xs" onClick={() => handleToggleActive(webhook.id)}>
                    {webhook.active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg h-9 font-bold text-xs" onClick={() => handleTestWebhook(webhook)}>Testar</Button>
                  <Button size="sm" variant="outline" className="rounded-lg h-9 font-bold text-xs" onClick={() => handleEditWebhook(webhook)}>Editar</Button>
                  <Button size="icon" variant="ghost" className="rounded-lg h-9 w-9 text-status-critical hover:bg-status-critical/10" onClick={() => handleDeleteWebhook(webhook.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-border/10 rounded-xl bg-muted/5 animate-fade-in">
            <Webhook className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <h4 className="text-label font-bold text-muted-foreground">Nenhum webhook configurado</h4>
            <p className="text-sem-body-sm text-muted-foreground/60">Adicione uma integração para começar a receber eventos.</p>
          </div>
        )}
      </div>

      <Dialog open={isTestResultOpen} onOpenChange={setIsTestResultOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Resultado do Teste</DialogTitle></DialogHeader>
          <div className="py-6">
            <div className={cn("flex items-center gap-3 p-4 rounded-xl border", testResult.success ? "bg-status-complete/5 border-status-complete/20 text-status-complete" : "bg-status-critical/5 border-status-critical/20 text-status-critical")}>
              {testResult.success ? <Check className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              <p className="text-sem-body-sm font-bold">{testResult.message}</p>
            </div>
          </div>
          <DialogFooter><Button type="button" onClick={() => setIsTestResultOpen(false)} className="rounded-lg font-bold">Fechar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebhooksConfig;
