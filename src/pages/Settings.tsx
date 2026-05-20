import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Building, Bell, ShieldCheck, User, Lock, Webhook, FileText, Activity, Layers } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import WebhooksConfig from "@/components/Settings/WebhooksConfig";
import { AuditLogViewer } from "@/components/Admin/AuditLogViewer";
import { PageHeader } from "@/components/Layout/PageHeader";
import { useSettings } from "@/hooks/identity/useSettings";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GeneralTab } from "@/components/Settings/GeneralTab";
import { CompanyTab } from "@/components/Settings/CompanyTab";
import { BrandingTab } from "@/components/Settings/BrandingTab";
import { NotificationsTab } from "@/components/Settings/NotificationsTab";
import { SecurityTab } from "@/components/Settings/SecurityTab";
import { WarrantyTab } from "@/components/Settings/WarrantyTab";

const Settings = () => {
  const {
    settings,
    companySettings,
    setCompanySettings,
    updateSection,
    saveSystemSettings,
    saveCompanySettings,
    user
  } = useSettings();

  // Special setter for nested notification state
  const [localSettings, setLocalSettings] = useState(settings);
  useEffect(() => setLocalSettings(settings), [settings]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        icon={SettingsIcon}
        title="Configurações Estratégicas"
        description="Defina regras de negócio, diretrizes de branding e arquitetura de integrações da plataforma."
      />

      <Tabs defaultValue="general" className="space-y-6">
        <div className="overflow-x-auto pb-2">
          <TabsList className="bg-muted/50 p-1 h-auto inline-flex min-w-full lg:min-w-0">
            <TabsTrigger value="general" className="rounded-lg px-4 py-2 text-xs font-bold gap-2"><Building size={14} /> Geral</TabsTrigger>
            {user?.role === 'admin' && !user?.is_super_admin && (
              <TabsTrigger value="company" className="rounded-lg px-4 py-2 text-xs font-bold gap-2"><Layers size={14} /> Empresa (SaaS)</TabsTrigger>
            )}
            <TabsTrigger value="branding" className="rounded-lg px-4 py-2 text-xs font-bold gap-2"><FileText size={14} /> Branding</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg px-4 py-2 text-xs font-bold gap-2"><Bell size={14} /> Notificações</TabsTrigger>
            <TabsTrigger value="warranty" className="rounded-lg px-4 py-2 text-xs font-bold gap-2"><ShieldCheck size={14} /> Garantias</TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg px-4 py-2 text-xs font-bold gap-2"><Lock size={14} /> Segurança</TabsTrigger>
            <TabsTrigger value="integrations" className="rounded-lg px-4 py-2 text-xs font-bold gap-2"><Webhook size={14} /> Integrações</TabsTrigger>
            <TabsTrigger value="audit" className="rounded-lg px-4 py-2 text-xs font-bold gap-2"><Activity size={14} /> Auditoria</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general">
          <GeneralTab 
            settings={settings} 
            updateSection={updateSection} 
            onSave={saveSystemSettings} 
          />
        </TabsContent>

        {user?.role === 'admin' && !user?.is_super_admin && (
          <TabsContent value="company">
            <CompanyTab 
              companySettings={companySettings} 
              setCompanySettings={setCompanySettings} 
              onSave={saveCompanySettings} 
            />
          </TabsContent>
        )}

        <TabsContent value="branding">
          <BrandingTab 
            settings={settings} 
            updateSection={updateSection} 
            onSave={saveSystemSettings} 
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab 
            settings={localSettings} 
            setSettings={setLocalSettings} 
          />
        </TabsContent>

        <TabsContent value="warranty">
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
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estrutural</Label>
                    <Input type="number" className="h-11 rounded-xl" value={settings.warranty.Structural} onChange={e => updateSection('warranty', { Structural: parseInt(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Impermeabilização</Label>
                    <Input type="number" className="h-11 rounded-xl" value={settings.warranty.Waterproofing} onChange={e => updateSection('warranty', { Waterproofing: parseInt(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Instalações</Label>
                    <Input type="number" className="h-11 rounded-xl" value={settings.warranty.Installations} onChange={e => updateSection('warranty', { Installations: parseInt(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acabamentos</Label>
                    <Input type="number" className="h-11 rounded-xl" value={settings.warranty.Finishings} onChange={e => updateSection('warranty', { Finishings: parseInt(e.target.value) })} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-6 border-t border-border/10">
              <Button onClick={saveSystemSettings} className="rounded-lg font-bold bg-primary hover:bg-primary/90">Salvar Regras de Negócio</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Controle de Acesso & Segurança</CardTitle>
              <CardDescription>Políticas de senha, autenticação e proteção de dados sensíveis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/10 pb-4">
                <div>
                  <Label className="font-bold">Autenticação em Dois Fatores (2FA)</Label>
                  <p className="text-sem-tiny text-muted-foreground font-medium">Obrigatório para administradores</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-6 border-t border-border/10">
              <Button onClick={saveSystemSettings} className="rounded-lg font-bold bg-primary hover:bg-primary/90">Aplicar Políticas</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <WebhooksConfig />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogViewer title="Histórico de Ações Administrativas" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
