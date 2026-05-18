import { User, FileText, ClipboardCheck, ShieldCheck, History } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClientStageManager } from "@/components/Admin/ClientStageManager";
import { ClientEventHistory } from "@/components/Admin/ClientEventHistory";
import { safeFormat } from "@/lib/utils";
import { clientStageService } from "@/services";

interface ClientDetailsDialogProps {
  selectedClient: any;
  setSelectedClient: (client: any) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onViewDocument: (title: string) => void;
  onViewWarrantyDetails: (title: string) => void;
  onStageUpdate: () => void;
}

export function ClientDetailsDialog({
  selectedClient,
  setSelectedClient,
  activeTab,
  setActiveTab,
  onViewDocument,
  onViewWarrantyDetails,
  onStageUpdate
}: ClientDetailsDialogProps) {
  if (!selectedClient) return null;

  return (
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
                onStageChange={onStageUpdate} 
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
                      <Button variant="outline" size="sm" onClick={() => onViewDocument(doc.title)}>Visualizar</Button>
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
                      <Button variant="outline" size="sm" onClick={() => onViewWarrantyDetails(claim.title)}>Ver detalhes</Button>
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
  );
}
