import React, { useState } from "react";
import { PageTemplate } from "@/components/Layout/PageTemplate";
import { companyService, Company, CompanyStatus, SubscriptionPlan } from "@/services/CompanyService";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  CreditCard,
  Plus
} from "lucide-react";
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
  const [newCompany, setNewCompany] = useState({ name: '', slug: '', plan: 'basic' as SubscriptionPlan });

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
      <DataTable columns={columns} data={companies} />

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
