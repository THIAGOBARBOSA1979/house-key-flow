
import { useState, useEffect } from "react";
import { ErrorView } from "@/components/shared/ErrorView";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Building, 
  Building2, 
  FileText, 
  Home, 
  Calendar, 
  ShieldCheck, 
  Ruler, 
  MapPin, 
  Info, 
  ArrowUpRight, 
  CheckCircle2,
  ChevronRight,
  Maximize2,
  Wind,
  Sun,
  Layers,
  Zap,
  Droplets,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useClientStage } from "@/hooks";
import { useToast } from "@/hooks";
import { useNavigate } from "react-router-dom";
import { propertyService, Property } from "@/services";
import { StatsCard } from "@/components/shared/StatsCard";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { FeatureGate } from "@/components/client-flow/FeatureGate";

const ClientProperties = () => {
  const { user } = useAuth();
  const clientId = user?.id || "client-1";
  const { profile, isLoading: stageLoading } = useClientStage(clientId);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [propertyData, setPropertyData] = useState<Property | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  const loadPropertyData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (profile?.propertyId) {
        const p = await propertyService.getById(profile.propertyId);
        if (p) {
          setPropertyData(p);
        } else {
          setError("Empreendimento não encontrado.");
        }
      } else {
        const all = await propertyService.getAll();
        if (all.length > 0) {
          setPropertyData(all[0]);
        } else {
          setError("Nenhum empreendimento vinculado ao seu perfil.");
        }
      }
    } catch (err) {
      setError("Falha ao carregar dossiê da unidade.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPropertyData();
  }, [profile?.propertyId]);


  const propertyDetails = {
    address: propertyData?.location || "Consulte seu contrato",
    city: "Porto Alegre",
    state: "RS",
    size: profile?.totalArea ? `${profile.totalArea}m²` : (propertyData?.totalArea ? `${Math.round(propertyData.totalArea / (propertyData.units || 1))}m²` : "72,50m²"),
    bedrooms: 2,
    bathrooms: 2,
    deliveryDate: propertyData?.deliveryDate ? format(new Date(propertyData.deliveryDate), 'dd/MM/yyyy') : "15/04/2025",
    warrantyExpiration: propertyData?.deliveryDate ? format(new Date(new Date(propertyData.deliveryDate).setFullYear(new Date(propertyData.deliveryDate).getFullYear() + 5)), 'dd/MM/yyyy') : "15/04/2030",
    documents: [
      { id: "1", title: "Manual do Proprietário", type: "manual", size: "4.5 MB" },
      { id: "2", title: "Termo de Garantia", type: "warranty", size: "1.2 MB" },
      { id: "3", title: "Planta Humanizada", type: "blueprint", size: "8.7 MB" },
      { id: "4", title: "Memorial Descritivo", type: "contract", size: "2.1 MB" }
    ]
  };

  const specifications = [
    { icon: Maximize2, label: "Área Privativa", value: propertyDetails.size },
    { icon: Layers, label: "Pavimento", value: profile?.floor ? `${profile.floor}º Andar` : "Andar Médio" },
    { icon: Sun, label: "Posição Solar", value: "Norte" },
    { icon: Wind, label: "Ventilação", value: "Natural" },
    { icon: Zap, label: "Rede Elétrica", value: "220v" },
    { icon: Droplets, label: "Rede Hidráulica", value: "Individual" }
  ];

  const handleViewDocument = (title: string) => {
    toast({ title: "Abrindo documento", description: `Iniciando visualização de "${title}".` });
  };

  if (isLoading || stageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-responsive py-20 flex items-center justify-center">
        <ErrorView message={error} onRetry={loadPropertyData} fullScreen />
      </div>
    );
  }

  return (

    <div className="container-responsive py-layout-gap space-y-layout-gap pb-20 md:pb-6 animate-in fade-in duration-slow">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <span className="w-2.5 h-2.5 rounded-full bg-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Ativo Imobiliário • Dossiê Técnico</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
            Minha Unidade <span className="text-primary">.</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-primary/5 text-primary border-primary/20 font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl shadow-sm">
            {profile?.unitNumber ? `Unidade ${profile.unitNumber}` : "Unidade 204"}
          </Badge>
          <Badge className="bg-emerald-500 text-white border-none font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/20">
            Homologado
          </Badge>
        </div>
      </div>

      <FeatureGate
        isAllowed={true}
        requiredStage="registered"
        featureName="O dossiê da unidade"
        redirectTo="/client"
      >
      {/* Hero Property Card */}
      <Card className="bg-white border-none shadow-2xl overflow-hidden rounded-[3rem] group">
        <div className="flex flex-col lg:flex-row min-h-[550px]">
          <div className="lg:w-3/5 relative h-[400px] lg:h-auto overflow-hidden">
             <img 
               src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80" 
               alt="Property facade"
               className="w-full h-full object-cover transition-transform duration-slower group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
             <div className="absolute bottom-12 left-12 right-12 text-white">
                <Badge className="bg-primary border-none font-black text-[10px] uppercase mb-6 px-4 py-1.5 shadow-xl shadow-primary/20 tracking-[0.2em]">Imóvel A2 Exclusive</Badge>
                <h2 className="text-5xl font-black tracking-tighter leading-[0.9] mb-6">{propertyData?.name || "Edifício Aurora"}</h2>
                <div className="flex items-center gap-4 text-white/90 font-bold bg-white/10 backdrop-blur-xl w-fit px-6 py-3 rounded-2xl border border-white/20 shadow-2xl">
                  <MapPin size={20} className="text-primary" strokeWidth={3} />
                  <span className="text-sm tracking-wide">{propertyDetails.address}</span>
                </div>
             </div>
          </div>
          <div className="lg:w-2/5 p-12 lg:p-16 flex flex-col justify-between bg-white">
            <div className="grid grid-cols-2 gap-x-10 gap-y-12">
               {specifications.map((spec, i) => {
                 const Icon = spec.icon;
                 return (
                   <div key={i} className="space-y-3 group/spec">
                     <div className="flex items-center gap-2 text-muted-foreground/60">
                        <div className="p-2 bg-primary/5 rounded-xl text-primary group-hover/spec:bg-primary group-hover/spec:text-white transition-all duration-300 shadow-sm">
                           <Icon size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{spec.label}</span>
                     </div>
                     <p className="text-2xl font-black tracking-tight text-foreground/90">{spec.value}</p>
                   </div>
                 );
               })}
            </div>
            
            <div className="pt-12 mt-12 border-t border-border/10 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-2">Certificação Técnica</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                       <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="font-black text-foreground/80">Imóvel Aprovado & Entregue</span>
                  </div>
               </div>
               <Button className="font-black uppercase tracking-widest text-[11px] h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all active:scale-95">
                 <Download className="mr-2 h-4 w-4" /> Baixar Dossier Completo
               </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="specs" className="mt-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1.5 bg-muted/50 rounded-2xl mb-8">
          <TabsTrigger value="specs" className="rounded-xl py-4 font-black uppercase text-[10px] tracking-widest data-[state=active]:shadow-lg">Especificações</TabsTrigger>
          <TabsTrigger value="documents" className="rounded-xl py-4 font-black uppercase text-[10px] tracking-widest data-[state=active]:shadow-lg">Documentos</TabsTrigger>
          <TabsTrigger value="warranty" className="rounded-xl py-4 font-black uppercase text-[10px] tracking-widest data-[state=active]:shadow-lg">Garantias</TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl py-4 font-black uppercase text-[10px] tracking-widest data-[state=active]:shadow-lg">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="specs" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-layout-gap">
            <Card className="border-none shadow-md bg-white p-8 space-y-6">
               <div className="p-3 bg-primary/5 rounded-2xl w-fit">
                 <Maximize2 className="h-6 w-6 text-primary" />
               </div>
               <h3 className="text-lg font-black tracking-tight">Acabamentos Internos</h3>
               <ul className="space-y-4">
                 {[
                   { label: "Pisos", value: "Porcelanato 90x90" },
                   { label: "Paredes", value: "Massa Corrida / Pintura" },
                   { label: "Teto", value: "Gesso Rebaixado" },
                   { label: "Metais", value: "Docol Linha Luxo" }
                 ].map((item, i) => (
                   <li key={i} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">{item.label}</span>
                      <span className="font-black">{item.value}</span>
                   </li>
                 ))}
               </ul>
            </Card>

            <Card className="border-none shadow-md bg-white p-8 space-y-6">
               <div className="p-3 bg-primary/5 rounded-2xl w-fit">
                 <Zap className="h-6 w-6 text-primary" />
               </div>
               <h3 className="text-lg font-black tracking-tight">Instalações e Redes</h3>
               <ul className="space-y-4">
                 {[
                   { label: "Iluminação", value: "Pontos de LED" },
                   { label: "Climatização", value: "Split em todos os quartos" },
                   { label: "Gás", value: "GN (Gás Natural)" },
                   { label: "Água Quente", value: "Aquecedor de Passagem" }
                 ].map((item, i) => (
                   <li key={i} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">{item.label}</span>
                      <span className="font-black">{item.value}</span>
                   </li>
                 ))}
               </ul>
            </Card>

            <Card className="border-none shadow-md bg-white p-8 space-y-6">
               <div className="p-3 bg-primary/5 rounded-2xl w-fit">
                 <Info className="h-6 w-6 text-primary" />
               </div>
               <h3 className="text-lg font-black tracking-tight">Outros Detalhes</h3>
               <ul className="space-y-4">
                 {[
                   { label: "Vagas de Garagem", value: "2 Vagas (S2)" },
                   { label: "Depósito Privativo", value: "Sim (1.5 m²)" },
                   { label: "Hobby Box", value: "Não possui" },
                   { label: "Automação", value: "Infraestrutura pronta" }
                 ].map((item, i) => (
                   <li key={i} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">{item.label}</span>
                      <span className="font-black">{item.value}</span>
                   </li>
                 ))}
               </ul>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Card className="border-none shadow-md overflow-hidden bg-white">
             <CardHeader className="bg-muted/30 pb-6 border-b">
               <CardTitle className="text-xl font-black tracking-tight">Arquivos da Unidade</CardTitle>
               <CardDescription className="font-medium">Documentos oficiais e técnicos para download.</CardDescription>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y">
                  {propertyDetails.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-6 hover:bg-muted/30 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/5 text-primary rounded-xl">
                             <FileText className="h-6 w-6" />
                          </div>
                          <div>
                             <h4 className="font-black text-sm group-hover:text-primary transition-colors">{doc.title}</h4>
                             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{doc.size}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="font-black uppercase tracking-widest text-[10px] h-10 px-4 rounded-xl hover:bg-primary/10 text-primary" onClick={() => handleViewDocument(doc.title)}>
                            Visualizar
                          </Button>
                          <Button variant="outline" size="sm" className="font-black uppercase tracking-widest text-[10px] h-10 w-10 p-0 rounded-xl hover:bg-primary hover:text-white transition-all">
                            <Download className="h-4 w-4" />
                          </Button>
                       </div>
                    </div>
                  ))}
                </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="warranty" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-layout-gap">
              <Card className="border-none shadow-md bg-white p-8">
                <h3 className="text-xl font-black tracking-tight mb-6 flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  Prazos de Garantia
                </h3>
                <div className="space-y-6">
                   {[
                     { label: "Estrutural", value: "5 anos", exp: "Abr/2030" },
                     { label: "Impermeabilização", value: "3 anos", exp: "Abr/2028" },
                     { label: "Hidráulica/Elétrica", value: "2 anos", exp: "Abr/2027" },
                     { label: "Acabamentos", value: "1 ano", exp: "Abr/2026" }
                   ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between">
                        <div className="space-y-1">
                           <p className="text-sm font-black">{item.label}</p>
                           <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Expira em: {item.exp}</p>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] px-3 py-1 uppercase">{item.value}</Badge>
                     </div>
                   ))}
                </div>
                <Button className="w-full mt-8 font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl" onClick={() => navigate("/client/warranty")}>
                   Abrir Solicitação de Garantia
                </Button>
              </Card>

              <Card className="border-dashed border-2 shadow-none bg-muted/20 flex flex-col items-center justify-center p-8 text-center space-y-4">
                 <div className="p-4 bg-white rounded-full shadow-sm">
                   <Info className="h-8 w-8 text-primary" />
                 </div>
                 <h3 className="font-black tracking-tight">Precisa de Ajuda Técnica?</h3>
                 <p className="text-sm text-muted-foreground font-medium max-w-[280px]">Consulte o manual do proprietário antes de realizar qualquer alteração na sua unidade.</p>
                 <Button variant="outline" className="font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl">Ver FAQ do Imóvel</Button>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Card className="border-none shadow-md bg-white p-8">
             <div className="relative border-l-2 border-muted pl-8 space-y-12 py-4 ml-4">
                {[
                  { title: "Entrega de Chaves", date: "15/04/2025", desc: "Entrega oficial da unidade para o cliente.", icon: CheckCircle2, color: "bg-green-500" },
                  { title: "Vistoria de Pré-Entrega", date: "05/04/2025", desc: "Aprovada sem ressalvas.", icon: Building, color: "bg-primary" },
                  { title: "Conclusão da Obra", date: "20/03/2025", desc: "Habite-se emitido pela prefeitura.", icon: Building2, color: "bg-primary" },
                  { title: "Assinatura de Contrato", date: "10/11/2024", desc: "Financiamento bancário aprovado.", icon: FileText, color: "bg-primary" }
                ].map((item, i) => (
                  <div key={i} className="relative">
                     <div className={cn("absolute -left-[41px] top-0 p-2 rounded-full text-white shadow-lg", item.color)}>
                        <item.icon size={16} />
                     </div>
                     <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.date}</span>
                        <h4 className="font-black text-lg tracking-tight">{item.title}</h4>
                        <p className="text-sm text-muted-foreground font-medium">{item.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
           </Card>
        </TabsContent>
      </Tabs>
      </FeatureGate>
    </div>
  );
};

export default ClientProperties;
