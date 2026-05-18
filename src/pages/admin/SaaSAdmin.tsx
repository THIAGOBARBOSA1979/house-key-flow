import React, { useState, useMemo } from "react";
import { PageTemplate } from "@/components/Layout/PageTemplate";
import { companyService, Company, CompanyStatus, SubscriptionPlan, CompanySettings } from "@/services/CompanyService";
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
  Activity,
  Edit2,
  Save,
  Trash2,
  Mail,
  Smartphone,
  ShieldCheck
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
import { Separator } from "@/components/ui/separator";

export default function SaaSAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>(companyService.getAll(undefined, true));
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Company>>({});
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

  const startEditing = () => {
    if (!selectedCompany) return;
    setEditData({
      name: selectedCompany.name,
      slug: selectedCompany.slug,
      subscription_plan: selectedCompany.subscription_plan,
      settings: { ...selectedCompany.settings }
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!selectedCompany || !editData.name) return;
    
    companyService.update(selectedCompany.id, {
      name: editData.name,
      slug: editData.slug,
      subscription_plan: editData.subscription_plan,
      settings: editData.settings as CompanySettings,
      updated_at: new Date()
    });
    
    const updated = companyService.getById(selectedCompany.id, undefined, true);
    if (updated) setSelectedCompany(updated);
    
    setCompanies(companyService.getAll(undefined, true));
    setIsEditing(false);
    toast({ title: "Tenant Atualizado", description: "As informações da empresa foram salvas." });
  };

  const handleDeleteCompany = (id: string) => {
    if (confirm("Deseja realmente excluir permanentemente este tenant? Todos os dados serão perdidos.")) {
      companyService.delete(id);
      setCompanies(companyService.getAll(undefined, true));
      setSelectedCompany(null);
      toast({ title: "Empresa excluída", variant: "destructive" });
    }
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

      <Dialog open={!!selectedCompany} onOpenChange={(open) => {
        if (!open) {
          setSelectedCompany(null);
          setIsUpdatingSub(false);
          setIsEditing(false);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between pr-8">
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">
              {isEditing ? "Editando Tenant" : `Gestão de Tenant: ${selectedCompany?.name}`}
            </DialogTitle>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={startEditing} className="gap-2 rounded-xl">
                <Edit2 className="w-4 h-4" /> Editar Info
              </Button>
            )}
          </DialogHeader>

          {isEditing ? (
            <div className="py-4 space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome da Empresa</Label>
                  <Input 
                    value={editData.name || ''} 
                    onChange={e => setEditData({...editData, name: e.target.value})}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Slug (ID Único)</Label>
                  <Input 
                    value={editData.slug || ''} 
                    onChange={e => setEditData({...editData, slug: e.target.value})}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plano de Assinatura</Label>
                  <Select 
                    value={editData.subscription_plan} 
                    onValueChange={v => setEditData({...editData, subscription_plan: v as SubscriptionPlan})}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">E-mail de Suporte</Label>
                  <Input 
                    value={editData.settings?.support_email || ''} 
                    onChange={e => setEditData({
                      ...editData, 
                      settings: { ...editData.settings, support_email: e.target.value }
                    })}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl h-11 px-6 font-bold">Cancelar</Button>
                <Button onClick={handleSaveEdit} className="rounded-xl h-11 px-8 font-black uppercase tracking-widest text-xs gap-2">
                  <Save className="w-4 h-4" /> Salvar Alterações
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                    <Building className="w-3 h-3" /> Slug
                  </p>
                  <p className="font-bold truncate">{selectedCompany?.slug}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Plano
                  </p>
                  <Badge variant="outline" className="font-black uppercase text-[10px]">
                    {selectedCompany?.subscription_plan}
                  </Badge>
                </div>
                <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Status
                  </p>
                  <Badge className={selectedCompany?.status === 'active' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}>
                    {selectedCompany?.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Expira em
                  </p>
                  <p className="font-bold text-xs">
                    {selectedCompany?.subscription_expires_at ? new Date(selectedCompany.subscription_expires_at).toLocaleDateString() : 'Vitalício'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Indicadores
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      <Card className="p-4 flex items-center justify-between border-none bg-muted/20">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Usuários</span>
                        <span className="text-xl font-black">{selectedCompany ? userService.count(selectedCompany.id, true) : 0}</span>
                      </Card>
                      <Card className="p-4 flex items-center justify-between border-none bg-muted/20">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Obras</span>
                        <span className="text-xl font-black">{selectedCompany ? propertyService.count(selectedCompany.id, true) : 0}</span>
                      </Card>
                      <Card className="p-4 flex items-center justify-between border-none bg-muted/20">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Vistorias</span>
                        <span className="text-xl font-black">{selectedCompany ? inspectionService.count(selectedCompany.id, true) : 0}</span>
                      </Card>
                    </div>
                  </div>

                  <div className="p-5 border-2 border-dashed rounded-2xl space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ações de Governança</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start font-bold h-10 rounded-xl"
                        onClick={() => selectedCompany && handleToggleStatus(selectedCompany.id, selectedCompany.status)}
                      >
                        {selectedCompany?.status === 'active' ? <XCircle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        {selectedCompany?.status === 'active' ? "Suspender Acesso" : "Ativar Empresa"}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start font-bold h-10 rounded-xl"
                        onClick={() => setIsUpdatingSub(true)}
                      >
                        <Calendar className="w-4 h-4 mr-2" /> Alterar Expiração
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start font-bold h-10 rounded-xl text-destructive hover:bg-destructive/10"
                        onClick={() => selectedCompany && handleDeleteCompany(selectedCompany.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Excluir Permanentemente
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <UsersIcon className="w-4 h-4" /> Usuários Ativos
                    </h4>
                    <Badge variant="secondary" className="rounded-full">{companyUsers.length}</Badge>
                  </div>
                  
                  <div className="border rounded-2xl overflow-hidden bg-card">
                    <div className="max-h-[300px] overflow-y-auto">
                      {companyUsers.length > 0 ? (
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50 text-[10px] uppercase font-black sticky top-0 z-10">
                            <tr>
                              <th className="text-left p-4">Colaborador</th>
                              <th className="text-left p-4">Papel</th>
                              <th className="text-right p-4">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {companyUsers.map(u => (
                              <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <span className="font-bold">{u.name}</span>
                                    <span className="text-[10px] text-muted-foreground">{u.email}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge variant="outline" className="uppercase text-[9px] font-black border-primary/20 text-primary">
                                    {u.role}
                                  </Badge>
                                </td>
                                <td className="p-4 text-right">
                                  <Button variant="ghost" size="sm" className="text-[10px] h-8 font-black uppercase tracking-widest" onClick={() => handleResetPassword(u.name)}>
                                    Resetar
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-12 text-center space-y-2">
                          <UsersIcon className="w-8 h-8 mx-auto text-muted-foreground/20" />
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nenhum usuário localizado</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isUpdatingSub && (
                <div className="p-6 border-2 border-primary bg-primary/5 rounded-2xl space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary">Ajuste de Validade Estratégica</h4>
                    <Button variant="ghost" size="sm" onClick={() => setIsUpdatingSub(false)}>Cancelar</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">Nova Data de Expiração</Label>
                      <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="h-11 rounded-xl" />
                    </div>
                    <Button className="h-11 rounded-xl font-black uppercase tracking-widest text-xs" onClick={handleUpdateSubscription}>
                      Confirmar Nova Data
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
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
