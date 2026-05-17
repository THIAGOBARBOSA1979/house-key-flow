import { useState, useMemo } from "react";
import { Users as UsersIcon, Plus, User, Mail, Phone, UserCheck, UserCog, UserMinus, MoreVertical, Edit, Trash2, Eye, Download, Upload, Settings, Share2 } from "lucide-react";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserForm } from "@/components/Users/UserForm";
import { UserFilters } from "@/components/Users/UserFilters";
import { useToast } from "@/hooks/use-toast";
import { userService, type User as UserType } from "@/services/UserService";
import { auditLogService } from "@/services/AuditLogService";
import { StatsCard } from "@/components/shared/StatsCard";
import { DataView } from "@/components/shared/DataView";
import { DataTable } from "@/components/shared/DataTable";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { cn } from "@/lib/utils";
import { exportService } from "@/services/ExportService";

const roleConfig = {
  admin: { label: "Administrador", badge: "bg-purple-100 text-purple-800 border-purple-200", icon: UserCog },
  manager: { label: "Gerente", badge: "bg-blue-100 text-blue-800 border-blue-200", icon: UserCheck },
  technical: { label: "Técnico", badge: "bg-green-100 text-green-800 border-green-200", icon: UserCheck },
  client: { label: "Cliente", badge: "bg-gray-100 text-gray-800 border-gray-200", icon: User },
};

