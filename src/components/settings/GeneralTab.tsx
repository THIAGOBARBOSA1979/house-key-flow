import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SystemSettings } from "@/services";

interface GeneralTabProps {
  settings: SystemSettings;
  updateSection: (section: keyof SystemSettings, data: any) => void;
  onSave: () => void;
}

export const GeneralTab = ({ settings, updateSection, onSave }: GeneralTabProps) => (
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
      <Button onClick={onSave} className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 shadow-sem-md">Salvar Alterações</Button>
    </CardFooter>
  </Card>
);
