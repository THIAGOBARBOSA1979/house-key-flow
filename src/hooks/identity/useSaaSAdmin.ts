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
  const [newCompany, setNewCompany] = useState({ name: '', slug: '', plan: 'basic' as SubscriptionPlan });
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
      title: "Status atualizado",
      description: `Empresa agora está ${nextStatus === 'active' ? 'Ativa' : 'Suspensa'}.`
    });
  }, [refreshCompanies, toast]);

  const handleAddCompany = useCallback(async () => {
    if (!newCompany.name || !newCompany.slug) {
      toast({ title: "Erro", description: "Nome e Slug são obrigatórios.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await companyService.create({
        name: newCompany.name,
        slug: newCompany.slug,
        status: 'active',
        subscription_plan: newCompany.plan
      });
      refreshCompanies();
      setIsAddOpen(false);
      setNewCompany({ name: '', slug: '', plan: 'basic' });
      toast({ title: "Empresa cadastrada" });
    } finally {
      setIsSaving(false);
    }
  }, [newCompany, refreshCompanies, toast]);

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
    refreshCompanies
  };
};
