import { useState, useCallback, useMemo, useEffect } from "react";
import { companyService, Company, CompanyStatus, SubscriptionPlan, CompanySettings } from "@/services";
import { userService } from "@/services";
import { useToast } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";

export const useSaaSAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Company>>({});
  const [newCompany, setNewCompany] = useState({ name: '', slug: '', plan: 'trial' as SubscriptionPlan });
  const [isUpdatingSub, setIsUpdatingSub] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const refreshCompanies = useCallback(async () => {
    const data = await companyService.getAll(undefined, true);
    setCompanies([...data]);
  }, []);

  useEffect(() => {
    refreshCompanies();
  }, [refreshCompanies]);

  const companyUsers = useMemo(() => {
    if (!selectedCompany) return [];
    return userService.getAllSync(selectedCompany.id, true);
  }, [selectedCompany]);

  const totalUsers = useMemo(() => 
    companies.reduce((acc, curr) => {
      const count = userService.count(curr.id, true);
      return acc + (count || 0);
    }, 0)
  , [companies]);

  const handleToggleStatus = useCallback(async (id: string, currentStatus: CompanyStatus) => {
    const nextStatus: CompanyStatus = currentStatus === 'active' ? 'suspended' : 'active';
    await companyService.update(id, { status: nextStatus }, true);
    refreshCompanies();
    toast({
      title: "Status operacional alterado",
      description: `Tenant agora está com status estratégico: ${nextStatus === 'active' ? 'Ativo' : 'Suspenso'}.`
    });
  }, [refreshCompanies, toast]);

  const handleAddCompany = useCallback(async () => {
    if (!newCompany.name || !newCompany.slug) {
      toast({ title: "Protocolo de Erro", description: "Nome e Slug são obrigatórios para a criação do tenant.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await companyService.create({
        name: newCompany.name,
        slug: newCompany.slug,
        status: 'active',
        plan_id: newCompany.plan.toLowerCase(),
        subscription_plan: newCompany.plan,
        owner_id: user?.id || "system",
        created_at: new Date(),
        updated_at: new Date()
      });
      refreshCompanies();
      setIsAddOpen(false);
      setNewCompany({ name: '', slug: '', plan: 'trial' });
      toast({ title: "Sincronização de Novo Tenant Concluída" });
    } finally {
      setIsSaving(false);
    }
  }, [newCompany, refreshCompanies, toast, user]);

  const handleUpdateSubscription = useCallback(async (id: string, plan: SubscriptionPlan, expiresAt: string) => {
    setIsSaving(true);
    try {
      await companyService.update(id, {
        plan_id: plan.toLowerCase(),
        subscription_plan: plan,
        subscription_expires_at: expiresAt ? new Date(expiresAt) : undefined,
        updated_at: new Date()
      }, true);
      
      refreshCompanies();
      setIsUpdatingSub(false);
      toast({ title: "Ciclo de Assinatura Atualizado" });
    } finally {
      setIsSaving(false);
    }
  }, [refreshCompanies, toast]);

  const handleSaveEdit = useCallback(async (id: string, data: Partial<Company>) => {
    setIsSaving(true);
    try {
      await companyService.update(id, data, true);
      refreshCompanies();
      setIsEditing(false);
      toast({ title: "Governança de Dados Atualizada" });
    } finally {
      setIsSaving(false);
    }
  }, [refreshCompanies, toast]);

  const handleDeleteCompany = useCallback(async (id: string) => {
    if (!window.confirm("Protocolo de Exclusão: Tem certeza que deseja eliminar este tenant permanentemente? Esta ação é irreversível.")) return;
    setIsSaving(true);
    try {
      await companyService.delete(id);
      refreshCompanies();
      setSelectedCompany(null);
      toast({ title: "Tenant Eliminado com Sucesso" });
    } finally {
      setIsSaving(false);
    }
  }, [refreshCompanies, toast]);

  const startEditing = useCallback(() => {
    if (selectedCompany) {
      setEditData({ ...selectedCompany });
      setIsEditing(true);
    }
  }, [selectedCompany]);

  return {
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
    startEditing,
    refreshCompanies
  };
};
