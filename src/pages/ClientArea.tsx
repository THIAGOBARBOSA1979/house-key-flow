import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/Layout/PageHeader";
import { FilterBar } from "@/components/Layout/FilterBar";
import { DataView } from "@/components/Shared/DataView";
import { StatsCard } from "@/components/Shared/StatsCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User as UserIcon, UserCheck, Plus, Download, Key } from "lucide-react";
import { UserForm } from "@/components/Users/UserForm";
import { GenerateCredentialsForm } from "@/components/ClientArea/GenerateCredentialsForm";
import { userService } from "@/services/identity/UserService";
import { inspectionService } from "@/services/operations/InspectionService";
import { useToast } from "@/hooks/Shared/use-toast";
import { User as UserProfile } from "@/types/user";

const ClientArea = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewClientDialogOpen, setNewClientDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await (userService as any).getAllProfiles();
      if (error) throw error;
      setAllProfiles(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (data: any) => {
    try {
      const { error } = await (userService as any).createProfile(data);
      if (error) throw error;
      
      toast({
        title: "Cliente criado",
        description: "O perfil do cliente foi criado com sucesso.",
      });
      setNewClientDialogOpen(false);
      loadClients();
    } catch (error: any) {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCredentialsSubmit = async (data: any) => {
    toast({
      title: "Credenciais geradas",
      description: "As credenciais de acesso foram enviadas para o email do cliente.",
    });
    setCredentialsDialogOpen(false);
  };

  const filteredClients = allProfiles.filter(client => 
    client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-responsive py-layout-gap animate-fade-in">
      <PageHeader 
        title="Área do Cliente" 
        description="Gestão centralizada da jornada do proprietário e conformidade digital."
      >
        <Button variant="outline" className="hidden sm:flex">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
        <Button variant="outline" onClick={() => setCredentialsDialogOpen(true)}>
          <Key className="mr-2 h-4 w-4" />
          Habilitar Acessos
        </Button>
        <Button onClick={() => setNewClientDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </PageHeader>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-slow">
        <FilterBar
          searchPlaceholder="Buscar por nome, email, telefone ou empreendimento..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard label="Proprietários Homologados" value={allProfiles.length} icon={UserIcon} variant="brand" />
        <StatsCard label="Interações no Portal" value="28" icon={UserCheck} variant="complete" />
        <StatsCard label="Evolução de Leads" value="15" icon={Plus} variant="progress" />
      </div>

      <DataView
        items={filteredClients}
        viewMode={viewMode}
        isLoading={loading}
        renderItem={(client) => (
          <div 
            key={client.id} 
            className="card-standard p-6 cursor-pointer interactive-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{client.name || 'Sem nome'}</h3>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Telefone:</span>
                <span className="font-medium">{client.phone || 'Não informado'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cargo:</span>
                <span className="font-medium capitalize">{client.role}</span>
              </div>
            </div>
          </div>
        )}
      />

      {/* Dialogs */}
      <Dialog open={isNewClientDialogOpen} onOpenChange={setNewClientDialogOpen}>
        <DialogContent className="sm:max-w-dialog-md p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b bg-muted/5">
            <DialogTitle className="text-2xl font-black tracking-tight">Novo Proprietário</DialogTitle>
            <DialogDescription className="text-sm font-medium">Cadastre um novo cliente no ecossistema digital.</DialogDescription>
          </DialogHeader>
          <div className="p-layout-gap max-h-[70vh] overflow-y-auto">
            <UserForm onSave={handleCreateClient} onCancel={() => setNewClientDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCredentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
        <DialogContent className="sm:max-w-dialog-md p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b bg-muted/5">
            <DialogTitle className="text-2xl font-black tracking-tight">Habilitação de Acessos Corporativos</DialogTitle>
            <DialogDescription className="text-sm font-medium">Configure os parâmetros de segurança e libere o ecossistema digital para o cliente.</DialogDescription>
          </DialogHeader>
          <div className="p-layout-gap max-h-[70vh] overflow-y-auto">
            <GenerateCredentialsForm onSubmit={handleCredentialsSubmit} onCancel={() => setCredentialsDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientArea;