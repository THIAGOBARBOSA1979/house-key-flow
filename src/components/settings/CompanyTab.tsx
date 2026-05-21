import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CompanySettings } from "@/services";

interface CompanyTabProps {
  companySettings: CompanySettings;
  setCompanySettings: (settings: CompanySettings) => void;
  onSave: () => void;
}

export const CompanyTab = ({ companySettings, setCompanySettings, onSave }: CompanyTabProps) => (
  <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
    <CardHeader>
      <CardTitle>Configurações do Tenant</CardTitle>
      <CardDescription>Personalize o nome de exibição e informações de suporte da sua incorporadora no SaaS.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
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
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">E-mail de Suporte ao Cliente</Label>
          <Input 
            placeholder="suporte@alpha.com.br" 
            value={companySettings.support_email || ''}
            onChange={e => setCompanySettings({...companySettings, support_email: e.target.value})}
            className="h-11 rounded-xl"
          />
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex justify-end gap-3 pt-6 border-t border-border/10 bg-muted/5">
      <Button onClick={onSave} className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 shadow-sem-md">Salvar Empresa</Button>
    </CardFooter>
  </Card>
);
