import { useState, useCallback } from "react";
import { Users as UsersIcon, Plus, Upload, MoreHorizontal, Pencil, Trash2, ShieldCheck, Mail } from "lucide-react";
import { PageTemplate } from "@/components/Layout/PageTemplate";
import { Button } from "@/components/ui/button";
import { UserFilters } from "@/components/identity/UserFilters";
import { UserCard } from "@/components/identity/UserCard";
import { UserDialogs } from "@/components/identity/UserDialogs";
import { useToast, useConfirm } from "@/hooks";
import { DataView } from "@/components/Shared/DataView";
import { DataViewMode } from "@/types";
import { exportService } from "@/services";
import { useUsers } from "@/hooks";
import { User as UserType, UserFiltersData } from "@/types/user";
import { UserStats } from "@/components/identity/UserStats";
import { UserActionBanner } from "@/components/identity/UserActionBanner";
import { UserBulkActions } from "@/components/identity/UserBulkActions";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/Shared/StatusBadge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

/**
 * User Governance Page (Refactored in Wave 4)
 * Centralizes user management, permissions, and company linking.
 */
const Users = () => {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const {
    userList,
    filteredUsers,
    isLoading,
    selectedUsers,
    stats,
    filters,
    setFilters,
    saveUser,
    deleteUser,
    toggleUserStatus,
    toggleSelectUser,
    handleBulkAction,
    handleResendInvite,
    error: usersError
  } = useUsers();

  
  const [viewMode, setViewMode] = useState<DataViewMode>("grid");
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  const handleOpenForm = useCallback((user: UserType | null = null) => {
    setEditingUser(user);
    setIsUserFormOpen(true);
  }, []);

  const handleDeleteUser = useCallback(async (user: UserType) => {
    const result = await confirm({
      title: "Confirmar Exclusão",
      description: `Deseja realmente excluir o usuário "${user.name}"? Esta ação não pode ser desfeita.`,
      confirmLabel: "Excluir",
      variant: "destructive"
    });
    
    if (result && user.id) {
      deleteUser(user.id);
    }
  }, [confirm, deleteUser]);

  const actions = (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" className="hidden sm:flex rounded-xl h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95">
        <Upload className="mr-2 h-4 w-4" /> Importação em Massa
      </Button>
      <Button onClick={() => handleOpenForm()} className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
        <Plus className="mr-2 h-4 w-4" strokeWidth={3} />
        Novo Usuário
      </Button>
    </div>
  );

  return (
    <PageTemplate
      title="Governança de Usuários"
      description="Gerencie permissões, controle de acesso e vincule clientes às suas unidades com segurança."
      icon={UsersIcon}
      actions={actions}
    >
      <UserStats stats={stats} />

      <UserActionBanner stats={stats}>
        <UserBulkActions 
          selectedCount={selectedUsers.length} 
          onBulkAction={handleBulkAction} 
          onExport={() => exportService.exportToCSV(userList, 'governancausuarios_a2')} 
        />
      </UserActionBanner>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <UserFilters onFilterChange={setFilters} totalUsers={filteredUsers.length} activeFilters={filters} />
        <div className="flex bg-muted/40 p-1 rounded-xl">
           <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="rounded-lg h-8 w-8 p-0">
             <UsersIcon className="h-4 w-4" />
           </Button>
           <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('table')} className="rounded-lg h-8 w-8 p-0">
             <MoreHorizontal className="h-4 w-4 rotate-90" />
           </Button>
        </div>
      </div>
      
      <DataView<UserType>
        items={filteredUsers}
        isLoading={isLoading}
        isError={!!usersError}
        error={{
          message: (usersError as any)?.message
        }}
        skeletonType="table"

        viewMode={viewMode}
        itemsPerPage={8}
        renderGrid={(user) => (
          <UserCard 
            key={user.id}
            user={user}
            isSelected={selectedUsers.includes(user.id!)}
            onSelect={toggleSelectUser}
            onEdit={handleOpenForm}
            onDelete={() => handleDeleteUser(user)}
            onToggleStatus={toggleUserStatus}
            onResendInvite={handleResendInvite}
            onViewProfile={(u) => toast({ title: "Perfil", description: `Visualizando ${u.name}` })}
          />
        )}
        columns={[
          {
            header: "",
            accessorKey: "id",
            cell: (user: UserType) => (
              <Checkbox 
                checked={selectedUsers.includes(user.id!)}
                onCheckedChange={() => toggleSelectUser(user.id!)}
                onClick={(e) => e.stopPropagation()}
              />
            )
          },
          { 
            header: "Usuário", 
            accessorKey: "name",
            cell: (user: UserType) => (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground">{user.email}</span>
                </div>
              </div>
            )
          },
          { header: "Perfil", accessorKey: "role", cell: (user: UserType) => (
            <span className="text-xs font-medium uppercase tracking-wider">{user.role}</span>
          )},
          { header: "Status", accessorKey: "status", cell: (user: UserType) => (
            <StatusBadge status={user.status === 'active' ? 'complete' : 'pending'} size="sm" />
          )},
          {
            header: "Ações",
            accessorKey: "id",
            className: "text-right",
            cell: (user: UserType) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleOpenForm(user)}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleResendInvite(user)}><Mail className="mr-2 h-4 w-4" /> Reenviar Convite</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleUserStatus(user.id!)}><ShieldCheck className="mr-2 h-4 w-4" /> {user.status === 'active' ? 'Desativar' : 'Ativar'}</DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive font-bold" 
                    onClick={() => handleDeleteUser(user)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
        ]}
        emptyState={{
          title: "Nenhum usuário encontrado",
          description: "Ajuste os filtros para encontrar o que procura.",
          action: { 
            label: "Limpar filtros", 
            onClick: () => setFilters({ search: "", role: "all", status: "all", property: "all", unit: "" } as UserFiltersData) 
          }
        }}
      />

      <UserDialogs 
        isFormOpen={isUserFormOpen} 
        setIsFormOpen={setIsUserFormOpen} 
        editingUser={editingUser} 
        onSave={(data) => saveUser(data, editingUser?.id)} 
      />
    </PageTemplate>
  );
};

export default Users;
