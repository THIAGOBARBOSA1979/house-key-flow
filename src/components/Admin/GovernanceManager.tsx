import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, CheckCircle2, XCircle } from "lucide-react";
import { Supabase } from "@/integrations/supabase";
import { Role } from "@/types";

export const GovernanceManager = () => {
  const [dbRoles, setDbRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await Supabase.db.findMany('roles_permissions');
      if (!error && data) {
        setDbRoles(data);
      }
      setLoading(false);
    };
    fetchRoles();
  }, []);

  const roles: Role[] = ['super_admin', 'admin', 'manager', 'staff', 'technical', 'user'];

  return (
    <div className="space-y-6">
      <Card>
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
            <TableHeader>
              <TableRow>
                <TableHead>Recurso / Ação</TableHead>
                {roles.map(role => (
                  <TableHead key={role} className="text-center font-bold uppercase text-[10px]">
                    {role.replace('_', ' ')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Simplified for now until permissions are fully mapped in new guard */}
              <TableRow>
                <TableCell className="font-medium text-sm">Controle Total</TableCell>
                {roles.map(role => (
                  <TableCell key={role} className="text-center">
                    {role === 'super_admin' ? <CheckCircle2 className="h-4 w-4 text-status-complete mx-auto" /> : <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sobrescrições por Tenant</CardTitle>
          <CardDescription>
            Permissões customizadas que sobrescrevem o padrão global para empresas específicas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dbRoles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant ID</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Permissão</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dbRoles.map(row => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.company_id || 'Global'}</TableCell>
                    <TableCell><Badge variant="outline">{row.role}</Badge></TableCell>
                    <TableCell className="text-sm">{row.permission}</TableCell>
                    <TableCell>
                      <Badge variant={row.enabled ? "success" : "destructive"}>
                        {row.enabled ? "Ativo" : "Inativo"}
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
