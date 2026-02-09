import { useState } from "react";
import { Users as UsersIcon, Plus, User, Mail, Phone, UserCheck, UserCog, UserMinus, MoreVertical, Edit, Trash2, Eye, Download, Upload, Settings } from "lucide-react";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserForm } from "@/components/Users/UserForm";
import { UserFilters } from "@/components/Users/UserFilters";
import { useToast } from "@/hooks/use-toast";

// Mock data and roleConfig
const users = [
  { id: "1", name: "João Silva", email: "joao.silva@email.com", phone: "(11) 99999-8888", role: "admin", status: "active", property: "Edifício Aurora", unit: "507", lastLogin: "2024-01-15", avatar: "JS" },
  { id: "2", name: "Maria Oliveira", email: "maria.oliveira@email.com", phone: "(11) 97777-6666", role: "client", status: "active", property: "Edifício Aurora", unit: "204", lastLogin: "2024-01-14", avatar: "MO" },
  { id: "3", name: "Roberto Pereira", email: "roberto.pereira@email.com", phone: "(11) 95555-4444", role: "client", status: "active", property: "Residencial Bosque Verde", unit: "102", lastLogin: "2024-01-13", avatar: "RP" },
  { id: "4", name: "Juliana Costa", email: "juliana.costa@email.com", phone: "(11) 93333-2222", role: "technical", status: "active", property: null, unit: null, lastLogin: "2024-01-15", avatar: "JC" },
  { id: "5", name: "Fernando Martins", email: "fernando.martins@email.com", phone: "(11) 91111-0000", role: "client", status: "inactive", property: "Residencial Bosque Verde", unit: "405", lastLogin: "2024-01-10", avatar: "FM" },
  { id: "6", name: "Luciana Santos", email: "luciana.santos@email.com", phone: "(11) 98888-7777", role: "manager", status: "active", property: null, unit: null, lastLogin: "2024-01-15", avatar: "LS" },
];

const roleConfig = {
  admin: { label: "Administrador", badge: "bg-purple-100 text-purple-800 border-purple-200", icon: UserCog },
  manager: { label: "Gerente", badge: "bg-blue-100 text-blue-800 border-blue-200", icon: UserCheck },
  technical: { label: "Técnico", badge: "bg-green-100 text-green-800 border-green-200", icon: UserCheck },
  client: { label: "Cliente", badge: "bg-gray-100 text-gray-800 border-gray-200", icon: User },
};

