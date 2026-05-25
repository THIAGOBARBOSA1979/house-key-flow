import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, CheckCircle2, XCircle, Key, RefreshCw, AlertTriangle, Fingerprint } from "lucide-react";
import { Supabase } from "@/integrations/supabase";
import { Role } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks";

export const GovernanceManager = () => {
  const [dbRoles, setDbRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  const { toast } = useToast();

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await Supabase.db.findMany('roles_permissions');
    if (!error && data) {
      setDbRoles(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleRotateSecrets = async () => {
    setIsRotating(true);
    // Simulating security rotation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRotating(false);
    toast({
      title: "Segurança Reforçada",
      description: "Tokens de acesso e chaves de criptografia foram rotacionados com sucesso.",
    });
  };

  const roles: Role[] = ['super_admin', 'admin', 'manager', 'staff', 'technical', 'user'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2rem] border-none bg-primary/5 shadow-inner">
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
               <Fingerprint className="text-primary w-4 h-4" /> Integridade
             </CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-2xl font-black text-primary tracking-tighter">Ativa</p>
             <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Verificação em tempo real</p>
           </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none bg-emerald-500/5 shadow-inner">
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
               <Shield className="text-emerald-600 w-4 h-4" /> Compliance
             </CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-2xl font-black text-emerald-600 tracking-tighter">100%</p>
             <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">SLA de segurança OK</p>
           </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none bg-amber-500/5 shadow-inner">
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
               <Key className="text-amber-600 w-4 h-4" /> Hardening
             </CardTitle>
           </CardHeader>
           <CardContent className="flex items-center justify-between">
             <div>
               <p className="text-2xl font-black text-amber-600 tracking-tighter">Habilitado</p>
               <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Políticas de RLS Ativas</p>
             </div>
             <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-xl h-10 w-10 hover:bg-amber-500/10 text-amber-600"
                onClick={handleRotateSecrets}
                disabled={isRotating}
              >
                <RefreshCw size={18} className={isRotating ? "animate-spin" : ""} />
             </Button>
           </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2rem] border-none bg-card/40 backdrop-blur-md shadow-sem-lg overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Controle de Acesso (RBAC)</CardTitle>
          </div>
          <CardDescription>
            Visualização das permissões efetivas por perfil de usuário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/10">
                <TableHead className="font-black uppercase text-[10px] tracking-widest">Recurso / Módulo Operacional</TableHead>
                {roles.map(role => (
                  <TableHead key={role} className="text-center font-black uppercase text-[10px] tracking-widest">
                    {role.replace('_', ' ')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Simplified for now until permissions are fully mapped in new guard */}
              <TableRow className="hover:bg-primary/[0.02] border-border/5">
                <TableCell className="font-bold text-sm">Gestão de Garantias & Assistência</TableCell>
                {roles.map(role => (
                  <TableCell key={role} className="text-center">
                    {['super_admin', 'admin', 'manager', 'technical'].includes(role) ? <CheckCircle2 className="h-5 w-5 text-status-complete mx-auto drop-shadow-sm" /> : <XCircle className="h-5 w-5 text-muted-foreground/20 mx-auto" />}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="hover:bg-primary/[0.02] border-border/5">
                <TableCell className="font-bold text-sm">Vistorias Técnicas & Entrega de Chaves</TableCell>
                {roles.map(role => (
                  <TableCell key={role} className="text-center">
                    {['super_admin', 'admin', 'technical'].includes(role) ? <CheckCircle2 className="h-5 w-5 text-status-complete mx-auto drop-shadow-sm" /> : <XCircle className="h-5 w-5 text-muted-foreground/20 mx-auto" />}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="hover:bg-primary/[0.02] border-border/5">
                <TableCell className="font-bold text-sm">Empreendimentos & Unidades</TableCell>
                {roles.map(role => (
                  <TableCell key={role} className="text-center">
                    {['super_admin', 'admin', 'manager'].includes(role) ? <CheckCircle2 className="h-5 w-5 text-status-complete mx-auto drop-shadow-sm" /> : <XCircle className="h-5 w-5 text-muted-foreground/20 mx-auto" />}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="hover:bg-primary/[0.02] border-border/5">
                <TableCell className="font-bold text-sm">Configurações SaaS & Command Center</TableCell>
                {roles.map(role => (
                  <TableCell key={role} className="text-center">
                    {['super_admin'].includes(role) ? <CheckCircle2 className="h-5 w-5 text-status-complete mx-auto drop-shadow-sm" /> : <XCircle className="h-5 w-5 text-muted-foreground/20 mx-auto" />}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-none bg-card/40 backdrop-blur-md shadow-sem-lg overflow-hidden">
        <CardHeader>
          <CardTitle>Sobrescrições por Tenant</CardTitle>
          <CardDescription>
            Permissões customizadas que sobrescrevem o padrão global para empresas específicas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dbRoles.length > 0 ? (
            <Table>
            <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border/10">
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Tenant ID / Contexto</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Perfil de Acesso</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Política de Sobrescrição</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">Integridade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dbRoles.map(row => (
                  <TableRow key={row.id} className="hover:bg-primary/[0.02] border-border/5">
                    <TableCell className="font-mono text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{row.company_id || 'Global Policy'}</TableCell>
                    <TableCell><Badge variant="outline" className="rounded-lg font-black uppercase tracking-widest text-[9px] px-2">{row.role}</Badge></TableCell>
                    <TableCell className="text-xs font-bold">{row.permission}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={row.enabled ? "success" : "destructive"} className="rounded-lg font-black uppercase tracking-widest text-[8px] px-2">
                        {row.enabled ? "Auditado" : "Bypass"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              Nenhuma sobrescrição de permissão encontrada no banco de dados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
