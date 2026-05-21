import React, { useState } from "react";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { FilterBar } from "@/components/layout/FilterBar";
import { DataView } from "@/components/shared/DataView";
import { StatsCard } from "@/components/shared/StatsCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User as UserIcon, UserCheck, Plus, Download, Key, ChevronRight, MapPin, Building, History, Activity } from "lucide-react";
import { UserForm } from "@/components/identity/UserForm";
import { GenerateCredentialsForm } from "@/components/client-area/GenerateCredentialsForm";
import { userService } from "@/services";
import { useToast } from "@/hooks";
import { User as UserProfile } from "@/types/user";
import { useClientStages } from "@/hooks/operations/useClientStages";
import { ClientStageManager } from "@/components/admin/ClientStageManager";
import { ClientEventHistory } from "@/components/admin/ClientEventHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { STAGE_CONFIG } from "@/types/clientFlow";
import { cn } from "@/lib/utils";

const ClientArea = () => {
  const [activeTab, setActiveTab] = useState("journey");
  const [searchQuery, setSearchQuery] = useState("");
  const { profiles, isLoading, refresh } = useClientStages();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isNewClientDialogOpen, setNewClientDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateClient = async (data: any) => {
    try {
      const result = await userService.createProfile(data);
      if (result.error) throw result.error;
      
      toast({
        title: "Cliente criado",
        description: "O perfil do cliente foi criado com sucesso.",
      });
      setNewClientDialogOpen(false);
      refresh();
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

  const filteredClients = profiles.filter(client => 
    client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.propertyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.unitNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClient = profiles.find(p => p.id === selectedClientId);

  return (
    <PageTemplate
      title="Gestão de Clientes" 
      description="Governança completa da jornada do cliente e proprietário no ecossistema digital."
      icon={UserIcon}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="hidden sm:flex rounded-xl h-10 px-4">
            <Download className="mr-2 h-4 w-4" />
            Relatórios
          </Button>
          <Button variant="outline" onClick={() => setCredentialsDialogOpen(true)} className="rounded-xl h-10 px-4">
            <Key className="mr-2 h-4 w-4" />
            Acessos
          </Button>
          <Button onClick={() => {
            setNewClientDialogOpen(true);
          }} className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px]">
            <Plus className="mr-2 h-4 w-4" />
            Integrar Cliente
          </Button>
        </div>
      }
    >

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-slow">
        <FilterBar
          searchPlaceholder="Nome, email, unidade ou empreendimento..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Clientes Homologados" value={profiles.length} icon={UserIcon} variant="brand" className="rounded-3xl" />
        <StatsCard label="Vistorias Habilitadas" value={profiles.filter(p => p.currentStage === 'inspection_enabled').length} icon={Activity} variant="progress" className="rounded-3xl" />
        <StatsCard label="Garantias Ativas" value={profiles.filter(p => p.currentStage === 'warranty_enabled').length} icon={UserCheck} variant="complete" className="rounded-3xl" />
        <StatsCard label="Novos Leads" value={profiles.filter(p => p.currentStage === 'lead').length} icon={History} variant="pending" className="rounded-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 mb-2">Base de Clientes</h2>
          <DataView
            items={filteredClients}
            viewMode="list"
            isLoading={isLoading}
            renderList={(items) => (
              <div className="space-y-2">
                {items.map((client) => (
                  <div 
                    key={client.id} 
                    onClick={() => setSelectedClientId(client.id)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border border-transparent mb-2",
                      selectedClientId === client.id 
                        ? "bg-primary/10 border-primary/20 shadow-sem-sm" 
                        : "hover:bg-muted/50 border-border/5"
                    )}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        selectedClientId === client.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        <UserIcon size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm truncate">{client.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[9px] h-4 uppercase tracking-tighter px-1">
                            {STAGE_CONFIG[client.currentStage].label}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground truncate">{client.unitNumber} • {client.propertyName}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className={cn(
                      "text-muted-foreground/30 transition-transform",
                      selectedClientId === client.id && "translate-x-1 text-primary"
                    )} />
                  </div>
                ))}
              </div>
            )}
          />
        </div>

        <div className="lg:col-span-2">
          {selectedClient ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-slow">
              <div className="bg-card rounded-3xl p-8 shadow-sem-sm border border-border/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                      <UserIcon size={40} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">{selectedClient.name}</h2>
                      <p className="text-muted-foreground font-medium">{selectedClient.email}</p>
                      <div className="flex flex-wrap gap-3 mt-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground px-3 py-1 bg-muted rounded-full">
                          <Building size={14} /> {selectedClient.propertyName}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground px-3 py-1 bg-muted rounded-full">
                          <MapPin size={14} /> Unidade {selectedClient.unitNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl h-10" onClick={() => {
                      setNewClientDialogOpen(true);
                      // In a real app, you'd load the profile into the form
                    }}>Editar Perfil</Button>
                    <Button variant="outline" className="rounded-xl h-10 text-destructive hover:bg-destructive/5">Bloquear</Button>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-muted/30 p-1 rounded-2xl mb-8">
                    <TabsTrigger value="journey" className="rounded-xl font-bold">Jornada Digital</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-xl font-bold">Histórico Completo</TabsTrigger>
                    <TabsTrigger value="docs" className="rounded-xl font-bold">Documentação</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="journey" className="animate-in fade-in duration-normal">
                    <ClientStageManager 
                      clientId={selectedClient.id} 
                      onStageChange={refresh} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="history" className="animate-in fade-in duration-normal">
                    <ClientEventHistory clientId={selectedClient.id} />
                  </TabsContent>

                  <TabsContent value="docs" className="animate-in fade-in duration-normal">
                    <div className="p-12 text-center bg-muted/20 rounded-3xl border border-dashed">
                      <Download size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                      <h3 className="text-sm font-bold">Repositório de Documentos</h3>
                      <p className="text-xs text-muted-foreground mt-1">Contratos, plantas e manuais técnicos vinculados ao CPF deste proprietário.</p>
                      <Button variant="outline" className="mt-6 rounded-xl">Visualizar Arquivos</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 bg-muted/5 rounded-3xl border border-dashed">
              <div className="text-center">
                <UserIcon size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-bold text-muted-foreground">Selecione um Cliente</h3>
                <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">Visualize e gerencie a jornada estratégica de cada cliente individualmente.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={isNewClientDialogOpen} onOpenChange={(open) => {
        setNewClientDialogOpen(open);
        if (!open) {
          // Reset any editing state if needed
        }
      }}>
        <DialogContent className="max-w-dialog-md p-0 overflow-hidden rounded-3xl border-none shadow-sem-xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b bg-muted/5">
            <DialogTitle className="text-2xl font-black tracking-tight">Novo Cliente</DialogTitle>
            <DialogDescription className="text-sm font-medium">Cadastre um novo cliente no ecossistema digital.</DialogDescription>
          </DialogHeader>
          <div className="p-layout-gap max-h-[70vh] overflow-y-auto overflow-x-hidden">
            <UserForm 
              onSave={handleCreateClient} 
              onCancel={() => setNewClientDialogOpen(false)} 
              editingUser={selectedClient ? {
                id: selectedClient.id,
                name: selectedClient.name,
                email: selectedClient.email,
                phone: selectedClient.phone,
                role: 'client',
                status: 'active',
                propertyId: selectedClient.propertyId,
                propertyName: selectedClient.propertyName,
                unit: selectedClient.unitNumber
              } as any : null}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCredentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
        <DialogContent className="max-w-dialog-md p-0 overflow-hidden rounded-3xl border-none shadow-sem-xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b bg-muted/5">
            <DialogTitle className="text-2xl font-black tracking-tight">Habilitação de Acessos Corporativos</DialogTitle>
            <DialogDescription className="text-sm font-medium">Configure os parâmetros de segurança e libere o ecossistema digital para o cliente.</DialogDescription>
          </DialogHeader>
          <div className="p-layout-gap max-h-[70vh] overflow-y-auto overflow-x-hidden">
            <GenerateCredentialsForm onSubmit={handleCredentialsSubmit} onCancel={() => setCredentialsDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
};

export default ClientArea;