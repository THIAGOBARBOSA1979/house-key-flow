import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Building, Bell, ShieldCheck, User, Lock, Webhook, FileText, Activity, Layers } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import WebhooksConfig from "@/components/settings/WebhooksConfig";
import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSettings } from "@/hooks/identity/useSettings";
import { GeneralTab } from "@/components/settings/GeneralTab";
import { CompanyTab } from "@/components/settings/companyTab";
import { BrandingTab } from "@/components/settings/brandingTab";
import { NotificationsTab } from "@/components/settings/notificationsTab";
import { SecurityTab } from "@/components/settings/SecurityTab";
import { WarrantyTab } from "@/components/settings/warrantyTab";

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
          <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-14 border border-border/10 inline-flex min-w-full lg:min-w-0">
            <TabsTrigger value="general" className="rounded-lg px-6 font-bold text-xs uppercase tracking-widest gap-2">
              <Building size={14} /> Geral
            </TabsTrigger>
            {user?.role === 'admin' && !user?.is_super_admin && (
              <TabsTrigger value="company" className="rounded-lg px-6 font-bold text-xs uppercase tracking-widest gap-2">
                <Layers size={14} /> Empresa
              </TabsTrigger>
            )}
            <TabsTrigger value="branding" className="rounded-lg px-6 font-bold text-xs uppercase tracking-widest gap-2">
              <FileText size={14} /> Branding
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg px-6 font-bold text-xs uppercase tracking-widest gap-2">
              <Bell size={14} /> Notificações
            </TabsTrigger>
            <TabsTrigger value="warranty" className="rounded-lg px-6 font-bold text-xs uppercase tracking-widest gap-2">
              <ShieldCheck size={14} /> Garantias
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg px-6 font-bold text-xs uppercase tracking-widest gap-2">
              <Lock size={14} /> Segurança
            </TabsTrigger>
            <TabsTrigger value="integrations" className="rounded-lg px-6 font-bold text-xs uppercase tracking-widest gap-2">
              <Webhook size={14} /> Integrações
            </TabsTrigger>
            <TabsTrigger value="audit" className="rounded-lg px-6 font-bold text-xs uppercase tracking-widest gap-2">
              <Activity size={14} /> Auditoria
            </TabsTrigger>
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
          <WarrantyTab 
            settings={settings} 
            updateSection={updateSection} 
            onSave={saveSystemSettings} 
          />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab onSave={saveSystemSettings} />
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
