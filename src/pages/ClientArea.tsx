
import { useState, useMemo } from "react";
import { User, Key, Plus, FileText, ClipboardCheck, ShieldCheck, History, MoreHorizontal, UserCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { safeFormat } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewClientForm } from "@/components/ClientArea/NewClientForm";
import { GenerateCredentialsForm } from "@/components/ClientArea/GenerateCredentialsForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClientStageManager } from "@/components/Admin/ClientStageManager";
import { ClientEventHistory } from "@/components/Admin/ClientEventHistory";
import { StageIndicator } from "@/components/ClientFlow/StageIndicator";
import { clientStageService } from "@/services/ClientStageService";
import { notificationService } from "@/services/NotificationService";
import { auditLogService } from "@/services/AuditLogService";
import { PageHeader } from "@/components/Layout/PageHeader";
import { FilterBar } from "@/components/Layout/FilterBar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { StatsCard } from "@/components/shared/StatsCard";
import { DataView } from "@/components/shared/DataView";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportService } from "@/services/ExportService";

// Clients are managed via clientStageService

const ClientArea = () => {
  const { toast: showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isNewClientDialogOpen, setNewClientDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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
        title="Área do Cliente"
        description="Gestão centralizada de clientes e acesso"
      >
        <Button variant="outline" onClick={() => exportService.exportToCSV(allProfiles, 'clientes_a2')}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
        <Button variant="outline" onClick={() => setCredentialsDialogOpen(true)}>
          <Key className="mr-2 h-4 w-4" />
          Gerar Credenciais
        </Button>
        <Button onClick={() => setNewClientDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </PageHeader>

      <FilterBar
        searchPlaceholder="Buscar por nome, email, telefone ou empreendimento..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard label="Total Clientes" value={allProfiles.length} icon={User} variant="brand" />
        <StatsCard label="Acessos Recentes" value="28" icon={UserCheck} variant="complete" />
        <StatsCard label="Novos Leads" value="15" icon={Plus} variant="progress" />
      </div>

      <DataView
        items={filteredClients}
        viewMode="list"
        renderList={() => (
          <Card className="card-standard border-none bg-card/50 backdrop-blur-sm overflow-hidden">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-bold py-4 px-6">Nome</TableHead>
                    <TableHead className="hidden md:table-cell font-bold py-4 px-6">Contato</TableHead>
                    <TableHead className="hidden lg:table-cell font-bold py-4 px-6">Imóvel</TableHead>
                    <TableHead className="font-bold py-4 px-6">Status</TableHead>
                    <TableHead className="text-right font-bold py-4 px-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map(client => (
                    <TableRow key={client.id} className="group hover:bg-primary/5 transition-all border-b border-border/50">
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-label group-hover:text-primary transition-colors">{client.name}</span>
                          <span className="md:hidden text-caption mt-0.5 text-muted-foreground">{client.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-4 px-6">
                        <div className="flex flex-col text-sem-body-sm">
                          <span>{client.email}</span>
                          <span className="text-muted-foreground">{client.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell py-4 px-6 text-sem-body-sm text-muted-foreground font-medium">
                        {client.propertyName} • {client.unitNumber}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col gap-1.5">
                          {(() => {
                            const profile = clientStageService.getClientProfile(client.id);
                            return profile ? (
                              <StageIndicator currentStage={profile.currentStage} variant="compact" />
                            ) : (
                              <Badge className="bg-status-complete/10 text-status-complete border-status-complete/20 rounded-lg text-sem-tiny font-bold uppercase">Ativo</Badge>
                            );
                          })()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4 px-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
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
                              <Key className="mr-2 h-4 w-4 text-muted-foreground" /> Credenciais
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Card>
        )}
        emptyState={{
          title: "Nenhum cliente encontrado",
          description: "Não encontramos clientes com os termos pesquisados.",
          action: {
            label: "Limpar pesquisa",
            onClick: () => setSearchQuery("")
          }
        }}
      />

      {/* Selected Client Details */}
      {selectedClient && (
        <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border-none shadow-2xl">
            <CardHeader className="px-8 py-6 border-b bg-muted/5 sticky top-0 z-20 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  Detalhes do Cliente: {selectedClient.name}
                </CardTitle>
              </div>
            </CardHeader>
            <div className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                  <TabsTrigger value="overview" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Visão Geral</span>
                  </TabsTrigger>
                  <TabsTrigger value="stages" className="gap-2">
                    <History className="h-4 w-4" />
                    <span className="hidden sm:inline">Etapas</span>
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Documentos</span>
                  </TabsTrigger>
                  <TabsTrigger value="inspections" className="gap-2">
                    <ClipboardCheck className="h-4 w-4" />
                    <span className="hidden sm:inline">Vistorias</span>
                  </TabsTrigger>
                  <TabsTrigger value="warranty" className="gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="hidden sm:inline">Garantias</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Informações Pessoais</h3>
                      <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                      <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Informações do Imóvel</h3>
                      <p className="text-sm text-muted-foreground">{selectedClient.property}</p>
                      <p className="text-sm text-muted-foreground">Unidade: {selectedClient.unit}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="stages" className="mt-4 space-y-4">
                  <ClientStageManager 
                    clientId={selectedClient.id} 
                    onStageChange={() => { showToast({ title: "Etapa atualizada", description: "A etapa do cliente foi atualizada com sucesso." }); }} 
                  />
                  <ClientEventHistory clientId={selectedClient.id} />
                </TabsContent>

                <TabsContent value="documents" className="mt-4">
                  <div className="space-y-3">
                    {selectedClient.documents.map((doc: any) => (
                      <Card key={doc.id} className="transition-shadow hover:shadow-md">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">{doc.title}</CardTitle>
                          <CardDescription>Adicionado em {safeFormat(doc.uploadedAt, "dd/MM/yyyy")}</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 pt-0">
                          <Button variant="outline" size="sm" onClick={() => handleViewDocument(doc.title)}>Visualizar</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="inspections" className="mt-4">
                  <div className="space-y-3">
                    {selectedClient.inspections.map((inspection: any) => (
                      <Card key={inspection.id} className="transition-shadow hover:shadow-md">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">{inspection.title}</CardTitle>
                          <CardDescription>Agendada para {safeFormat(inspection.date, "dd/MM/yyyy 'às' HH:mm")}</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 pt-0">
                          <Badge className="bg-muted text-muted-foreground">{inspection.status === "scheduled" ? "Agendada" : "Concluída"}</Badge>
                        </CardFooter>
                      </Card>
                    ))}
                    {selectedClient.inspections.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhuma vistoria agendada.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="warranty" className="mt-4">
                  <div className="space-y-3">
                    {selectedClient.warrantyClaims.map((claim: any) => (
                      <Card key={claim.id} className="transition-shadow hover:shadow-md">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">{claim.title}</CardTitle>
                          <CardDescription>{claim.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <Badge className="bg-muted text-muted-foreground">{claim.status === "pending" ? "Pendente" : "Concluída"}</Badge>
                          <Button variant="outline" size="sm" onClick={() => handleViewWarrantyDetails(claim.title)}>Ver detalhes</Button>
                        </CardFooter>
                      </Card>
                    ))}
                    {selectedClient.warrantyClaims.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhuma solicitação de garantia.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialogs */}
      <Dialog open={isNewClientDialogOpen} onOpenChange={setNewClientDialogOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b bg-muted/5">
            <DialogTitle className="text-2xl font-black tracking-tight">Cadastrar Novo Cliente</DialogTitle>
            <DialogDescription className="text-sm font-medium">Preencha os campos abaixo para cadastrar um novo cliente no sistema.</DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[70vh] overflow-y-auto">
            <NewClientForm onSubmit={handleNewClientSubmit} onCancel={() => setNewClientDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCredentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b bg-muted/5">
            <DialogTitle className="text-2xl font-black tracking-tight">Gerar Credenciais</DialogTitle>
            <DialogDescription className="text-sm font-medium">Configure as credenciais de acesso para o portal do cliente.</DialogDescription>
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
