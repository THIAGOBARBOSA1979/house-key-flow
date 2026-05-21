
import { useState } from "react";
import { Building, MapPin, Calendar, FileText, Download, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";

// Mock property data
const property = {
  id: "1",
  name: "Edifício Aurora",
  unit: "Apartamento 204",
  address: "Rua das Flores, 123 - Bairro Jardim - São Paulo/SP",
  area: "78m²",
  bedroom: 2,
  bathroom: 2,
  status: "delivered", // planning, construction, delivered
  deliveryDate: new Date(2025, 5, 15),
  photos: [
    "/placeholder.svg",
    "/placeholder.svg",
  ],
  documents: [
    {
      id: "1",
      title: "Manual do Proprietário",
      type: "manual",
      uploadedAt: new Date(2025, 5, 16),
    },
    {
      id: "2",
      title: "Planta Baixa",
      type: "blueprint",
      uploadedAt: new Date(2025, 5, 16),
    },
    {
      id: "3",
      title: "Termo de Garantia",
      type: "warranty",
      uploadedAt: new Date(2025, 5, 16),
    }
  ]
};

// Map status to badge variant
const statusBadgeMap: Record<string, { label: string; variant: "default" | "outline" | "secondary" }> = {
  planning: { label: "Em Planejamento", variant: "outline" },
  construction: { label: "Em Construção", variant: "secondary" },
  delivered: { label: "Entregue", variant: "default" },
};

interface PropertyDetailsProps {
  propertyId?: string;
}

export function PropertyDetails({ propertyId = "1" }: PropertyDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const handleDownload = (documentId: string) => {
    toast({
      title: "Download iniciado",
      description: "O download do documento foi iniciado.",
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Property header */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{property.name}</CardTitle>
              <CardDescription className="text-base">{property.unit}</CardDescription>
            </div>
            <Badge variant={statusBadgeMap[property.status].variant}>
              {statusBadgeMap[property.status].label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Endereço</p>
                  <p className="text-muted-foreground">{property.address}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Detalhes</p>
                  <p className="text-muted-foreground">
                    {property.area} • {property.bedroom} dormitório{property.bedroom > 1 ? 's' : ''} • 
                    {property.bathroom} banheiro{property.bathroom > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Data de Entrega</p>
                  <p className="text-muted-foreground">
                    {isValid(new Date(property.deliveryDate)) ? format(new Date(property.deliveryDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "—"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <img
                src="/placeholder.svg"
                alt={property.name}
                className="rounded-md w-full max-w-[240px] h-auto"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for property details */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="photos">Fotos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Imóvel</CardTitle>
              <CardDescription>
                Detalhes cadastrais e informações sobre seu imóvel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Dados Cadastrais</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Empreendimento:</span>
                      <span>{property.name}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Unidade:</span>
                      <span>{property.unit}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Área privativa:</span>
                      <span>{property.area}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={statusBadgeMap[property.status].variant}>
                        {statusBadgeMap[property.status].label}
                      </Badge>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Documentação</h3>
                  <ul className="space-y-2 text-sm">
                    {property.documents.slice(0, 3).map((doc) => (
                      <li key={doc.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{doc.title}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(doc.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setActiveTab("documents")}>
                Ver todos os documentos
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {property.documents.map((document) => (
            <Card key={document.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {document.title}
                </CardTitle>
                <CardDescription>
                  Adicionado em {isValid(new Date(document.uploadedAt)) ? format(new Date(document.uploadedAt), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownload(document.id)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="photos" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Fotos do Imóvel</CardTitle>
              <CardDescription>
                Imagens do seu imóvel e do empreendimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {property.photos.map((photo, index) => (
                  <div key={index} className="aspect-video rounded-md overflow-hidden border">
                    <img 
                      src={photo} 
                      alt={`Foto ${index + 1} do imóvel`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
