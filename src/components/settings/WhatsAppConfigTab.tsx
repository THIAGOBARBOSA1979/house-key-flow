import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, Save, Smartphone, ExternalLink, ShieldCheck, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { whatsappConfigService, WhatsAppConfig, WhatsAppProvider } from "@/services";
import { useAuth } from "@/contexts/AuthContext";

export const WhatsAppConfigTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<Partial<WhatsAppConfig>>({
    provider: 'evolution',
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!user?.company_id) return;
      try {
        const data = await whatsappConfigService.getConfigByCompany(user.company_id);
        if (data) setConfig(data);
      } catch (error) {
        console.error("Error loading WhatsApp config:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, [user]);

  const handleSave = async () => {
    if (!user?.company_id) return;
    setIsSaving(true);
    try {
      if (config.id) {
        await whatsappConfigService.update(config.id, config);
      } else {
        const newConfig = await whatsappConfigService.create({
          ...config as any,
          companyId: user.company_id
        }, user.company_id);
        setConfig(newConfig);
      }
      toast({ title: "Configuração salva", description: "As credenciais de WhatsApp foram atualizadas." });
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-12 text-center">Carregando...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/10 shadow-sem-lg rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand/10 rounded-2xl text-brand">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">Provedor de WhatsApp</CardTitle>
                  <CardDescription>Escolha como o sistema se conectará ao WhatsApp do cliente.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gateway Principal</Label>
                  <Select 
                    value={config.provider} 
                    onValueChange={(v: WhatsAppProvider) => setConfig({...config, provider: v})}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="evolution">Evolution API (Recomendado)</SelectItem>
                      <SelectItem value="meta">WhatsApp Cloud API (Oficial Meta)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border/5">
                  <div className="space-y-0.5">
                    <Label className="font-bold">Status da Integração</Label>
                    <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Habilitar envio/recebimento</p>
                  </div>
                  <Switch 
                    checked={config.isActive} 
                    onCheckedChange={(v) => setConfig({...config, isActive: v})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-dashed">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand flex items-center gap-2">
                  <ShieldCheck size={14} /> Credenciais do Gateway
                </h4>
                
                {config.provider === 'evolution' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">URL da API</Label>
                      <Input 
                        value={config.apiUrl || ''} 
                        onChange={e => setConfig({...config, apiUrl: e.target.value})}
                        placeholder="https://api.suaempresa.com"
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">Nome da Instância</Label>
                      <Input 
                        value={config.instanceName || ''} 
                        onChange={e => setConfig({...config, instanceName: e.target.value})}
                        placeholder="a2-suporte"
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-[10px] font-bold uppercase">Chave Global (API Key)</Label>
                      <Input 
                        type="password"
                        value={config.apiKey || ''} 
                        onChange={e => setConfig({...config, apiKey: e.target.value})}
                        placeholder="••••••••••••••••"
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">Phone Number ID</Label>
                      <Input 
                        value={config.phoneNumberId || ''} 
                        onChange={e => setConfig({...config, phoneNumberId: e.target.value})}
                        placeholder="Ex: 1092837465..."
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">Verify Token (Webhook)</Label>
                      <Input 
                        value={config.verifyToken || ''} 
                        onChange={e => setConfig({...config, verifyToken: e.target.value})}
                        placeholder="Token de segurança"
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-[10px] font-bold uppercase">System User Access Token</Label>
                      <Input 
                        type="password"
                        value={config.apiKey || ''} 
                        onChange={e => setConfig({...config, apiKey: e.target.value})}
                        placeholder="EAA..."
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6">
                <Button onClick={handleSave} disabled={isSaving} className="h-12 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-2 shadow-lg shadow-brand/20">
                  <Save size={16} /> {isSaving ? 'Salvando...' : 'Salvar Configuração'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-muted/10 border-dashed border-2 rounded-3xl p-6 text-center space-y-4">
            <Smartphone size={40} className="mx-auto text-muted-foreground/30" />
            <div className="space-y-1">
              <h4 className="font-bold">Status do Pareamento</h4>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 uppercase text-[9px] font-black tracking-widest">
                Aguardando Configuração
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Após salvar, você poderá ler o QR Code para parear o aparelho.</p>
            <Button variant="outline" className="w-full rounded-xl gap-2 font-bold text-xs h-11" disabled>
              <RefreshCw size={14} /> Atualizar Conexão
            </Button>
          </Card>

          <Card className="bg-brand text-brand-foreground rounded-3xl p-6 relative overflow-hidden group">
            <ShieldCheck size={120} className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500" />
            <h4 className="text-lg font-black tracking-tight mb-2">Por que Evolution API?</h4>
            <p className="text-xs font-medium opacity-80 leading-relaxed mb-4">
              Diferente da API oficial, a Evolution permite o uso de dispositivos físicos, o que reduz custos e facilita a gestão de chips pré-pagos para o suporte.
            </p>
            <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-lg text-[10px] font-black uppercase tracking-widest" asChild>
              <a href="https://evolution-api.com" target="_blank" rel="noreferrer">
                Documentação <ExternalLink size={12} className="ml-1" />
              </a>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
