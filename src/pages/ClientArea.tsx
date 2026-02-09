import { useState } from "react";
import { User, Key, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewClientForm } from "@/components/ClientArea/NewClientForm";
import { GenerateCredentialsForm } from "@/components/ClientArea/GenerateCredentialsForm";
import { toast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClientStageManager } from "@/components/Admin/ClientStageManager";
import { ClientEventHistory } from "@/components/Admin/ClientEventHistory";
import { StageIndicator } from "@/components/ClientFlow/StageIndicator";
import { clientStageService } from "@/services/ClientStageService";
import { PageHeader } from "@/components/Layout/PageHeader";
import { FilterBar } from "@/components/Layout/FilterBar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

// Mock data - expanded
const clients = [
  {
    id: "client-1",
    name: "Maria Oliveira",
    email: "maria.oliveira@email.com",
    phone: "(11) 97777-6666",
    status: "active",
    property: "Edifício Aurora",
    unit: "204",
    createdAt: new Date(2024, 2, 15),
    lastLogin: new Date(2024, 3, 10),
    documents: [
      { id: "1", title: "Contrato de Compra", uploadedAt: new Date(2024, 2, 15) },
      { id: "2", title: "Manual do Proprietário", uploadedAt: new Date(2024, 3, 10) }
    ],
    inspections: [
      { id: "1", title: "Vistoria de Pré-entrega", date: new Date(2025, 4, 15, 10, 0), status: "scheduled" }
    ],
    warrantyClaims: [
      { id: "1", title: "Infiltração no banheiro", description: "Identificada infiltração na parede do box do banheiro social.", createdAt: new Date(2025, 5, 5), status: "pending" }
    ]
  },
  {
    id: "client-2",
    name: "Carlos Silva",
    email: "carlos.silva@email.com",
    phone: "(11) 98888-5555",
    status: "active",
    property: "Edifício Aurora",
    unit: "507",
    createdAt: new Date(2024, 1, 10),
    lastLogin: new Date(2024, 3, 12),
    documents: [
      { id: "3", title: "Contrato de Compra", uploadedAt: new Date(2024, 1, 10) }
    ],
    inspections: [
      { id: "2", title: "Vistoria de Entrega", date: new Date(2025, 4, 19, 10, 0), status: "scheduled" }
    ],
    warrantyClaims: []
  },
  {
    id: "client-3",
    name: "Ana Santos",
    email: "ana.santos@email.com",
    phone: "(21) 99999-1234",
    status: "active",
    property: "Residencial Bosque Verde",
    unit: "305",
    createdAt: new Date(2024, 0, 20),
    lastLogin: new Date(2024, 3, 8),
    documents: [
      { id: "4", title: "Contrato de Compra", uploadedAt: new Date(2024, 0, 20) },
      { id: "5", title: "Manual do Proprietário", uploadedAt: new Date(2024, 1, 5) },
      { id: "6", title: "Termo de Garantia", uploadedAt: new Date(2024, 1, 5) }
    ],
    inspections: [],
    warrantyClaims: [
      { id: "2", title: "Infiltração no banheiro", description: "Identificada infiltração na parede do box do banheiro social. Já está causando mofo.", createdAt: new Date(2025, 4, 15), status: "pending" }
    ]
  },
  {
    id: "client-4",
    name: "Roberto Pereira",
    email: "roberto.pereira@email.com",
    phone: "(11) 95555-4444",
    status: "active",
    property: "Residencial Bosque Verde",
    unit: "102",
    createdAt: new Date(2024, 3, 1),
    lastLogin: new Date(2024, 3, 14),
    documents: [
      { id: "7", title: "Contrato de Compra", uploadedAt: new Date(2024, 3, 1) }
    ],
    inspections: [
      { id: "3", title: "Vistoria de Pré-entrega", date: new Date(2025, 5, 1, 14, 0), status: "scheduled" }
    ],
    warrantyClaims: []
  },
];

const ClientArea = () => {
  const { toast: showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<typeof clients[0] | null>(null);
  const [isNewClientDialogOpen, setNewClientDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleNewClientSubmit = (data: any) => {
    toast({ title: "Cliente cadastrado", description: "O cliente foi cadastrado com sucesso." });
    setNewClientDialogOpen(false);
  };

  const handleCredentialsSubmit = (data: any) => {
    toast({ title: "Credenciais geradas", description: "As credenciais de acesso foram geradas e enviadas ao cliente." });
    setCredentialsDialogOpen(false);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery) ||
    client.property.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDocument = (docTitle: string) => {
    showToast({ title: "Visualizando documento", description: `Abrindo "${docTitle}" para visualização.` });
  };

  const handleViewWarrantyDetails = (claimTitle: string) => {
    showToast({ title: "Detalhes da garantia", description: `Abrindo detalhes de "${claimTitle}".` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={User}
        title="Área do Cliente"
        description="Gestão centralizada de clientes e acesso"
      >
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

      {/* Client List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {filteredClients.length} cliente(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Nome</TableHead>
                  <TableHead className="min-w-[180px]">Email</TableHead>
                  <TableHead className="min-w-[130px]">Telefone</TableHead>
                  <TableHead className="min-w-[180px]">Imóvel</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map(client => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.property} - {client.unit}</TableCell>
                    <TableCell>
                      {(() => {
                        const profile = clientStageService.getClientProfile(client.id);
                        return profile ? (
                          <StageIndicator currentStage={profile.currentStage} variant="compact" />
                        ) : (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Ativo</Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedClient(client)}>Detalhes</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Selected Client Details */}
      {selectedClient && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Detalhes do Cliente
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedClient(null)}>Fechar</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="stages">Etapas</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="inspections">Vistorias</TabsTrigger>
                <TabsTrigger value="warranty">Garantias</TabsTrigger>
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
                  onStageChange={() => { toast({ title: "Etapa atualizada", description: "A etapa do cliente foi atualizada com sucesso." }); }} 
                />
                <ClientEventHistory clientId={selectedClient.id} />
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                <div className="space-y-3">
                  {selectedClient.documents.map(doc => (
                    <Card key={doc.id} className="transition-shadow hover:shadow-md">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{doc.title}</CardTitle>
                        <CardDescription>Adicionado em {format(doc.uploadedAt, "dd/MM/yyyy")}</CardDescription>
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
                  {selectedClient.inspections.map(inspection => (
                    <Card key={inspection.id} className="transition-shadow hover:shadow-md">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{inspection.title}</CardTitle>
                        <CardDescription>Agendada para {format(inspection.date, "dd/MM/yyyy 'às' HH:mm")}</CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0">
                        <Badge variant="outline">{inspection.status === "scheduled" ? "Agendada" : "Concluída"}</Badge>
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
                  {selectedClient.warrantyClaims.map(claim => (
                    <Card key={claim.id} className="transition-shadow hover:shadow-md">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{claim.title}</CardTitle>
                        <CardDescription>{claim.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <Badge variant="outline">{claim.status === "pending" ? "Pendente" : "Concluída"}</Badge>
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
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <Dialog open={isNewClientDialogOpen} onOpenChange={setNewClientDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            <DialogDescription>Preencha os campos abaixo para cadastrar um novo cliente.</DialogDescription>
          </DialogHeader>
          <NewClientForm onSubmit={handleNewClientSubmit} onCancel={() => setNewClientDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isCredentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gerar Credenciais de Acesso</DialogTitle>
            <DialogDescription>Configure as credenciais de acesso para o cliente.</DialogDescription>
          </DialogHeader>
          <GenerateCredentialsForm onSubmit={handleCredentialsSubmit} onCancel={() => setCredentialsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientArea;
