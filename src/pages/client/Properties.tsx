
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building, Building2, FileText, Home, Calendar, ShieldCheck, Ruler, MapPin, Info, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useClientStage } from "@/hooks/useClientStage";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

import { propertyService, Property } from "@/services/PropertyService";

const ClientProperties = () => {
  const { user } = useAuth();
  const clientId = user?.id || "client-1";
  const { profile, isLoading: stageLoading } = useClientStage(clientId);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use property service to get real property data
  const [propertyData, setPropertyData] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.propertyId) {
      const p = propertyService.getById(profile.propertyId);
      if (p) {
        setPropertyData(p);
      }
    } else {
      // Fallback to first property for demo if none associated
      const all = propertyService.getAll();
      if (all.length > 0) setPropertyData(all[0]);
    }
    setIsLoading(false);
  }, [profile?.propertyId]);

  const propertyDetails = {
    address: propertyData?.location || "Rua das Flores, 1500, Centro",
    city: "São Paulo",
    state: "SP",
    size: propertyData?.totalArea ? `${Math.round(propertyData.totalArea / 120)}m²` : "72m²",
    bedrooms: 2,
    bathrooms: 2,
    deliveryDate: propertyData?.deliveryDate ? propertyData.deliveryDate.toLocaleDateString() : "15/04/2025",
    warrantyExpiration: "15/04/2030",
    documents: [
      { id: "1", title: "Manual do Proprietário", type: "manual" },
      { id: "2", title: "Termo de Garantia", type: "warranty" },
      { id: "3", title: "Planta Baixa", type: "blueprint" },
      { id: "4", title: "Contrato de Compra", type: "contract" }
    ]
  };

  const handleViewDocument = (title: string) => {
    toast({ title: "Abrindo documento", description: `Abrindo "${title}" para visualização.` });
  };

  const handleViewMemorial = () => {
    toast({ title: "Memorial descritivo", description: "O memorial descritivo completo será aberto em uma nova aba." });
  };

  const handleViewWarrantyTerm = () => {
    toast({ title: "Termo de garantia", description: "O termo completo de garantia será aberto em uma nova aba." });
  };

  const handleRequestWarranty = () => {
    navigate("/client/warranty");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Meu Imóvel
          </h1>
          <p className="text-muted-foreground mt-1">
            Informações técnicas, documentos e períodos de garantia da sua unidade.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-lg border">
          <Badge variant="outline" className="bg-background">ID: {profile?.propertyId?.substring(0, 8) || 'PROP-001'}</Badge>
          <Badge variant="outline" className="bg-background">Fase: Finalizado</Badge>
        </div>
      </div>

      {/* Property card */}
      <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-primary/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-black text-primary tracking-tight">{propertyData?.name || "Seu Imóvel"}</h2>
                  <p className="text-xl font-bold mt-1">Unidade {profile?.unitNumber || "204"}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-lg">
                  <Home size={24} />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-lg border">
                <MapPin size={18} className="text-primary" />
                <span className="text-sm font-medium">{propertyDetails.address}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="p-3 bg-background rounded-lg border shadow-sm">
                  <div className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Status Entrega</div>
                  <div className="text-sm font-black text-status-complete flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Finalizado
                  </div>
                </div>
                <div className="p-3 bg-background rounded-lg border shadow-sm">
                  <div className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Tipo</div>
                  <div className="text-sm font-black">Residencial</div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/3 bg-muted/20 p-6 flex flex-col justify-center">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Especificações Rápidas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ruler size={16} className="text-primary" />
                    <span className="text-sm">Área Útil</span>
                  </div>
                  <span className="font-bold">{propertyDetails.size}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-primary" />
                    <span className="text-sm">Andar</span>
                  </div>
                  <span className="font-bold">2º Andar</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    <span className="text-sm">Entregue em</span>
                  </div>
                  <span className="font-bold">{propertyDetails.deliveryDate}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for property information */}
      <Tabs defaultValue="documents" className="mt-6">
        <TabsList>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="features">Características</TabsTrigger>
          <TabsTrigger value="warranty">Garantias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos do Imóvel</CardTitle>
              <CardDescription>
                Acesse todos os documentos relacionados ao seu imóvel
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {propertyDetails.documents.map((doc) => (
                <Card key={doc.id} className="border">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{doc.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {doc.type === "manual" && "Manual e instruções"}
                          {doc.type === "warranty" && "Termos de garantia"}
                          {doc.type === "blueprint" && "Planta do imóvel"}
                          {doc.type === "contract" && "Documentação legal"}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewDocument(doc.title)}>
                      Visualizar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="features" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Características do Imóvel</CardTitle>
              <CardDescription>
                Detalhes técnicos e especificações da sua unidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      Dimensões
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Área privativa:</span>
                        <p className="font-medium">{propertyDetails.size}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Pé direito:</span>
                        <p className="font-medium">2,80m</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Quartos:</span>
                        <p className="font-medium">{propertyDetails.bedrooms}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Banheiros:</span>
                        <p className="font-medium">{propertyDetails.bathrooms}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Vagas:</span>
                        <p className="font-medium">1 vaga</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Andar:</span>
                        <p className="font-medium">2º andar</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      Acabamentos
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Piso:</span>
                        <p className="font-medium">Porcelanato</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Paredes:</span>
                        <p className="font-medium">Pintura acrílica</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Bancada cozinha:</span>
                        <p className="font-medium">Granito</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Janelas:</span>
                        <p className="font-medium">Alumínio</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Portas:</span>
                        <p className="font-medium">Madeira</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Teto:</span>
                        <p className="font-medium">Gesso</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      Informações do Empreendimento
                    </h3>
                    <div className="mt-2 space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Nome:</span>
                        <p className="font-medium">{propertyData?.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Endereço:</span>
                        <p className="font-medium">{propertyDetails.address}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Número de torres:</span>
                        <p className="font-medium">2 torres</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Unidades por andar:</span>
                        <p className="font-medium">4 unidades</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Lazer:</span>
                        <p className="font-medium">Piscina, academia, salão de festas</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Datas Importantes
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Lançamento:</span>
                        <p className="font-medium">10/01/2023</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Entrega:</span>
                        <p className="font-medium">{propertyDetails.deliveryDate}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Vistoria:</span>
                        <p className="font-medium">10/04/2025</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Assembleia:</span>
                        <p className="font-medium">20/04/2025</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={handleViewMemorial}>
                  Ver memorial descritivo completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="warranty" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Garantias do Imóvel
              </CardTitle>
              <CardDescription>
                Informações sobre as garantias aplicáveis ao seu imóvel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium">Períodos de Garantia</h3>
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="py-3 px-4 text-left">Item</th>
                        <th className="py-3 px-4 text-left">Período</th>
                        <th className="py-3 px-4 text-left">Validade até</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-3 px-4">Fundação e estrutura</td>
                        <td className="py-3 px-4">5 anos</td>
                        <td className="py-3 px-4">{propertyDetails.warrantyExpiration}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Impermeabilização</td>
                        <td className="py-3 px-4">3 anos</td>
                        <td className="py-3 px-4">15/04/2028</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Instalações hidráulicas</td>
                        <td className="py-3 px-4">2 anos</td>
                        <td className="py-3 px-4">15/04/2027</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Instalações elétricas</td>
                        <td className="py-3 px-4">2 anos</td>
                        <td className="py-3 px-4">15/04/2027</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Revestimentos cerâmicos</td>
                        <td className="py-3 px-4">1 ano</td>
                        <td className="py-3 px-4">15/04/2026</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Fissuras</td>
                        <td className="py-3 px-4">1 ano</td>
                        <td className="py-3 px-4">15/04/2026</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Esquadrias</td>
                        <td className="py-3 px-4">1 ano</td>
                        <td className="py-3 px-4">15/04/2026</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium">Como Solicitar Garantia</h3>
                  <ul className="mt-3 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                      <span>Acesse a aba "Garantias" no menu principal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                      <span>Clique em "Nova Solicitação" e preencha o formulário</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                      <span>Descreva o problema com detalhes e adicione fotos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                      <span>Nossa equipe analisará e entrará em contato</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mt-0.5">5</span>
                      <span>Acompanhe o status da solicitação pelo portal</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium">O que não é coberto</h3>
                  <ul className="mt-3 list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Desgaste natural dos materiais</li>
                    <li>Uso inadequado ou falta de manutenção</li>
                    <li>Modificações realizadas pelo proprietário</li>
                    <li>Danos causados por terceiros</li>
                    <li>Itens com garantia direta do fabricante</li>
                    <li>Danos causados por eventos da natureza</li>
                    <li>Uso comercial em unidades residenciais</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleViewWarrantyTerm}>
                  Ver termo completo de garantia
                </Button>
                <Button onClick={handleRequestWarranty}>
                  Solicitar garantia
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientProperties;
