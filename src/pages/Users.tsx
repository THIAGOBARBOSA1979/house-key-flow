import { useState } from "react";
import { Users as UsersIcon, Plus, Upload } from "lucide-react";
import { PageTemplate } from "@/components/Layout/PageTemplate";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/Users/UserForm";
import { UserFilters } from "@/components/Users/UserFilters";
import { UserCard } from "@/components/Users/UserCard";
import { useToast } from "@/hooks/use-toast";
import { DataView } from "@/components/shared/DataView";
import { exportService } from "@/services/ExportService";
import { useUsers } from "@/hooks/useUsers";
import { auditLogService } from "@/services/AuditLogService";
import { User as UserType } from "@/services/UserService";
import { UserStats } from "@/components/Users/UserStats";
import { UserActionBanner } from "@/components/Users/UserActionBanner";
import { UserBulkActions } from "@/components/Users/UserBulkActions";

const Users = () => {
  const { toast } = useToast();
  const {
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
    bulkAction
  } = useUsers();

  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  const handleOpenForm = (user: UserType | null = null) => {
    setEditingUser(user);
    setIsUserFormOpen(true);
  };

  const handleResendInvite = (user: UserType) => {
    toast({ title: "Convite enviado", description: `Convite enviado via WhatsApp para ${user.name}.` });
    auditLogService.log({
      entityType: 'user',
      entityId: user.id!,
      action: 'info_added',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Convite de acesso enviado via WhatsApp para ${user.name}.`
    });
  };

  const actions = (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" className="hidden sm:flex rounded-xl h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95">
        <Upload className="mr-2 h-4 w-4" /> Importar
      </Button>
      <Button onClick={() => handleOpenForm()} className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
        <Plus className="mr-2 h-4 w-4" strokeWidth={3} />
        Novo Usuário
      </Button>
    </div>
  );

  return (
    <PageTemplate
      title="Gestão de Usuários"
      description="Controle de acessos, perfis e vinculação de clientes a unidades."
      icon={UsersIcon}
      actions={actions}
    >
      <UserStats stats={stats} />

      <UserActionBanner stats={stats}>
        <UserBulkActions 
          selectedCount={selectedUsers.length} 
          onBulkAction={bulkAction} 
          onExport={() => exportService.exportToCSV(userList, 'usuarios_a2')} 
        />
      </UserActionBanner>

      <UserFilters onFilterChange={setFilters} totalUsers={filteredUsers.length} activeFilters={filters} />

      <DataView<UserType>
        items={filteredUsers}
        viewMode="grid"
        renderGrid={(user) => (
          <UserCard 
            key={user.id}
            user={user}
            isSelected={selectedUsers.includes(user.id!)}
            onSelect={toggleSelectUser}
            onEdit={handleOpenForm}
            onDelete={deleteUser}
            onToggleStatus={toggleUserStatus}
            onResendInvite={handleResendInvite}
            onViewProfile={(u) => toast({ title: "Perfil", description: `Visualizando ${u.name}` })}
          />
        )}
        emptyState={{
          title: "Nenhum usuário encontrado",
          description: "Ajuste os filtros para encontrar o que procura.",
          action: { label: "Limpar filtros", onClick: () => setFilters({ search: "", role: "all", status: "all", property: "all", unit: "" }) }
        }}
      />

      {isUserFormOpen && (
        <UserForm 
          isOpen={isUserFormOpen} 
          onClose={() => setIsUserFormOpen(false)} 
          onSave={(data) => {
            saveUser(data, editingUser?.id);
            setIsUserFormOpen(false);
          }}
          editingUser={editingUser}
        />
      )}
    </PageTemplate>
  );
};

export default Users;

