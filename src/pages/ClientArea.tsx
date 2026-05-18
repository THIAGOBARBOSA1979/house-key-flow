
import { useState, useMemo } from "react";
import { User, Key, Plus, History, MoreHorizontal, UserCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewClientForm } from "@/components/ClientArea/NewClientForm";
import { GenerateCredentialsForm } from "@/components/ClientArea/GenerateCredentialsForm";
import { ClientDetailsDialog } from "@/components/ClientArea/ClientDetailsDialog";
import { StageIndicator } from "@/components/ClientFlow/StageIndicator";
import { clientStageService, notificationService, auditLogService, exportService } from "@/services";
import { PageHeader } from "@/components/Layout/PageHeader";
import { FilterBar } from "@/components/Layout/FilterBar";
import { useToast } from "@/hooks";
import { StatsCard } from "@/components/Shared/StatsCard";
import { DataView, DataViewMode } from "@/components/Shared/DataView";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";



// Clients are managed via clientStageService

const ClientArea = () => {
  const { toast: showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isNewClientDialogOpen, setNewClientDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState<DataViewMode>("table");


  const handleNewClientSubmit = (data: any) => {
    auditLogService.log({
      entityType: 'user',
      entityId: `new-${Date.now()}`,
      action: 'created',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Novo cliente cadastrado: ${data.name}`
    });
    showToast({ title: "Cliente cadastrado", description: "O cliente foi cadastrado com sucesso." });
    setNewClientDialogOpen(false);
  };

  const handleCredentialsSubmit = (data: any) => {
    auditLogService.log({
      entityType: 'user',
      entityId: data.clientId,
      action: 'updated',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Credenciais de acesso geradas para o cliente.`
    });
    
    notificationService.createNotification(data.clientId, 'stage_changed', {
      relatedEntityType: 'stage'
    }, {
      title: 'Acesso Liberado',
      message: 'Suas credenciais de acesso ao portal foram geradas e enviadas por email.'
    });

    showToast({ title: "Credenciais geradas", description: "As credenciais de acesso foram geradas e enviadas ao cliente." });
    setCredentialsDialogOpen(false);
  };

  const allProfiles = useMemo(() => clientStageService.getAllProfiles(), []);

  const filteredClients = allProfiles.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.phone && client.phone.includes(searchQuery)) ||
    client.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDocument = (docTitle: string) => {
    showToast({ title: "Visualizando documento", description: `Abrindo "${docTitle}" para visualização. Integrado ao Google Drive.` });
  };

  const handleViewWarrantyDetails = (claimTitle: string) => {
    showToast({ title: "Detalhes da garantia", description: `Abrindo detalhes de "${claimTitle}".` });
  };

  const handleUpdateStatus = (clientId: string) => {
    showToast({ title: "Atualizando status", description: "Sincronizando dados com o servidor..." });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={User}
        title="Gestão de Experiência do Cliente"
        description="Portal administrativo para governança de acessos, documentos e jornada do proprietário."

      >
        <Button variant="outline" onClick={() => exportService.exportToCSV(allProfiles, 'clientes_a2')}>
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
        <StatsCard label="Proprietários Homologados" value={allProfiles.length} icon={User} variant="brand" />
        <StatsCard label="Interações no Portal" value="28" icon={UserCheck} variant="complete" />
        <StatsCard label="Evolução de Leads" value="15" icon={Plus} variant="progress" />

      </div>

      <DataView
        items={filteredClients}
        viewMode={viewMode}
        itemsPerPage={10}
        columns={[
          {
            header: "Nome",
            accessorKey: "name",
            cell: (client: any) => (
              <div className="flex flex-col">
                <span className="text-label group-hover:text-primary transition-colors">{client.name}</span>
                <span className="md:hidden text-caption mt-0.5 text-muted-foreground">{client.email}</span>
              </div>
            )
          },
          {
            header: "Contato",
            accessorKey: "email",
            className: "hidden md:table-cell",
            cell: (client: any) => (
              <div className="flex flex-col text-sem-body-sm">
                <span>{client.email}</span>
                <span className="text-muted-foreground">{client.phone}</span>
              </div>
            )
          },
          {
            header: "Imóvel",
            accessorKey: "propertyName",
            className: "hidden lg:table-cell",
            cell: (client: any) => (
              <span className="text-sem-body-sm text-muted-foreground font-medium">
                {client.propertyName} • {client.unitNumber}
              </span>
            )
          },
          {
            header: "Status",
            accessorKey: "currentStage",
            cell: (client: any) => {
              const profile = clientStageService.getClientProfile(client.id);
              return profile ? (
                <StageIndicator currentStage={profile.currentStage} variant="compact" />
              ) : (
                <Badge className="bg-status-complete/10 text-status-complete border-status-complete/20 rounded-lg text-sem-tiny font-bold uppercase">Ativo</Badge>
              );
            }
          },
          {
            header: "Ações",
            accessorKey: "id",
            className: "text-right",
            cell: (client: any) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-primary/5">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 shadow-sem-lg animate-in fade-in zoom-in-95 duration-200">
                  <DropdownMenuItem onClick={() => setSelectedClient(client)} className="py-2.5 font-medium cursor-pointer">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" /> Ver Detalhes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUpdateStatus(client.id)} className="py-2.5 font-medium cursor-pointer">
                    <History className="mr-2 h-4 w-4 text-muted-foreground" /> Sincronizar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCredentialsDialogOpen(true)} className="py-2.5 font-medium cursor-pointer">
                    <Key className="mr-2 h-4 w-4 text-muted-foreground" /> Governança de Acesso
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
        ]}
        onRowClick={(client) => setSelectedClient(client)}

        emptyState={{
          title: "Nenhum cliente encontrado",
          description: "Não encontramos clientes com os termos pesquisados.",
          action: {
            label: "Limpar pesquisa",
            onClick: () => setSearchQuery("")
          }
        }}
      />

      <ClientDetailsDialog
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onViewDocument={handleViewDocument}
        onViewWarrantyDetails={handleViewWarrantyDetails}
        onStageUpdate={() => handleUpdateStatus(selectedClient.id)}
      />


      {/* Dialogs */}
      <Dialog open={isNewClientDialogOpen} onOpenChange={setNewClientDialogOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b bg-muted/5">
            <DialogTitle className="text-2xl font-black tracking-tight">Integração de Novo Proprietário</DialogTitle>
            <DialogDescription className="text-sm font-medium">Inicie a jornada digital do cliente inserindo os dados fundamentais para governança.</DialogDescription>

          </DialogHeader>
          <div className="p-8 max-h-[70vh] overflow-y-auto">
            <NewClientForm onSubmit={handleNewClientSubmit} onCancel={() => setNewClientDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCredentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b bg-muted/5">
            <DialogTitle className="text-2xl font-black tracking-tight">Habilitação de Acessos Corporativos</DialogTitle>
            <DialogDescription className="text-sm font-medium">Configure os parâmetros de segurança e libere o ecossistema digital para o cliente.</DialogDescription>

          </DialogHeader>
          <div className="p-8 max-h-[70vh] overflow-y-auto">
            <GenerateCredentialsForm onSubmit={handleCredentialsSubmit} onCancel={() => setCredentialsDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientArea;
