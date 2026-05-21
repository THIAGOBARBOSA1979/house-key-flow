import { useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services";
import { useToast, useService, useDataList } from "@/hooks";
import { errorHandler } from "@/utils/errors/ErrorHandler";
import { User, UserFiltersData, UserFormData } from "@/types/user";


/**
 * Advanced hook for user management logic (Onda 4 Refactor)
 */
export const useUsers = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const companyId = currentUser?.company_id;

  const { 
    items: userList, 
    isLoading, 
    create, 
    update, 
    remove, 
    bulkUpdate, 
    bulkRemove,
    error
  } = useService<User>(userService, {
    toastMessages: {
      create: "Usuário registrado com sucesso no sistema.",
      update: "Perfil de usuário atualizado conforme protocolo.",
      delete: "Acesso de usuário revogado com sucesso."
    }
  });

  const filterFn = useCallback((user: User, filters: UserFiltersData) => {
    const matchesRole = filters.role === "all" || user.role === filters.role;
    const matchesStatus = filters.status === "all" || user.status === filters.status;
    
    const searchLower = filters.search?.toLowerCase() || "";
    const matchesSearch = !searchLower || 
      user.name.toLowerCase().includes(searchLower) || 
      user.email?.toLowerCase().includes(searchLower);

    const matchesProperty = filters.property === "all" || 
      (user.propertyName && user.propertyName.toLowerCase().includes(filters.property.toLowerCase()));
    
    const matchesUnit = !filters.unit || (user.unit && user.unit.includes(filters.unit));
    
    return matchesRole && matchesStatus && matchesSearch && matchesProperty && matchesUnit;
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

  const stats = useMemo(() => 
    userService.getStats(companyId, currentUser?.is_super_admin), 
    [companyId, currentUser?.is_super_admin, userList]
  );

  const saveUser = useCallback(async (userData: UserFormData, editingUserId?: string) => {
    try {
      if (editingUserId) {
        await update(editingUserId, userData);
      } else {
        await create({ ...userData, company_id: companyId });
      }
      return true;
    } catch (error) {
      console.error("Error saving user:", error);
      return false;
    }
  }, [create, update, companyId]);

  const toggleUserStatus = useCallback(async (userId: string) => {
    const user = userList.find(u => u.id === userId);
    if (user) {
      const newStatus = user.status === "active" ? "inactive" : "active";
      await update(userId, { status: newStatus });
    }
  }, [update, userList]);

  const handleResendInvite = useCallback(async (user: User) => {
    const success = await userService.sendInvitation(user);
    if (success) {
      toast({ 
        title: "Convite Enviado", 
        description: `Um novo convite foi enviado para ${user.name}.` 
      });
    } else {
      toast({ 
        title: "Erro ao Enviar", 
        description: "Não foi possível enviar o convite no momento.",
        variant: "destructive"
      });
    }
    return success;
  }, [toast]);

  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedUsers.length === 0) return;
    
    switch (action) {
      case "activate": 
        await bulkUpdate(selectedUsers, { status: "active" }); 
        break;
      case "deactivate": 
        await bulkUpdate(selectedUsers, { status: "inactive" }); 
        break;
      case "delete": 
        await bulkRemove(selectedUsers); 
        break;
    }
    
    setSelectedUsers([]);
  }, [selectedUsers, bulkUpdate, bulkRemove, setSelectedUsers]);

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
    deleteUser: remove,
    toggleUserStatus,
    toggleSelectUser,
    selectAll: () => selectAllItems(filteredUsers.map(u => u.id!)),
    handleBulkAction,
    handleResendInvite,
    error
  };
};


