import { useState, useMemo, useCallback } from "react";
import { userService, User } from "@/services/UserService";
import { auditLogService } from "@/services/AuditLogService";
import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook to manage users logic.
 */
export const useUsers = () => {
  const { toast } = useToast();
  const [userList, setUserList] = useState<User[]>(userService.getAll());
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState({ search: "", role: "all", status: "all", property: "all", unit: "" });

  const refreshList = useCallback(() => {
    setUserList(userService.getAll());
  }, []);

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

  const stats = useMemo(() => ({
    total: userList.length,
    active: userList.filter(u => u.status === "active").length,
    inactive: userList.filter(u => u.status === "inactive").length,
    clients: userList.filter(u => u.role === "client").length,
    staff: userList.filter(u => u.role !== "client").length,
  }), [userList]);

  const saveUser = useCallback((userData: any, editingUserId?: string) => {
    if (editingUserId) {
      userService.update(editingUserId, userData);
      auditLogService.log({
        entityType: 'user',
        entityId: editingUserId,
        action: 'updated',
        performedBy: 'admin-1',
        performedByName: 'Administrador',
        performedByRole: 'admin',
        details: `Dados do usuário ${userData.name} atualizados.`
      });
      toast({ title: "Usuário atualizado", description: "As informações do usuário foram atualizadas com sucesso." });
    } else {
      const newUser = userService.create(userData);
      auditLogService.log({
        entityType: 'user',
        entityId: newUser.id!,
        action: 'created',
        performedBy: 'admin-1',
        performedByName: 'Administrador',
        performedByRole: 'admin',
        details: `Novo usuário ${userData.name} criado no sistema.`
      });
      toast({ title: "Usuário criado", description: "Novo usuário foi criado com sucesso." });
    }
    refreshList();
  }, [toast, refreshList]);

  const deleteUser = useCallback((userId: string) => {
    userService.delete(userId);
    auditLogService.log({
      entityType: 'user',
      entityId: userId,
      action: 'cancelled',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Usuário removido permanentemente do sistema.`
    });
    refreshList();
    toast({ title: "Usuário removido", description: "O usuário foi removido do sistema.", variant: "destructive" }); 
  }, [toast, refreshList]);

  const toggleUserStatus = useCallback((userId: string) => {
    const user = userService.getById(userId);
    if (user) {
      const newStatus = user.status === "active" ? "inactive" : "active";
      userService.update(userId, { status: newStatus });
      auditLogService.log({
        entityType: 'user',
        entityId: userId,
        action: 'updated',
        performedBy: 'admin-1',
        performedByName: 'Administrador',
        performedByRole: 'admin',
        details: `Status do usuário ${user.name} alterado para ${newStatus === 'active' ? 'Ativo' : 'Inativo'}.`
      });
      refreshList();
      toast({ title: "Status atualizado", description: "O status do usuário foi alterado." }); 
    }
  }, [toast, refreshList]);

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

  const bulkAction = useCallback((action: string) => {
    if (selectedUsers.length === 0) {
      toast({ title: "Nenhum usuário selecionado", description: "Selecione pelo menos um usuário.", variant: "destructive" });
      return;
    }
    
    selectedUsers.forEach(userId => {
      switch (action) {
        case "activate": userService.update(userId, { status: "active" }); break;
        case "deactivate": userService.update(userId, { status: "inactive" }); break;
        case "delete": userService.delete(userId); break;
      }
    });
    
    refreshList();
    toast({ 
      title: action === "delete" ? "Usuários removidos" : "Status atualizado", 
      description: `${selectedUsers.length} usuário(s) afetados.` 
    });
    setSelectedUsers([]);
  }, [selectedUsers, toast, refreshList]);

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
