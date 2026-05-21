import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Building, Trash2 } from "lucide-react";
import { SystemSettings } from "@/services";

interface BrandingTabProps {
  settings: SystemSettings;
  updateSection: (section: keyof SystemSettings, data: any) => void;
  onSave: () => void;
}

export const BrandingTab = ({ settings, updateSection, onSave }: BrandingTabProps) => (
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
      <Button onClick={onSave} className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 shadow-sem-md">Salvar Identidade</Button>
    </CardFooter>
  </Card>
);