const Users = () => {
  const { toast: showToast } = useToast();
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState({ search: "", role: "all", status: "all", property: "all", unit: "" });
  const [userList, setUserList] = useState<UserType[]>(userService.getAll());

  const refreshList = () => {
    setUserList(userService.getAll());
  };

  const filteredUsers = useMemo(() => {
    return userList.filter(user => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone.includes(filters.search);
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

  const handleSaveUser = (userData: any) => {
    if (editingUser?.id) {
      userService.update(editingUser.id, userData);
      auditLogService.log({
        entityType: 'user',
        entityId: editingUser.id,
        action: 'updated',
        performedBy: 'admin-1',
        performedByName: 'Administrador',
        performedByRole: 'admin',
        details: `Dados do usuário ${userData.name} atualizados.`
      });
      showToast({ title: "Usuário atualizado", description: "As informações do usuário foram atualizadas com sucesso." });
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
      showToast({ title: "Usuário criado", description: "Novo usuário foi criado com sucesso." });
    }
    refreshList();
    setIsUserFormOpen(false);
    setEditingUser(null);
  };

  const handleEditUser = (user: UserType) => { 
    setEditingUser(user); 
    setIsUserFormOpen(true); 
  };

  const handleDeleteUser = (userId: string) => { 
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
    showToast({ title: "Usuário removido", description: "O usuário foi removido do sistema.", variant: "destructive" }); 
  };

  const handleToggleUserStatus = (userId: string) => { 
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
      showToast({ title: "Status atualizado", description: "O status do usuário foi alterado." }); 
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) { 
      showToast({ title: "Nenhum usuário selecionado", description: "Selecione pelo menos um usuário para executar esta ação.", variant: "destructive" }); 
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
    showToast({ 
      title: action === "delete" ? "Usuários removidos" : "Status atualizado", 
      description: `${selectedUsers.length} usuário(s) afetados.`,
      variant: action === "delete" ? "destructive" : "default"
    });
    setSelectedUsers([]);
  };

  const handleSelectUser = (userId: string) => { 
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]); 
  };
  
  const handleSelectAll = () => { 
    if (selectedUsers.length === filteredUsers.length && filteredUsers.length > 0) { 
      setSelectedUsers([]); 
    } else { 
      setSelectedUsers(filteredUsers.map(user => user.id!)); 
    } 
  };

  const renderUserCard = (user: UserType) => {
    const isSelected = selectedUsers.includes(user.id!);
    return (
      <Card 
        key={user.id} 
        className={cn(
          "card-standard overflow-hidden card-hover-effect border-none bg-card/50 backdrop-blur-sm group",
          isSelected && "ring-2 ring-primary"
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Checkbox checked={isSelected} onCheckedChange={() => handleSelectUser(user.id!)} className="rounded-md" />
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-lg border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                {user.avatar}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">{user.name}</h3>
                <p className="text-sem-tiny text-muted-foreground uppercase font-bold tracking-tighter">Login: {user.lastLogin || '-'}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/5">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-sem-lg animate-in fade-in zoom-in-95 duration-200 p-2 rounded-2xl border-none">
                <DropdownMenuItem className="py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary" onClick={() => setSelectedProperty(user)}>
                  <Eye className="mr-3 h-4 w-4 text-muted-foreground" />Ver Perfil Completo
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary" onClick={() => handleEditUser(user)}>
                  <Edit className="mr-3 h-4 w-4 text-muted-foreground" />Editar Dados
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary" onClick={() => {
                  showToast({ title: "Convite enviado", description: `Um convite foi enviado via WhatsApp para ${user.name}.` });
                  auditLogService.log({
                    entityType: 'user',
                    entityId: user.id!,
                    action: 'info_added',
                    performedBy: 'admin-1',
                    performedByName: 'Administrador',
                    performedByRole: 'admin',
                    details: `Convite de acesso enviado via WhatsApp para ${user.name}.`
                  });
                }}>
                  <Share2 className="mr-3 h-4 w-4 text-muted-foreground" /> Reenviar Convite
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary" onClick={() => handleToggleUserStatus(user.id!)}>
                  {user.status === "active" ? <UserMinus className="mr-3 h-4 w-4 text-muted-foreground" /> : <UserCheck className="mr-3 h-4 w-4 text-muted-foreground" />}
                  {user.status === "active" ? "Desativar Acesso" : "Ativar Acesso"}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem onClick={() => handleDeleteUser(user.id!)} className="py-3 px-4 font-black text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer rounded-xl">
                  <Trash2 className="mr-3 h-4 w-4 opacity-50" />Remover Permanentemente
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2.5 text-sem-body-sm text-muted-foreground">
              <div className="p-1 bg-muted rounded-md"><Mail size={12} /></div>
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sem-body-sm text-muted-foreground">
              <div className="p-1 bg-muted rounded-md"><Phone size={12} /></div>
              <span>{user.phone}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border/10">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={cn("text-sem-tiny font-bold rounded-lg", roleConfig[user.role as keyof typeof roleConfig]?.badge)}>
                {roleConfig[user.role as keyof typeof roleConfig]?.label}
              </Badge>
              {user.status === "inactive" && (
                <Badge variant="outline" className="text-sem-tiny font-bold bg-status-critical/10 text-status-critical border-status-critical/20 rounded-lg">
                  Inativo
                </Badge>
              )}
            </div>
            {user.role === "client" && user.propertyName && (
              <div className="text-right">
                <p className="text-sem-tiny font-bold uppercase tracking-tighter text-primary">{user.propertyName}</p>
                <p className="text-sem-tiny text-muted-foreground font-medium">Unidade {user.unit}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
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
          <Button onClick={() => { setEditingUser(null); setIsUserFormOpen(true); }} className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
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
                 <div className="w-9 h-9 rounded-full border-2 border-background bg-primary text-white flex items-center justify-center text-[10px] font-black">+{stats.total - 3}</div>
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
                      <DropdownMenuItem className="py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary" onClick={() => handleBulkAction("activate")}>
                        <UserCheck className="mr-3 h-4 w-4 opacity-50" /> Ativar usuários
                      </DropdownMenuItem>
                      <DropdownMenuItem className="py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary" onClick={() => handleBulkAction("deactivate")}>
                        <UserMinus className="mr-3 h-4 w-4 opacity-50" /> Desativar usuários
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-2" />
                      <DropdownMenuItem onClick={() => handleBulkAction("delete")} className="py-3 px-4 font-black text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer rounded-xl">
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

      {filteredUsers.length > 0 && (
        <div className="flex items-center gap-2">
          <Checkbox checked={selectedUsers.length === filteredUsers.length} onCheckedChange={handleSelectAll} />
          <span className="text-sm text-muted-foreground">Selecionar todos os usuários ({filteredUsers.length})</span>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl w-full justify-start overflow-x-auto h-auto">
          <TabsTrigger value="all" className="rounded-lg py-2 font-bold text-xs">Todos ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="admin" className="rounded-lg py-2 font-bold text-xs">Administradores ({filteredUsers.filter(u => u.role === "admin" || u.role === "manager").length})</TabsTrigger>
          <TabsTrigger value="staff" className="rounded-lg py-2 font-bold text-xs">Funcionários ({filteredUsers.filter(u => u.role === "technical").length})</TabsTrigger>
          <TabsTrigger value="clients" className="rounded-lg py-2 font-bold text-xs">Clientes ({filteredUsers.filter(u => u.role === "client").length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <DataView items={filteredUsers} renderGrid={renderUserCard} itemsPerPage={8} emptyState={{ title: "Nenhum usuário encontrado", description: "Tente ajustar seus filtros." }} />
        </TabsContent>
        <TabsContent value="admin" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <DataView items={filteredUsers.filter(user => user.role === "admin" || user.role === "manager")} renderGrid={renderUserCard} />
        </TabsContent>
        <TabsContent value="staff" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <DataView items={filteredUsers.filter(user => user.role === "technical")} renderGrid={renderUserCard} />
        </TabsContent>
        <TabsContent value="clients" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <DataView items={filteredUsers.filter(user => user.role === "client")} renderGrid={renderUserCard} />
        </TabsContent>
      </Tabs>

      <UserForm 
        isOpen={isUserFormOpen} 
        onClose={() => { setIsUserFormOpen(false); setEditingUser(null); }} 
        onSave={handleSaveUser} 
        editingUser={editingUser} 
      />
    </div>
  );
};

export default Users;
