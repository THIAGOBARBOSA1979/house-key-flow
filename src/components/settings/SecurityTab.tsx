import React from "react";
import { cn } from "@/lib/utils";
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
      <Card className="card-standard border-none bg-card/40 backdrop-blur-md shadow-sem-lg rounded-[2rem]">
        <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-primary" /> Rastreabilidade de Acessos
            </CardTitle>
            <CardDescription>Monitoramento de logins e eventos de segurança recentes na sua conta.</CardDescription>
          </div>
          <Button variant="ghost" className="text-primary font-bold text-xs uppercase tracking-widest">Ver Log Completo</Button>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="space-y-4">
             {[
               { user: "Admin Master", event: "Login via Web-App", time: "Há 12 min", ip: "189.122.45.10", status: "success" },
               { user: "Técnico Silva", event: "Troca de Senha", time: "Há 4 horas", ip: "177.34.21.192", status: "success" },
               { user: "Desconhecido", event: "Tentativa de Login Falha", time: "Há 6 horas", ip: "201.55.12.8", status: "blocked" }
             ].map((log, i) => (
               <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/5 group hover:bg-muted/30 transition-all">
                 <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm", log.status === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600')}>
                      {log.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none mb-1">{log.user}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{log.event} • {log.ip}</p>
                    </div>
                 </div>
                 <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">{log.time}</span>
               </div>
             ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
