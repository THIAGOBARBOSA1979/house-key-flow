import { useState, useMemo, useCallback } from "react";
import { companyService, Company, CompanyStatus, SubscriptionPlan, CompanySettings } from "@/services/CompanyService";
import { userService } from "@/services/UserService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useSaaSAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>(() => companyService.getAll(undefined, true));
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Company>>({});
  const [newCompany, setNewCompany] = useState({ name: '', slug: '', plan: 'basic' as SubscriptionPlan });
  const [isUpdatingSub, setIsUpdatingSub] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const companyUsers = useMemo(() => {
    if (!selectedCompany) return [];
    return userService.getAll(selectedCompany.id, true);
  }, [selectedCompany]);

  const totalUsers = useMemo(() => 
    companies.reduce((acc, curr) => acc + (userService.count(curr.id, true) || 0), 0)
  , [companies]);

  const refreshCompanies = useCallback(() => {
    setCompanies(companyService.getAll(undefined, true));
  }, []);

  const handleToggleStatus = useCallback((id: string, currentStatus: CompanyStatus) => {
    const nextStatus: CompanyStatus = currentStatus === 'active' ? 'suspended' : 'active';
    companyService.toggleStatus(id, nextStatus);
    refreshCompanies();
    toast({
      title: "Status atualizado",
      description: `Empresa agora está ${nextStatus === 'active' ? 'Ativa' : 'Suspensa'}.`
    });
  }, [refreshCompanies, toast]);

  const handleAddCompany = useCallback(() => {
    setSlugError(null);
    if (!newCompany.name || !newCompany.slug) {
      toast({ title: "Erro", description: "Nome e Slug são obrigatórios.", variant: "destructive" });
      return;
    }

    const normalizedSlug = newCompany.slug.toLowerCase().trim().replace(/\s+/g, '-');
    
    if (!companyService.isSlugAvailable(normalizedSlug)) {
      setSlugError("Este slug já está em uso por outro tenant.");
      toast({ title: "Erro de Validação", description: "O slug informado já existe.", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    try {
      companyService.create({
        name: newCompany.name,
        slug: normalizedSlug,
        status: 'active',
        owner_id: 'pending',
        subscription_plan: newCompany.plan,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      refreshCompanies();
      setIsAddOpen(false);
      setNewCompany({ name: '', slug: '', plan: 'basic' });
      toast({ title: "Empresa cadastrada", description: "O novo tenant foi criado com sucesso." });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao criar empresa.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [newCompany, refreshCompanies, toast]);

  const handleUpdateSubscription = useCallback(() => {
    if (!selectedCompany || !expiryDate) return;
    
    companyService.updateSubscription(selectedCompany.id, selectedCompany.subscription_plan, new Date(expiryDate));
    refreshCompanies();
    setIsUpdatingSub(false);
    toast({ title: "Assinatura Atualizada", description: "A data de expiração foi modificada." });
  }, [selectedCompany, expiryDate, refreshCompanies, toast]);

  const handleSaveEdit = useCallback(() => {
    if (!selectedCompany || !editData.name || !editData.slug) {
      toast({ title: "Erro", description: "Campos obrigatórios faltando.", variant: "destructive" });
      return;
    }

    const normalizedSlug = editData.slug.toLowerCase().trim().replace(/\s+/g, '-');
    
    if (!companyService.isSlugAvailable(normalizedSlug, selectedCompany.id)) {
      setSlugError("Este slug já está em uso por outro tenant.");
      toast({ title: "Erro de Validação", description: "O slug informado já existe.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      companyService.update(selectedCompany.id, {
        name: editData.name,
        slug: normalizedSlug,
        subscription_plan: editData.subscription_plan,
        settings: editData.settings as CompanySettings,
        updated_at: new Date()
      });
      
      const updated = companyService.getById(selectedCompany.id, undefined, true);
      if (updated) setSelectedCompany(updated);
      
      refreshCompanies();
      setIsEditing(false);
      setSlugError(null);
      toast({ title: "Tenant Atualizado", description: "As informações da empresa foram salvas." });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar alterações.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [selectedCompany, editData, refreshCompanies, toast]);

  const handleDeleteCompany = useCallback((id: string) => {
    if (confirm("Deseja realmente excluir permanentemente este tenant? Todos os dados serão perdidos.")) {
      companyService.delete(id);
      refreshCompanies();
      setSelectedCompany(null);
      toast({ title: "Empresa excluída", variant: "destructive" });
    }
  }, [refreshCompanies, toast]);

  const startEditing = useCallback(() => {
    if (!selectedCompany) return;
    setSlugError(null);
    setEditData({
      name: selectedCompany.name,
      slug: selectedCompany.slug,
      subscription_plan: selectedCompany.subscription_plan,
      settings: { ...selectedCompany.settings }
    });
    setIsEditing(true);
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
    startEditing
  };
};
