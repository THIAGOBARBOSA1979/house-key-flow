import React, { useState } from "react";
import { PageTemplate } from "@/components/Layout/PageTemplate";
import { Company } from "@/services";
import { DataTable } from "@/components/Shared/DataTable";
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
  Plus,
  Activity,
  Trash2,
  Shield
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Navigate } from "react-router-dom";

import { useSaaSAdmin } from "@/hooks";
import { SaaSStats } from "@/components/Admin/SaaS/SaaSStats";
import { AddCompanyDialog } from "@/components/Admin/SaaS/AddCompanyDialog";
import { CompanyDetailsDialog } from "@/components/Admin/SaaS/CompanyDetailsDialog";
import { GovernanceManager } from "@/components/Admin/GovernanceManager";
import { AuditLogViewer } from "@/components/Admin/AuditLogViewer";

import { propertyService } from "@/services";
import { inspectionService } from "@/services";
import { userService } from "@/services";

export default function SaaSAdmin() {
  const {
    user,
    companies,
    isAddOpen,
    setIsAddOpen,
    selectedCompany,
    setSelectedCompany,
    isEditing,
    setIsEditing,
    editData,
    setEditData,
    newCompany,
    setNewCompany,
    isUpdatingSub,
    setIsUpdatingSub,
    expiryDate,
    setExpiryDate,
    slugError,
    isSaving,
    companyUsers,
    totalUsers,
    handleToggleStatus,
    handleAddCompany,
    handleUpdateSubscription,
    handleSaveEdit,
    handleDeleteCompany,
    startEditing
  } = useSaaSAdmin();

  if (!user?.is_super_admin) {
    return <Navigate to="/admin" replace />;
  }

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
            <DropdownMenuItem onClick={() => {
              setSelectedCompany(c);
              startEditing();
            }}>
              Editar Configurações
            </DropdownMenuItem>
            <Separator className="my-1" />
            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCompany(c.id)}>
              <Trash2 className="w-4 h-4 mr-2" /> Excluir Permanente
            </DropdownMenuItem>
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
        <Button onClick={() => setIsAddOpen(true)} className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
          <Plus className="w-4 h-4 mr-2" strokeWidth={3} />
          Cadastrar Empresa
        </Button>
      }
    >
      <SaaSStats 
        companiesCount={companies.length}
        activeCompaniesCount={companies.filter(c => c.status === 'active').length}
        totalUsers={totalUsers}
      />

      <Tabs defaultValue="companies" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-12">
          <TabsTrigger value="companies" className="rounded-lg px-6 font-bold text-xs uppercase tracking-widest gap-2">
            <Building className="h-4 w-4" /> Tenants
          </TabsTrigger>
          <TabsTrigger value="governance" className="rounded-lg px-6 font-bold text-xs uppercase tracking-widest gap-2">
            <Shield className="h-4 w-4" /> Governança
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-lg px-6 font-bold text-xs uppercase tracking-widest gap-2">
            <Activity className="h-4 w-4" /> Auditoria Global
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-6">
          <DataTable 
            columns={columns} 
            data={companies} 
            onRowClick={(c) => setSelectedCompany(c)}
          />
        </TabsContent>

        <TabsContent value="governance">
          <GovernanceManager />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>

      <AddCompanyDialog 
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        newCompany={newCompany}
        setNewCompany={setNewCompany}
        slugError={slugError}
        isSaving={isSaving}
        onAdd={handleAddCompany}
      />

      <CompanyDetailsDialog 
        selectedCompany={selectedCompany}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCompany(null);
            setIsUpdatingSub(false);
            setIsEditing(false);
          }
        }}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        editData={editData}
        setEditData={setEditData}
        slugError={slugError}
        isSaving={isSaving}
        onSave={handleSaveEdit}
        onStartEditing={startEditing}
        isUpdatingSub={isUpdatingSub}
        setIsUpdatingSub={setIsUpdatingSub}
        expiryDate={expiryDate}
        setExpiryDate={setExpiryDate}
        onUpdateSub={handleUpdateSubscription}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteCompany}
        companyUsers={companyUsers}
        onResetPassword={(name) => {}}
        counts={{
          users: selectedCompany ? userService.count(selectedCompany.id, true) : 0,
          properties: selectedCompany ? propertyService.count(selectedCompany.id, true) : 0,
          inspections: selectedCompany ? inspectionService.count(selectedCompany.id, true) : 0
        }}
      />
    </PageTemplate>
  );
}
