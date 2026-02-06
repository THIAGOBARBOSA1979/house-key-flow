import { useState } from "react";
import { User, Home, ClipboardCheck, ShieldCheck, Mail, Phone, ArrowRight, FileText, Key, Plus, History, Calendar, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
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

// Mock data improvements
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
      { 
        id: "1", 
        title: "Infiltração no banheiro",
        description: "Identificada infiltração na parede do box do banheiro social.",
        createdAt: new Date(2025, 5, 5),
        status: "pending"
      }
    ]
  }
];

const ClientArea = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<typeof clients[0] | null>(null);
  const [isNewClientDialogOpen, setNewClientDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({ title: "Campo vazio", description: "Digite um termo para buscar", variant: "destructive" });
      return;
    }

    const foundClient = clients.find(client => 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
    );

    if (foundClient) {
      setSelectedClient(foundClient);
      toast({ title: "Cliente encontrado", description: `${foundClient.name} encontrado com sucesso.` });
    } else {
      toast({ title: "Cliente não encontrado", description: "Nenhum cliente encontrado com os termos informados.", variant: "destructive" });
    }
  };

  const handleNewClientSubmit = (data: any) => {
    toast({
      title: "Cliente cadastrado",
      description: "O cliente foi cadastrado com sucesso."
    });
    setNewClientDialogOpen(false);
  };

  const handleCredentialsSubmit = (data: any) => {
    toast({
      title: "Credenciais geradas",
      description: "As credenciais de acesso foram geradas e enviadas ao cliente."
    });
    setCredentialsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <User className="h-8 w-8" />
            Área do Cliente
          </h1>
          <p className="text-muted-foreground">
            Gestão centralizada de clientes e acesso
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCredentialsDialogOpen(true)}>
            <Key className="mr-2 h-4 w-4" />
            Gerar Credenciais
          </Button>
          <Button onClick={() => setNewClientDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar cliente
          </CardTitle>
          <CardDescription>
            Pesquise por nome, email ou telefone do cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input 
              placeholder="Digite o nome, email ou telefone" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch}>Buscar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Client List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Todos os clientes cadastrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Imóvel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map(client => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.property} - {client.unit}</TableCell>
                  <TableCell>
                    {(() => {
                      const profile = clientStageService.getClientProfile(client.id);
                      return profile ? (
                        <StageIndicator currentStage={profile.currentStage} variant="compact" />
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Ativo
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedClient(client)}
                    >
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              <Button variant="outline" size="sm" onClick={() => setSelectedClient(null)}>
                Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="stages">Etapas</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="inspections">Vistorias</TabsTrigger>
                <TabsTrigger value="warranty">Garantias</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Informações Pessoais</h3>
                    <div className="mt-2 space-y-2">
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {selectedClient.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {selectedClient.phone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Informações do Imóvel</h3>
                    <div className="mt-2 space-y-2">
                      <p className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        {selectedClient.property}
                      </p>
                      <p>Unidade: {selectedClient.unit}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stages" className="mt-4 space-y-4">
                <ClientStageManager 
                  clientId={selectedClient.id} 
                  onStageChange={() => {
                    // Refresh client data
                    toast({ title: "Etapa atualizada", description: "A etapa do cliente foi atualizada com sucesso." });
                  }} 
                />
                <ClientEventHistory clientId={selectedClient.id} />
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                <div className="space-y-4">
                  {selectedClient.documents.map(doc => (
                    <Card key={doc.id}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {doc.title}
                        </CardTitle>
                        <CardDescription>
                          Adicionado em {format(doc.uploadedAt, "dd/MM/yyyy")}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4">
                        <Button variant="outline" size="sm">
                          Visualizar
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="inspections" className="mt-4">
                <div className="space-y-4">
                  {selectedClient.inspections.map(inspection => (
                    <Card key={inspection.id}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{inspection.title}</CardTitle>
                        <CardDescription>
                          Agendada para {format(inspection.date, "dd/MM/yyyy 'às' HH:mm")}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4">
                        <Badge variant={inspection.status === "completed" ? "secondary" : "outline"}>
                          {inspection.status === "scheduled" ? "Agendada" : "Concluída"}
                        </Badge>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="warranty" className="mt-4">
                <div className="space-y-4">
                  {selectedClient.warrantyClaims.map(claim => (
                    <Card key={claim.id}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{claim.title}</CardTitle>
                        <CardDescription>{claim.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4 flex justify-between">
                        <Badge variant={claim.status === "completed" ? "secondary" : "outline"}>
                          {claim.status === "pending" ? "Pendente" : "Concluída"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Ver detalhes
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
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
            <DialogDescription>
              Preencha os campos abaixo para cadastrar um novo cliente.
            </DialogDescription>
          </DialogHeader>
          <NewClientForm 
            onSubmit={handleNewClientSubmit} 
            onCancel={() => setNewClientDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isCredentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gerar Credenciais de Acesso</DialogTitle>
            <DialogDescription>
              Configure as credenciais de acesso para o cliente.
            </DialogDescription>
          </DialogHeader>
          <GenerateCredentialsForm 
            onSubmit={handleCredentialsSubmit}
            onCancel={() => setCredentialsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientArea;