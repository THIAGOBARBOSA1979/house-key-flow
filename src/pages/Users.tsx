import { useState } from "react";
import { Users as UsersIcon, Plus, User, UserCheck, UserCog, UserMinus, Download, Upload, Settings } from "lucide-react";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserForm } from "@/components/Users/UserForm";
import { UserFilters } from "@/components/Users/UserFilters";
import { UserCard } from "@/components/Users/UserCard";
import { useToast } from "@/hooks/use-toast";
import { StatsCard } from "@/components/shared/StatsCard";
import { DataView } from "@/components/shared/DataView";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { exportService } from "@/services/ExportService";
import { useUsers } from "@/hooks/useUsers";
import { auditLogService } from "@/services/AuditLogService";

/**
 * Refactored Users management page.
 */
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
  const [editingUser, setEditingUser] = useState<any>(null);

  const handleOpenForm = (user = null) => {
    setEditingUser(user);
    setIsUserFormOpen(true);
  };

  const handleResendInvite = (user: any) => {
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

  return (
    <div className="space-y-8 pb-10">
      <PageHeader 
        icon={UsersIcon} 
        title="Gestão de Usuários" 
        description="Controle de acessos, perfis e vinculação de clientes a unidades."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="hidden sm:flex rounded-xl h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95">
            <Upload className="mr-2 h-4 w-4" /> Importar
          </Button>
          <Button onClick={() => handleOpenForm()} className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
            <Plus className="mr-2 h-4 w-4" strokeWidth={3} />
            Novo Usuário
          </Button>
        </div>
      </PageHeader>

      <ResponsiveGrid columns="auto" gap="layout">
        <StatsCard label="Total de Usuários" value={stats.total} icon={UsersIcon} variant="brand" className="rounded-3xl" />
        <StatsCard label="Ativos hoje" value={stats.active} icon={UserCheck} variant="complete" className="rounded-3xl" />
        <StatsCard label="Pendências" value={stats.inactive} icon={UserMinus} variant="critical" className="rounded-3xl" />
        <StatsCard label="Total Clientes" value={stats.clients} icon={User} variant="progress" className="rounded-3xl" />
        <StatsCard label="Equipe Interna" value={stats.staff} icon={UserCog} variant="default" className="rounded-3xl" />
      </ResponsiveGrid>

      <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="flex -space-x-3">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-9 h-9 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-black">U{i}</div>
                 ))}
                 <div className="w-9 h-9 rounded-full border-2 border-background bg-primary text-white flex items-center justify-center text-[10px] font-black">+{Math.max(0, stats.total - 3)}</div>
               </div>
               <p className="text-sem-body-sm font-bold text-muted-foreground tracking-tight">Gestão centralizada de permissões</p>
            </div>
            
            <div className="flex items-center gap-3">
              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-3 animate-in zoom-in-95 duration-200">
                  <Badge className="h-9 px-4 rounded-xl bg-primary/10 text-primary border-none font-bold">
                    {selectedUsers.length} selecionado(s)
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="default" size="sm" className="rounded-xl h-11 px-6 font-black uppercase text-[10px] tracking-widest shadow-sem-md">
                        <Settings className="mr-2 h-4 w-4" /> Ações em lote
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-sem-xl border-none animate-in zoom-in-95">
                      <DropdownMenuItem className="py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary" onClick={() => bulkAction("activate")}>
                        <UserCheck className="mr-3 h-4 w-4 opacity-50" /> Ativar usuários
                      </DropdownMenuItem>
                      <DropdownMenuItem className="py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary" onClick={() => bulkAction("deactivate")}>
                        <UserMinus className="mr-3 h-4 w-4 opacity-50" /> Desativar usuários
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-2" />
                      <DropdownMenuItem onClick={() => bulkAction("delete")} className="py-3 px-4 font-black text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer rounded-xl">
                        <Trash2 className="mr-3 h-4 w-4 opacity-50" /> Remover permanentemente
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              <Button variant="outline" className="rounded-xl h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95" onClick={() => exportService.exportToCSV(userList, 'usuarios_a2')}>
                <Download className="mr-2 h-4 w-4" /> Exportar Planilha
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <UserFilters onFilterChange={setFilters} totalUsers={filteredUsers.length} activeFilters={filters} />

      <DataView
        items={filteredUsers}
        viewMode="grid"
        renderGrid={(items) => (
          <ResponsiveGrid columns={3} gap="layout">
            {items.map((user) => (
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
            ))}
          </ResponsiveGrid>
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
          onSubmit={(data) => {
            saveUser(data, editingUser?.id);
            setIsUserFormOpen(false);
          }}
          initialData={editingUser}
        />
      )}
    </div>
  );
};

export default Users;
