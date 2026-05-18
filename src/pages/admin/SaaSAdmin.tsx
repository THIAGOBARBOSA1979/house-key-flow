import React, { useState, useMemo } from "react";
import { PageTemplate } from "@/components/Layout/PageTemplate";
import { companyService, Company, CompanyStatus, SubscriptionPlan } from "@/services/CompanyService";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Building, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  CreditCard,
  Plus,
  Users as UsersIcon,
  Users,
  Activity
} from "lucide-react";
import { propertyService } from "@/services/PropertyService";
import { inspectionService } from "@/services/InspectionService";
import { userService } from "@/services/UserService";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function SaaSAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>(companyService.getAll(undefined, true));
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [newCompany, setNewCompany] = useState({ name: '', slug: '', plan: 'basic' as SubscriptionPlan });
  const [isUpdatingSub, setIsUpdatingSub] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string>('');

  const companyUsers = useMemo(() => {
    if (!selectedCompany) return [];
    return userService.getAll(selectedCompany.id, true);
  }, [selectedCompany]);

  const totalUsers = companies.reduce((acc, curr) => acc + (userService.count(curr.id, true) || 0), 0);



  // Safety check for super admin
  if (!user?.is_super_admin) {
    return <Navigate to="/admin" replace />;
  }

  const handleToggleStatus = (id: string, currentStatus: CompanyStatus) => {
    const nextStatus: CompanyStatus = currentStatus === 'active' ? 'suspended' : 'active';
    companyService.toggleStatus(id, nextStatus);
    setCompanies(companyService.getAll(undefined, true));
    toast({
      title: "Status atualizado",
      description: `Empresa agora está ${nextStatus === 'active' ? 'Ativa' : 'Suspensa'}.`
    });
  };

  const handleAddCompany = () => {
    if (!newCompany.name || !newCompany.slug) return;
    
    companyService.create({
      name: newCompany.name,
      slug: newCompany.slug,
      status: 'active',
      owner_id: 'pending',
      subscription_plan: newCompany.plan,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    setCompanies(companyService.getAll(undefined, true));
    setIsAddOpen(false);
    toast({ title: "Empresa cadastrada", description: "O novo tenant foi criado com sucesso." });
  };

  const handleUpdateSubscription = () => {
    if (!selectedCompany || !expiryDate) return;
    
    companyService.updateSubscription(selectedCompany.id, selectedCompany.subscription_plan, new Date(expiryDate));
    setCompanies(companyService.getAll(undefined, true));
    setIsUpdatingSub(false);
    toast({ title: "Assinatura Atualizada", description: "A data de expiração foi modificada." });
  };

  const handleResetPassword = (userName: string) => {
    toast({ title: "Senha Resetada", description: `Link de recuperação enviado para ${userName}.` });
  };


  const columns = [
    { 
      header: "Empresa", 
      accessorKey: "name",
      cell: (c: Company) => (
        <div className="flex flex-col">
          <span className="font-bold">{c.name}</span>
          <span className="text-[10px] text-muted-foreground uppercase">{c.slug}</span>
        </div>
      )
    },
    { 
      header: "Plano", 
      accessorKey: "subscription_plan",
      cell: (c: Company) => (
        <Badge variant="outline" className="capitalize">
          <CreditCard className="w-3 h-3 mr-1" />
          {c.subscription_plan}
        </Badge>
      )
    },
    { 
      header: "Status", 
      accessorKey: "status",
      cell: (c: Company) => {
        const styles = {
          active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          suspended: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
        };
        return (
          <Badge className={styles[c.status]}>
            {c.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : 
             c.status === 'suspended' ? <AlertTriangle className="w-3 h-3 mr-1" /> : 
             <XCircle className="w-3 h-3 mr-1" />}
            {c.status.toUpperCase()}
          </Badge>
        );
      }
    },
    {
      header: "Expiração",
      accessorKey: "subscription_expires_at",
      cell: (c: Company) => (
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="w-3 h-3 mr-1" />
          {c.subscription_expires_at ? new Date(c.subscription_expires_at).toLocaleDateString() : 'Vitalício'}
        </div>
      )
    },
    {
      header: "Ações",
      accessorKey: "id",
      className: "text-right",
      cell: (c: Company) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleToggleStatus(c.id, c.status)}>
              {c.status === 'active' ? "Suspender Acesso" : "Ativar Empresa"}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Excluir Permanente</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <PageTemplate 
      title="SaaS Master Admin" 
      description="Painel de controle multi-tenant para governança de empresas e assinaturas."
      icon={Building}
      actions={
        <Button onClick={() => setIsAddOpen(true)} className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[11px] shadow-lg">
          <Plus className="w-4 h-4 mr-2" strokeWidth={3} />
          Cadastrar Empresa
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-primary/5 border-none shadow-none rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Total de Tenants</p>
          <h3 className="text-3xl font-black">{companies.length}</h3>
        </Card>
        <Card className="p-6 bg-emerald-500/5 border-none shadow-none rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Empresas Ativas</p>
          <h3 className="text-3xl font-black">{companies.filter(c => c.status === 'active').length}</h3>
        </Card>
        <Card className="p-6 bg-blue-500/5 border-none shadow-none rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Usuários Globais</p>
          <h3 className="text-3xl font-black">{totalUsers}</h3>
        </Card>
      </div>

      <DataTable 
        columns={columns} 
        data={companies} 
        onRowClick={(c) => setSelectedCompany(c)}
      />

      <Dialog open={!!selectedCompany} onOpenChange={(open) => !open && (setSelectedCompany(null), setIsUpdatingSub(false))}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestão de Tenant: {selectedCompany?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Identificador (Slug)</p>
                <p className="font-bold">{selectedCompany?.slug}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status Atual</p>
                <Badge className={selectedCompany?.status === 'active' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}>
                  {selectedCompany?.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Indicadores Operacionais
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 border rounded-xl text-center bg-card">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Usuários</p>
                  <p className="text-xl font-bold">{selectedCompany ? userService.count(selectedCompany.id, true) : 0}</p>
                </div>
                <div className="p-3 border rounded-xl text-center bg-card">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Obras</p>
                  <p className="text-xl font-bold">{selectedCompany ? propertyService.count(selectedCompany.id, true) : 0}</p>
                </div>
                <div className="p-3 border rounded-xl text-center bg-card">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Vistorias</p>
                  <p className="text-xl font-bold">{selectedCompany ? inspectionService.count(selectedCompany.id, true) : 0}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                Usuários Vinculados
              </h4>
              <div className="border rounded-xl overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  {companyUsers.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-[10px] uppercase font-black sticky top-0">
                        <tr>
                          <th className="text-left p-3">Nome</th>
                          <th className="text-left p-3">Role</th>
                          <th className="text-right p-3">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {companyUsers.map(u => (
                          <tr key={u.id} className="hover:bg-muted/20">
                            <td className="p-3 font-medium">{u.name}</td>
                            <td className="p-3 uppercase text-[10px] font-bold text-muted-foreground">{u.role}</td>
                            <td className="p-3 text-right">
                              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => handleResetPassword(u.name)}>Resetar Senha</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="p-4 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">Nenhum usuário cadastrado</p>
                  )}
                </div>
              </div>
            </div>

            {isUpdatingSub ? (
              <div className="p-6 border-2 border-primary/20 bg-primary/5 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-primary">Alterar Validez da Assinatura</h4>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold">Nova Data de Expiração</Label>
                  <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setIsUpdatingSub(false)}>Cancelar</Button>
                  <Button className="flex-1" onClick={handleUpdateSubscription}>Salvar Data</Button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl h-11 font-bold"
                  onClick={() => selectedCompany && handleToggleStatus(selectedCompany.id, selectedCompany.status)}
                >
                  {selectedCompany?.status === 'active' ? "Suspender Acesso" : "Ativar Empresa"}
                </Button>
                <Button className="flex-1 rounded-xl h-11 font-bold" onClick={() => setIsUpdatingSub(true)}>
                  Ajustar Assinatura
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>



      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Empresa Multi-tenant</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Incorporadora</Label>
              <Input placeholder="Ex: Incorporadora Alpha" onChange={e => setNewCompany({...newCompany, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Slug Identificador (subdomain/id)</Label>
              <Input placeholder="incorporadora-alpha" onChange={e => setNewCompany({...newCompany, slug: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Plano Inicial</Label>
              <Select onValueChange={v => setNewCompany({...newCompany, plan: v as SubscriptionPlan})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddCompany}>Confirmar Ativação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