const Users = () => {
  const { toast } = useToast();
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState({ search: "", role: "all", status: "all", property: "all" });
  const [userList, setUserList] = useState(users);

  const filteredUsers = userList.filter(user => {
    const matchesSearch = !filters.search || 
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.phone.includes(filters.search);
    const matchesRole = filters.role === "all" || user.role === filters.role;
    const matchesStatus = filters.status === "all" || user.status === filters.status;
    const matchesProperty = filters.property === "all" || 
      (user.property && user.property.toLowerCase().includes(filters.property));
    return matchesSearch && matchesRole && matchesStatus && matchesProperty;
  });

  const stats = {
    total: userList.length,
    active: userList.filter(u => u.status === "active").length,
    inactive: userList.filter(u => u.status === "inactive").length,
    clients: userList.filter(u => u.role === "client").length,
    staff: userList.filter(u => u.role !== "client").length,
  };

  const handleSaveUser = (userData: any) => {
    if (editingUser) {
      setUserList(users => users.map(user => user.id === editingUser.id ? { ...user, ...userData } : user));
      setEditingUser(null);
      toast({ title: "Usuário atualizado", description: "As informações do usuário foram atualizadas com sucesso." });
    } else {
      const newUser = { id: Date.now().toString(), ...userData, status: "active", lastLogin: "-", avatar: userData.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() };
      setUserList(users => [...users, newUser]);
      toast({ title: "Usuário criado", description: "Novo usuário foi criado com sucesso." });
    }
  };

  const handleEditUser = (user: any) => { setEditingUser(user); setIsUserFormOpen(true); };
  const handleDeleteUser = (userId: string) => { setUserList(users => users.filter(user => user.id !== userId)); toast({ title: "Usuário removido", description: "O usuário foi removido do sistema.", variant: "destructive" }); };
  const handleToggleUserStatus = (userId: string) => { setUserList(users => users.map(user => user.id === userId ? { ...user, status: user.status === "active" ? "inactive" : "active" } : user)); toast({ title: "Status atualizado", description: "O status do usuário foi alterado." }); };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) { toast({ title: "Nenhum usuário selecionado", description: "Selecione pelo menos um usuário para executar esta ação.", variant: "destructive" }); return; }
    switch (action) {
      case "activate": setUserList(users => users.map(user => selectedUsers.includes(user.id) ? { ...user, status: "active" } : user)); toast({ title: "Usuários ativados", description: `${selectedUsers.length} usuário(s) foram ativados.` }); break;
      case "deactivate": setUserList(users => users.map(user => selectedUsers.includes(user.id) ? { ...user, status: "inactive" } : user)); toast({ title: "Usuários desativados", description: `${selectedUsers.length} usuário(s) foram desativados.` }); break;
      case "delete": setUserList(users => users.filter(user => !selectedUsers.includes(user.id))); toast({ title: "Usuários removidos", description: `${selectedUsers.length} usuário(s) foram removidos.`, variant: "destructive" }); break;
    }
    setSelectedUsers([]);
  };

  const handleSelectUser = (userId: string) => { setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]); };
  const handleSelectAll = () => { if (selectedUsers.length === filteredUsers.length) { setSelectedUsers([]); } else { setSelectedUsers(filteredUsers.map(user => user.id)); } };

  const renderUserCard = (user: any) => {
    const isSelected = selectedUsers.includes(user.id);
    return (
      <Card key={user.id} className={`transition-all duration-200 hover:shadow-lg ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Checkbox checked={isSelected} onCheckedChange={() => handleSelectUser(user.id)} />
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-lg">{user.avatar}</div>
              <div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-sm text-muted-foreground">Último login: {user.lastLogin}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast({ title: "Perfil do usuário", description: `Visualizando perfil de ${user.name}.` })}>
                  <Eye className="mr-2 h-4 w-4" />Ver perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditUser(user)}><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id)}>
                  {user.status === "active" ? <UserMinus className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                  {user.status === "active" ? "Desativar" : "Ativar"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Remover</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail size={14} /><span>{user.email}</span></div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone size={14} /><span>{user.phone}</span></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={roleConfig[user.role as keyof typeof roleConfig]?.badge}>{roleConfig[user.role as keyof typeof roleConfig]?.label}</Badge>
              {user.status === "inactive" && <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Inativo</Badge>}
            </div>
            {user.role === "client" && user.property && (
              <div className="text-xs text-muted-foreground text-right">
                <div className="font-medium">{user.property}</div>
                <div>Unidade {user.unit}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={UsersIcon} title="Usuários" description="Gerenciamento completo de usuários do sistema">
        <Button onClick={() => setIsUserFormOpen(true)}><Plus className="mr-2 h-4 w-4" />Novo Usuário</Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="text-center"><CardContent className="p-4"><div className="text-2xl font-bold text-primary">{stats.total}</div><div className="text-xs text-muted-foreground">Total</div></CardContent></Card>
        <Card className="text-center"><CardContent className="p-4"><div className="text-2xl font-bold text-emerald-600">{stats.active}</div><div className="text-xs text-muted-foreground">Ativos</div></CardContent></Card>
        <Card className="text-center"><CardContent className="p-4"><div className="text-2xl font-bold text-red-600">{stats.inactive}</div><div className="text-xs text-muted-foreground">Inativos</div></CardContent></Card>
        <Card className="text-center"><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600">{stats.clients}</div><div className="text-xs text-muted-foreground">Clientes</div></CardContent></Card>
        <Card className="text-center"><CardContent className="p-4"><div className="text-2xl font-bold text-purple-600">{stats.staff}</div><div className="text-xs text-muted-foreground">Equipe</div></CardContent></Card>
      </div>

      {/* Actions Bar - removed duplicate "Novo Usuário" */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Importar</Button>
              <Button variant="outline"><Download className="mr-2 h-4 w-4" />Exportar</Button>
            </div>
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selectedUsers.length} selecionado(s)</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><Settings className="mr-2 h-4 w-4" />Ações em lote</Button></DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction("activate")}><UserCheck className="mr-2 h-4 w-4" />Ativar usuários</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction("deactivate")}><UserMinus className="mr-2 h-4 w-4" />Desativar usuários</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkAction("delete")} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Remover usuários</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
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

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="admin">Administradores ({filteredUsers.filter(u => u.role === "admin" || u.role === "manager").length})</TabsTrigger>
          <TabsTrigger value="staff">Funcionários ({filteredUsers.filter(u => u.role === "technical").length})</TabsTrigger>
          <TabsTrigger value="clients">Clientes ({filteredUsers.filter(u => u.role === "client").length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4 pt-4"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredUsers.map(renderUserCard)}</div></TabsContent>
        <TabsContent value="admin" className="space-y-4 pt-4"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredUsers.filter(user => user.role === "admin" || user.role === "manager").map(renderUserCard)}</div></TabsContent>
        <TabsContent value="staff" className="space-y-4 pt-4"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredUsers.filter(user => user.role === "technical").map(renderUserCard)}</div></TabsContent>
        <TabsContent value="clients" className="space-y-4 pt-4"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredUsers.filter(user => user.role === "client").map(renderUserCard)}</div></TabsContent>
      </Tabs>

      <UserForm isOpen={isUserFormOpen} onClose={() => { setIsUserFormOpen(false); setEditingUser(null); }} onSave={handleSaveUser} editingUser={editingUser} />
    </div>
  );
};

export default Users;
