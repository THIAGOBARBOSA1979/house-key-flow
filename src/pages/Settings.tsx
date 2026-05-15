
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Building, Bell, ShieldCheck, User, Lock, Webhook, FileText, Mail, Trash2, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { useToast } from "@/components/ui/use-toast";
import WebhooksConfig from "@/components/Settings/WebhooksConfig";
import { AuditLogViewer } from "@/components/Admin/AuditLogViewer";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { systemSettingsService, SystemSettings } from "@/services/SystemSettingsService";

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings>(systemSettingsService.getSettings());

  const handleSaveSettings = () => {
    systemSettingsService.updateSettings(settings);
    toast({
      title: "Configurações salvas",
      description: "Suas alterações foram salvas com sucesso."
    });
  };

  const updateSection = (section: keyof SystemSettings, data: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        icon={SettingsIcon}
        title="Configurações do Sistema"
        description="Gerencie as regras de negócio, identidade visual e integrações da plataforma."
      />

      <Tabs defaultValue="general" className="space-y-6">
        <div className="overflow-x-auto pb-2">
          <TabsList className="bg-muted/50 p-1 h-auto inline-flex min-w-full lg:min-w-0">
            <TabsTrigger value="general" className="rounded-lg px-4 py-2 text-xs font-bold gap-2"><Building size={14} /> Geral</TabsTrigger>
            <TabsTrigger value="branding" className="rounded-lg px-4 py-2 text-xs font-bold gap-2"><FileText size={14} /> Branding</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg px-4 py-2 text-xs font-bold gap-2"><Bell size={14} /> Notificações</TabsTrigger>
            <TabsTrigger value="warranty" className="rounded-lg px-4 py-2 text-xs font-bold gap-2"><ShieldCheck size={14} /> Garantias</TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg px-4 py-2 text-xs font-bold gap-2"><Lock size={14} /> Segurança</TabsTrigger>
            <TabsTrigger value="integrations" className="rounded-lg px-4 py-2 text-xs font-bold gap-2"><Webhook size={14} /> Integrações</TabsTrigger>
            <TabsTrigger value="audit" className="rounded-lg px-4 py-2 text-xs font-bold gap-2"><Activity size={14} /> Auditoria</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="space-y-6 focus-visible:outline-none">
          <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>Dados básicos que aparecem em documentos e relatórios gerados pelo sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome da Empresa</Label>
                  <Input 
                    id="company-name" 
                    value={settings.company.name} 
                    className="h-11 rounded-xl"
                    onChange={e => updateSection('company', { name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-cnpj" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CNPJ</Label>
                  <Input 
                    id="company-cnpj" 
                    value={settings.company.cnpj} 
                    className="h-11 rounded-xl"
                    onChange={e => updateSection('company', { cnpj: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">E-mail de Contato</Label>
                  <Input 
                    id="company-email" 
                    type="email" 
                    value={settings.company.email} 
                    className="h-11 rounded-xl"
                    onChange={e => updateSection('company', { email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Telefone</Label>
                  <Input 
                    id="company-phone" 
                    value={settings.company.phone} 
                    className="h-11 rounded-xl"
                    onChange={e => updateSection('company', { phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Label htmlFor="company-address" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Endereço Administrativo</Label>
                <Input 
                  id="company-address" 
                  value={settings.company.address} 
                  className="h-11 rounded-xl"
                  onChange={e => updateSection('company', { address: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 pt-6 border-t border-border/10 bg-muted/5">
              <Button variant="outline" className="h-11 px-6 rounded-xl font-bold">Descartar</Button>
              <Button onClick={handleSaveSettings} className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 shadow-sem-md">Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6 focus-visible:outline-none">
          <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Identidade Visual</CardTitle>
              <CardDescription>Personalize a interface do sistema com as cores da sua marca.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label>Logotipo da Empresa</Label>
                  <div className="h-32 w-full rounded-xl border-2 border-dashed flex items-center justify-center bg-muted/20 relative group overflow-hidden">
                    <div className="text-center p-4">
                      <Building className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sem-tiny text-muted-foreground font-bold uppercase">Arraste seu logo ou clique</p>
                    </div>
                    <Input id="logo-upload" type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  {settings.branding.showLogo && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/10">
                      <div className="h-10 w-10 bg-white rounded border flex items-center justify-center font-black text-primary">A2</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">Logo_Principal_A2.png</p>
                        <p className="text-[10px] text-muted-foreground font-bold">SISTEMA ATIVO</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-status-critical/10 hover:text-status-critical">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="primary-color" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cor da Marca (Interface)</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl shadow-sem-lg border p-1 bg-white shrink-0">
                        <div className="h-full w-full rounded-xl" style={{ backgroundColor: settings.branding.primaryColor }} />
                      </div>
                      <Input 
                        id="primary-hex" 
                        value={settings.branding.primaryColor} 
                        className="font-mono text-sm uppercase font-black h-11 rounded-xl"
                        onChange={e => updateSection('branding', { primaryColor: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/10">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Modo Escuro (Forçar)</Label>
                        <p className="text-sem-tiny text-muted-foreground font-medium">Ativar interface escura permanentemente</p>
                      </div>
                      <Switch 
                        checked={settings.branding.darkMode} 
                        onCheckedChange={v => updateSection('branding', { darkMode: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Exibir Logo no Menu</Label>
                        <p className="text-sem-tiny text-muted-foreground font-medium">Mostrar logotipo corporativo na barra lateral</p>
                      </div>
                      <Switch 
                        checked={settings.branding.showLogo} 
                        onCheckedChange={v => updateSection('branding', { showLogo: v })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 pt-6 border-t border-border/10 bg-muted/5">
              <Button variant="outline" className="h-11 px-6 rounded-xl font-bold">Restaurar Padrões</Button>
              <Button onClick={handleSaveSettings} className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 shadow-sem-md">Salvar Identidade</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 focus-visible:outline-none">
          <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Canais de Comunicação</CardTitle>
              <CardDescription>Configure como e por onde os usuários recebem alertas do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h3 className="text-label font-black text-primary uppercase tracking-widest border-b pb-2">Para Clientes</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold">E-mail</Label>
                      <Switch 
                        checked={settings.notifications.client.email} 
                        onCheckedChange={v => setSettings(p => ({
                          ...p, notifications: { ...p.notifications, client: { ...p.notifications.client, email: v }}
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="font-bold">WhatsApp / SMS</Label>
                      <Switch 
                        checked={settings.notifications.client.sms} 
                        onCheckedChange={v => setSettings(p => ({
                          ...p, notifications: { ...p.notifications, client: { ...p.notifications.client, sms: v }}
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="font-bold">Push Notifications</Label>
                      <Switch 
                        checked={settings.notifications.client.push} 
                        onCheckedChange={v => setSettings(p => ({
                          ...p, notifications: { ...p.notifications, client: { ...p.notifications.client, push: v }}
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-label font-black text-primary uppercase tracking-widest border-b pb-2">Para Equipe Técnica</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold">E-mail Interno</Label>
                      <Switch 
                        checked={settings.notifications.team.email} 
                        onCheckedChange={v => setSettings(p => ({
                          ...p, notifications: { ...p.notifications, team: { ...p.notifications.team, email: v }}
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="font-bold">Sistema (Dashboard)</Label>
                      <Switch 
                        checked={settings.notifications.team.system} 
                        onCheckedChange={v => setSettings(p => ({
                          ...p, notifications: { ...p.notifications, team: { ...p.notifications.team, system: v }}
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-6 border-t border-border/10 bg-muted/5">
              <Button onClick={handleSaveSettings} className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 shadow-sem-md">Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="warranty" className="space-y-6 focus-visible:outline-none">
          <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Regras de Garantia & SLAs</CardTitle>
              <CardDescription>Defina os prazos legais e acordos de nível de serviço para atendimentos técnicos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-label font-black text-primary uppercase tracking-widest">Prazos de Garantia (Anos)</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="structural-w" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estrutural</Label>
                    <Input 
                      id="structural-w" 
                      type="number" 
                      className="h-11 rounded-xl"
                      value={settings.warranty.Structural} 
                      onChange={e => updateSection('warranty', { Structural: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waterproofing-w" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Impermeabilização</Label>
                    <Input 
                      id="waterproofing-w" 
                      type="number" 
                      className="h-11 rounded-xl"
                      value={settings.warranty.Waterproofing} 
                      onChange={e => updateSection('warranty', { Waterproofing: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="installations-w" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Instalações</Label>
                    <Input 
                      id="installations-w" 
                      type="number" 
                      className="h-11 rounded-xl"
                      value={settings.warranty.Installations} 
                      onChange={e => updateSection('warranty', { Installations: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finishings-w" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acabamentos</Label>
                    <Input 
                      id="finishings-w" 
                      type="number" 
                      className="h-11 rounded-xl"
                      value={settings.warranty.Finishings} 
                      onChange={e => updateSection('warranty', { Finishings: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-border/10" />

              <div className="space-y-6">
                <h3 className="text-label font-black text-primary uppercase tracking-widest">Tempos de Resposta (SLAs)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold">Emergencial (Horas)</Label>
                    <Input 
                      type="number" 
                      value={settings.warranty.emergencySla} 
                      onChange={e => updateSection('warranty', { emergencySla: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Urgente (Horas)</Label>
                    <Input 
                      type="number" 
                      value={settings.warranty.urgentSla} 
                      onChange={e => updateSection('warranty', { urgentSla: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Normal (Dias)</Label>
                    <Input 
                      type="number" 
                      value={settings.warranty.normalSla} 
                      onChange={e => updateSection('warranty', { normalSla: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-6 border-t border-border/10">
              <Button onClick={handleSaveSettings} className="rounded-lg font-bold bg-primary hover:bg-primary/90">Salvar Regras de Negócio</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 focus-visible:outline-none">
          <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Controle de Acesso & Segurança</CardTitle>
              <CardDescription>Políticas de senha, autenticação e proteção de dados sensíveis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/10 pb-4">
                    <div>
                      <Label className="font-bold">Autenticação em Dois Fatores (2FA)</Label>
                      <p className="text-sem-tiny text-muted-foreground font-medium">Obrigatório para administradores</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between border-b border-border/10 pb-4">
                    <div>
                      <Label className="font-bold">Log de Auditoria Full</Label>
                      <p className="text-sem-tiny text-muted-foreground font-medium">Registrar todas as leituras e escritas</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/10 pb-4">
                    <div>
                      <Label className="font-bold">Audit Log Viewer</Label>
                      <p className="text-sem-tiny text-muted-foreground font-medium">Ativar visualizador de logs no painel</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4 pt-4">
                  <Label className="font-bold">Política de Exibição de Dados</Label>
                  <Select defaultValue="strict">
                    <SelectTrigger className="h-11 rounded-lg">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relaxed">Aberta (Todos veem tudo)</SelectItem>
                      <SelectItem value="standard">Padrão (Por departamento)</SelectItem>
                      <SelectItem value="strict">Restrita (Apenas responsáveis)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sem-tiny text-muted-foreground italic">Alterar esta configuração impacta a visibilidade de documentos e usuários.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-border/10">
              <Button variant="outline" className="rounded-lg font-bold" onClick={() => window.location.href='/admin/design-system'}>Ver Auditoria Completa</Button>
              <Button onClick={handleSaveSettings} className="rounded-lg font-bold bg-primary hover:bg-primary/90">Aplicar Políticas</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6 focus-visible:outline-none">
          <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Conectividade & APIs</CardTitle>
              <CardDescription>Integração com serviços de nuvem e ferramentas de terceiros.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-4">
                <div className="p-3 bg-card rounded-lg shadow-sem-sm">
                  <Building className="text-primary" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-label font-bold">Google Drive Storage</h4>
                  <p className="text-sem-tiny text-muted-foreground font-medium uppercase tracking-tighter">Status: Conectado</p>
                </div>
                <Badge className="bg-status-complete/10 text-status-complete border-status-complete/20 uppercase font-black text-tiny">Ativo</Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">API Key - Sincronização de Documentos</Label>
                  <Input type="password" value="************************" readOnly className="rounded-lg h-11 bg-muted/20" />
                </div>
                <Button variant="outline" className="rounded-lg font-bold w-full md:w-auto">
                  Testar Conexão
                </Button>
              </div>

              <Separator className="bg-border/10" />
              
              <WebhooksConfig />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="audit" className="space-y-6 focus-visible:outline-none">
          <AuditLogViewer title="Histórico de Ações Administrativas" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
