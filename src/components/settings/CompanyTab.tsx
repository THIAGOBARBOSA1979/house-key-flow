import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CompanySettings, Company } from "@/services";
import { Globe, Layout, Palette } from "lucide-react";

interface CompanyTabProps {
  companySettings: CompanySettings;
  setCompanySettings: (settings: CompanySettings) => void;
  tenantBranding: Partial<Company>;
  setTenantBranding: (branding: Partial<Company>) => void;
  onSave: () => Promise<void>;
}

export const CompanyTab = ({ 
  companySettings, 
  setCompanySettings, 
  tenantBranding, 
  setTenantBranding, 
  onSave 
}: CompanyTabProps) => (
  <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
    <CardHeader>
      <CardTitle>Configurações do Tenant</CardTitle>
      <CardDescription>Personalize o nome de exibição e informações de suporte da sua incorporadora no SaaS.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-8">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
          <Globe size={14} /> Configurações de Acesso
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subdomínio (empresa.sistema.com)</Label>
            <Input 
              placeholder="empresa" 
              value={tenantBranding.subdomain || ''}
              onChange={e => setTenantBranding({...tenantBranding, subdomain: e.target.value})}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Domínio Customizado (opcional)</Label>
            <Input 
              placeholder="suporte.minhaempresa.com.br" 
              value={tenantBranding.custom_domain || ''}
              onChange={e => setTenantBranding({...tenantBranding, custom_domain: e.target.value})}
              className="h-11 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-border/10">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
          <Layout size={14} /> White Label e Branding
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome da Marca (Document Title)</Label>
            <Input 
              placeholder="Ex: Alpha Incorporadora" 
              value={tenantBranding.brand_name || ''}
              onChange={e => setTenantBranding({...tenantBranding, brand_name: e.target.value})}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL do Logotipo</Label>
            <Input 
              placeholder="https://..." 
              value={tenantBranding.logo_url || ''}
              onChange={e => setTenantBranding({...tenantBranding, logo_url: e.target.value})}
              className="h-11 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-border/10">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
          <Palette size={14} /> Cores e Tema
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cor Primária</Label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                value={tenantBranding.theme_settings?.primary || '#000000'}
                onChange={e => setTenantBranding({
                  ...tenantBranding, 
                  theme_settings: { ...tenantBranding.theme_settings, primary: e.target.value }
                })}
                className="w-11 h-11 p-1 rounded-xl overflow-hidden"
              />
              <Input 
                value={tenantBranding.theme_settings?.primary || ''}
                onChange={e => setTenantBranding({
                  ...tenantBranding, 
                  theme_settings: { ...tenantBranding.theme_settings, primary: e.target.value }
                })}
                className="h-11 rounded-xl font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-border/10">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Informações de Contato</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome de Exibição Público</Label>
            <Input 
              placeholder="Ex: Incorporadora Alpha Sul" 
              value={companySettings.display_name || ''}
              onChange={e => setCompanySettings({...companySettings, display_name: e.target.value})}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">E-mail de Suporte</Label>
            <Input 
              placeholder="suporte@alpha.com.br" 
              value={companySettings.support_email || ''}
              onChange={e => setCompanySettings({...companySettings, support_email: e.target.value})}
              className="h-11 rounded-xl"
            />
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex justify-end gap-3 pt-6 border-t border-border/10 bg-muted/5">
      <Button onClick={onSave} className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 shadow-sem-md">Salvar Empresa</Button>
    </CardFooter>
  </Card>
);
