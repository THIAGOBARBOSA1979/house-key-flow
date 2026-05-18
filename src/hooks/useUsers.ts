import { useState, useMemo, useCallback } from "react";
import { userService } from "@/services/UserService";
import { auditLogService } from "@/services/AuditLogService";
import { useToast } from "@/hooks/use-toast";
import { useService } from "@/hooks/useService";
import { User, UserFiltersData, UserFormData } from "@/types/user";

/**
 * Custom hook to manage users logic.
 */
export const useUsers = () => {
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState<UserFiltersData>({ search: "", role: "all", status: "all", property: "all", unit: "" });

  const { items: userList, create, update, remove, refresh } = useService<User>(userService, {
    toastMessages: {
      create: "Novo usuário foi criado com sucesso.",
      update: "As informações do usuário foram atualizadas com sucesso.",
      delete: "O usuário foi removido do sistema."
    }
  });

  const filteredUsers = useMemo(() => {
    return userList.filter(user => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.phone && user.phone.includes(filters.search));
      const matchesRole = filters.role === "all" || user.role === filters.role;
      const matchesStatus = filters.status === "all" || user.status === filters.status;
      const matchesProperty = filters.property === "all" || 
        (user.propertyName && user.propertyName.toLowerCase().includes(filters.property.toLowerCase()));
      const matchesUnit = !filters.unit || (user.unit && user.unit.includes(filters.unit));
      return matchesSearch && matchesRole && matchesStatus && matchesProperty && matchesUnit;
    });
  }, [userList, filters]);

  const stats = useMemo(() => userService.getStats(), []);

  const saveUser = useCallback(async (userData: UserFormData, editingUserId?: string) => {
    if (editingUserId) {
      const updated = await update(editingUserId, userData);
      if (updated) {
        auditLogService.log({
          entityType: 'user',
          entityId: editingUserId,
          action: 'updated',
          performedBy: 'admin-1',
          performedByName: 'Administrador',
          performedByRole: 'admin',
          details: `Dados do usuário ${userData.name} atualizados.`
        });
      }
    } else {
      const newUser = await create(userData);
      if (newUser) {
        auditLogService.log({
          entityType: 'user',
          entityId: newUser.id!,
          action: 'created',
          performedBy: 'admin-1',
          performedByName: 'Administrador',
          performedByRole: 'admin',
          details: `Novo usuário ${userData.name} criado no sistema.`
        });
      }
    }
  }, [create, update]);

  const deleteUser = useCallback(async (userId: string) => {
    const success = await remove(userId);
    if (success) {
      auditLogService.log({
        entityType: 'user',
        entityId: userId,
        action: 'cancelled',
        performedBy: 'admin-1',
        performedByName: 'Administrador',
        performedByRole: 'admin',
        details: `Usuário removido permanentemente do sistema.`
      });
    }
  }, [remove]);

  const toggleUserStatus = useCallback(async (userId: string) => {
    const user = userService.getById(userId);
    if (user) {
      const newStatus = user.status === "active" ? "inactive" : "active";
      const updated = await update(userId, { status: newStatus });
      if (updated) {
        auditLogService.log({
          entityType: 'user',
          entityId: userId,
          action: 'updated',
          performedBy: 'admin-1',
          performedByName: 'Administrador',
          performedByRole: 'admin',
          details: `Status do usuário ${user.name} alterado para ${newStatus === 'active' ? 'Ativo' : 'Inativo'}.`
        });
      }
    }
  }, [update]);

  const toggleSelectUser = useCallback((userId: string) => {
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  }, []);

  const selectAll = useCallback(() => {
    if (selectedUsers.length === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id!));
    }
  }, [selectedUsers.length, filteredUsers]);

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
  }, [selectedUsers, toast, update, remove]);

  return {
    userList,
    filteredUsers,
    selectedUsers,
    stats,
    filters,
    setFilters,
    saveUser,
    deleteUser,
    toggleUserStatus,
    toggleSelectUser,
    selectAll,
    bulkAction
  };
};
