import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, Eye, Key, ShieldAlert } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface SecurityTabProps {
  onSave: () => void;
}

export const SecurityTab = ({ onSave }: SecurityTabProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card className="card-standard border-none bg-card/40 backdrop-blur-md shadow-sem-lg rounded-[2rem]">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
            <Lock className="text-primary" /> Políticas de Autenticação
          </CardTitle>
          <CardDescription>Configure como os usuários acessam a plataforma e as regras de segurança.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          <div className="flex items-center justify-between py-4 border-b border-border/10">
            <div className="space-y-1">
              <Label className="font-bold text-sm">Autenticação em Dois Fatores (2FA)</Label>
              <p className="text-xs text-muted-foreground font-medium">Exigir código via app ou SMS para administradores e técnicos.</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between py-4 border-b border-border/10">
            <div className="space-y-1">
              <Label className="font-bold text-sm">Complexidade de Senha</Label>
              <p className="text-xs text-muted-foreground font-medium">Exigir caracteres especiais, números e letras maiúsculas.</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="space-y-1">
              <Label className="font-bold text-sm">Expiração de Sessão</Label>
              <p className="text-xs text-muted-foreground font-medium">Tempo de inatividade antes de deslogar automaticamente (minutos).</p>
            </div>
            <div className="w-24">
              <Input type="number" defaultValue={60} className="h-10 rounded-xl font-black text-center" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-8 pt-0 flex justify-end">
           <Button onClick={onSave} className="rounded-xl h-11 px-8 font-black uppercase text-[11px] tracking-widest shadow-lg shadow-primary/20">
             Salvar Políticas
           </Button>
        </CardFooter>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none bg-card/40 backdrop-blur-md shadow-sem-lg rounded-[2rem] p-8 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Key size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">Chaves de API (Server-Side)</h3>
            <p className="text-sm text-muted-foreground font-medium mb-6">Gerencie chaves para integrações seguras com outros sistemas.</p>
            <Button variant="outline" className="rounded-xl font-bold w-full">Gerenciar Chaves</Button>
          </div>
        </Card>

        <Card className="border-none bg-status-critical/5 backdrop-blur-md shadow-sem-lg rounded-[2rem] p-8 space-y-4 border border-status-critical/10">
          <div className="h-12 w-12 rounded-2xl bg-status-critical/10 flex items-center justify-center text-status-critical">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-status-critical">Bloqueio de IP</h3>
            <p className="text-sm text-muted-foreground font-medium mb-6">Restringir acesso administrativo a faixas de IP específicas da sua empresa.</p>
            <Button variant="outline" className="rounded-xl font-bold w-full border-status-critical/20 text-status-critical hover:bg-status-critical/5">Configurar Firewall</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
