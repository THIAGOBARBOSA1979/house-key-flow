import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Globe, Shield, Construction } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface GeneralTabProps {
  settings: any;
  updateSection: (section: string, data: any) => void;
  onSave: () => Promise<void>;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ settings, updateSection, onSave }) => {
  const { toast } = useToast();

  const handleSave = async () => {
    await onSave();
    toast({ title: "Configurações salvas", description: "As preferências globais foram atualizadas." });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none">
      <Card className="border-border/10 shadow-sem-lg rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Globe size={24} />
            </div>
            <div>
              <CardTitle className="text-xl font-black uppercase tracking-tight">Regionalização e Idioma</CardTitle>
              <CardDescription>Configure o fuso horário e a localização padrão do sistema.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Idioma do Painel</Label>
              <Input value="Português (Brasil)" disabled className="h-11 rounded-xl bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fuso Horário</Label>
              <Input value="GMT-3 (Brasília)" disabled className="h-11 rounded-xl bg-muted/50" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/10 shadow-sem-lg rounded-3xl overflow-hidden focus-visible:outline-none">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Shield size={24} />
            </div>
            <div>
              <CardTitle className="text-xl font-black uppercase tracking-tight">Privacidade e Dados</CardTitle>
              <CardDescription>Gerencie como as informações são tratadas na plataforma.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6 focus-visible:outline-none">
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border/5">
            <div className="space-y-0.5">
              <Label className="font-bold">Anonimizar logs de auditoria antigos</Label>
              <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Logs com mais de 12 meses serão anonimizados</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border/5">
            <div className="space-y-0.5">
              <Label className="font-bold">Compartilhar dados técnicos com matriz</Label>
              <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Permite análise de tendências de engenharia</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-status-pending/20 shadow-sem-lg rounded-3xl overflow-hidden bg-status-pending/[0.02]">
        <CardHeader className="bg-status-pending/5 border-b border-status-pending/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-status-pending/10 rounded-2xl text-status-pending">
              <Construction size={24} />
            </div>
            <div>
              <CardTitle className="text-xl font-black uppercase tracking-tight text-status-pending">Manutenção & Disponibilidade</CardTitle>
              <CardDescription className="text-status-pending/60">Controle o acesso global à plataforma durante janelas de atualização.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between p-6 bg-background/50 rounded-2xl border border-status-pending/10">
            <div className="space-y-1">
              <Label className="font-black uppercase tracking-widest text-xs text-status-pending">Modo de Manutenção Estratégica</Label>
              <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
                Ao ativar, apenas administradores master poderão acessar o painel.<br />
                Clientes e técnicos verão uma tela de "Manutenção Programada".
              </p>
            </div>
            <Switch onCheckedChange={(checked) => {
              if (checked) {
                toast({
                  title: "Atenção: Modo Manutenção",
                  description: "O sistema entrará em modo restrito após salvar.",
                  variant: "destructive"
                });
              }
            }} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4 focus-visible:outline-none">
        <Button onClick={handleSave} className="h-12 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-2 shadow-lg shadow-primary/20">
          <Save size={16} /> Salvar Preferências
        </Button>
      </div>
    </div>
  );
};
