import { useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services";
import { useToast, useService, useDataList } from "@/hooks";
import { User, UserFiltersData, UserFormData } from "@/types/user";

/**
 * Custom hook to manage users logic.
 */
export const useUsers = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { items: userList, isLoading, create, update, remove } = useService<User>(userService, {
    toastMessages: {
      create: "Novo usuário foi criado com sucesso.",
      update: "As informações do usuário foram atualizadas com sucesso.",
      delete: "O usuário foi removido do sistema."
    }
  });

  const filterFn = useCallback((user: User, filters: UserFiltersData) => {
    const matchesRole = filters.role === "all" || user.role === filters.role;
    const matchesStatus = filters.status === "all" || user.status === filters.status;
    const matchesProperty = filters.property === "all" || 
      (user.propertyName && user.propertyName.toLowerCase().includes(filters.property.toLowerCase()));
    const matchesUnit = !filters.unit || (user.unit && user.unit.includes(filters.unit));
    return matchesRole && matchesStatus && matchesProperty && matchesUnit;
  }, []);

  const {
    filteredItems: filteredUsers,
    filters,
    setFilters,
    selectedIds: selectedUsers,
    setSelectedIds: setSelectedUsers,
    toggleSelect: toggleSelectUser,
    selectAll: selectAllItems,
    searchTerm,
    setSearchTerm,
  } = useDataList<User>(userList, {
    initialFilters: { role: "all", status: "all", property: "all", unit: "" },
    filterFn
  });

  const selectAll = useCallback(() => {
    selectAllItems(filteredUsers.map(u => u.id!));
  }, [selectAllItems, filteredUsers]);

  const stats = useMemo(() => userService.getStats(companyId, user?.is_super_admin), [companyId, user?.is_super_admin]);

  const saveUser = useCallback(async (userData: UserFormData, editingUserId?: string) => {
    if (editingUserId) {
      await update(editingUserId, userData);
    } else {
      await create(userData);
    }
  }, [create, update]);

  const deleteUser = useCallback(async (userId: string) => {
    await remove(userId);
  }, [remove]);

  const toggleUserStatus = useCallback(async (userId: string) => {
    const user = userService.getById(userId);
    if (user) {
      const newStatus = user.status === "active" ? "inactive" : "active";
      await update(userId, { status: newStatus });
    }
  }, [update]);

  const bulkAction = useCallback(async (action: string) => {
    if (selectedUsers.length === 0) {
      toast({ title: "Nenhum usuário selecionado", description: "Selecione pelo menos um usuário.", variant: "destructive" });
      return;
    }
    
    for (const userId of selectedUsers) {
      switch (action) {
        case "activate": await update(userId, { status: "active" }); break;
        case "deactivate": await update(userId, { status: "inactive" }); break;
        case "delete": await remove(userId); break;
      }
    }
    
    toast({ 
      title: action === "delete" ? "Usuários removidos" : "Status atualizado", 
      description: `${selectedUsers.length} usuário(s) afetados.` 
    });
    setSelectedUsers([]);
  }, [selectedUsers, toast, update, remove, setSelectedUsers]);

  return {
    userList,
    isLoading,
    filteredUsers,
    selectedUsers,
    stats,
    filters: {
      search: searchTerm,
      role: (filters.role as any) || "all",
      status: (filters.status as any) || "all",
      property: (filters.property as any) || "all",
      unit: (filters.unit as any) || ""
    } as UserFiltersData,
    setFilters: (newFilters: Partial<UserFiltersData>) => {
      if (newFilters.search !== undefined) setSearchTerm(newFilters.search);
      setFilters(prev => ({ ...prev, ...newFilters }));
    },
    saveUser,
    deleteUser,
    toggleUserStatus,
    toggleSelectUser,
    selectAll,
    bulkAction
  };
};
