
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
  Download,
  Star
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
    size: propertyData?.totalArea ? `${Math.round(propertyData.totalArea / (propertyData.units || 1))}m²` : "72,50m²",
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

    <div className="container-responsive py-layout-gap space-y-layout-gap pb-24 md:pb-6 animate-in fade-in duration-slow">
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
                 <Download className="mr-2 h-4 w-4" /> Baixar Dossier
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

        <TabsContent value="specs" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
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

          <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-slate-50 to-white p-10 overflow-hidden relative group">
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="md:w-1/3 text-center md:text-left space-y-4">
                 <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-xl">Certificação A2</Badge>
                 <h3 className="text-3xl font-black tracking-tighter">Qualidade de Materiais</h3>
                 <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                   Todos os materiais aplicados na sua unidade seguem os mais rigorosos padrões de qualidade e sustentabilidade do mercado.
                 </p>
                 <Button variant="outline" className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-8 border-2">Ver Certificados</Button>
              </div>
              <div className="md:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                {[
                  { name: "Cimento", brand: "Votoran Premium", rating: 5 },
                  { name: "Piso", brand: "Portobello 90x90", rating: 5 },
                  { name: "Metais", brand: "Docol Linha Luxo", rating: 5 },
                  { name: "Fios", brand: "Pirelli Antichama", rating: 5 },
                  { name: "Vidros", brand: "Cebrace Térmico", rating: 4 },
                  { name: "Tintas", brand: "Suvinil Proteção", rating: 5 }
                ].map((mat, i) => (
                  <div key={i} className="p-5 bg-white rounded-2xl border border-border/5 shadow-sm hover:shadow-md transition-all">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">{mat.name}</p>
                    <p className="text-xs font-black truncate">{mat.brand}</p>
                    <div className="flex gap-0.5 mt-2">
                      {Array.from({length: 5}).map((_, j) => (
                        <div key={j} className={cn("w-1.5 h-1.5 rounded-full", j < mat.rating ? "bg-primary" : "bg-muted")} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Card className="border-none shadow-md overflow-hidden bg-white rounded-[2.5rem]">
             <CardHeader className="bg-muted/30 pb-6 border-b p-10">
               <CardTitle className="text-2xl font-black tracking-tight">Arquivos da Unidade</CardTitle>
               <CardDescription className="font-medium">Documentos oficiais e técnicos para download.</CardDescription>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y">
                   {propertyDetails.documents.map((doc) => (
                     <div key={doc.id} className="flex items-center justify-between p-8 hover:bg-muted/30 transition-all group">
                        <div className="flex items-center gap-6">
                           <div className="p-4 bg-primary/5 text-primary rounded-2xl">
                              <FileText className="h-6 w-6" strokeWidth={2.5} />
                           </div>
                           <div>
                              <h4 className="font-black text-base group-hover:text-primary transition-colors">{doc.title}</h4>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{doc.size} • PDF Digitalizado</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <Button variant="ghost" size="sm" className="font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-xl hover:bg-primary/10 text-primary" onClick={() => handleViewDocument(doc.title)}>
                             Visualizar
                           </Button>
                           <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl hover:bg-primary hover:text-white transition-all border-2">
                             <Download className="h-4 w-4" strokeWidth={3} />
                           </Button>
                        </div>
                     </div>
                   ))}
                </div>
             </CardContent>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <Card className="rounded-[3rem] border-none shadow-xl bg-slate-900 text-white p-12 relative overflow-hidden group">
                 <div className="absolute right-[-10%] top-[-10%] opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                    <Building2 size={240} />
                 </div>
                 <div className="relative z-10 space-y-6">
                    <Badge className="bg-primary border-none font-black uppercase text-[10px] px-4 py-1.5 rounded-xl">Status Comunitário</Badge>
                    <h4 className="text-3xl font-black tracking-tighter">Áreas Comuns & Lazer</h4>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                       Acompanhe o status de entrega e manutenção dos espaços compartilhados do seu empreendimento Aurora Exclusive.
                    </p>
                    <div className="space-y-4 pt-4">
                       {[
                         { label: "Piscina & Deck", status: "Entregue" },
                         { label: "Espaço Gourmet", status: "Em Manutenção" },
                         { label: "Academia Premium", status: "Entregue" }
                       ].map((item, i) => (
                         <div key={i} className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-200">{item.label}</span>
                            <span className={cn("px-3 py-1 rounded-lg font-black uppercase text-[9px] tracking-widest", item.status === 'Entregue' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400')}>
                               {item.status}
                            </span>
                         </div>
                       ))}
                    </div>
                 </div>
              </Card>

              <Card className="rounded-[3rem] border-none shadow-xl bg-white p-12 space-y-8">
                 <div className="flex items-center gap-5">
                    <div className="p-4 bg-primary/5 rounded-2xl text-primary shadow-inner">
                       <MapPin size={24} strokeWidth={3} />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black tracking-tighter">Vizinhança A2</h4>
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Localização Privilegiada</p>
                    </div>
                 </div>
                 <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Sua unidade está em uma região estratégica com alta valorização e infraestrutura completa de serviços e lazer.
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-2xl">
                      <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Pontuação</p>
                      <p className="text-sm font-black text-primary flex items-center gap-1">9.8/10 <Star size={12} fill="currentColor" /></p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-2xl">
                      <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Walk Score</p>
                      <p className="text-sm font-black text-primary">Excelente</p>
                    </div>
                 </div>
                 <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] border-2 shadow-sm">
                    Ver Guia do Bairro
                 </Button>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="warranty" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-none shadow-xl bg-white p-10 rounded-[3rem]">
                <h3 className="text-2xl font-black tracking-tight mb-8 flex items-center gap-4">
                  <div className="p-3 bg-primary/5 rounded-xl text-primary"><ShieldCheck className="h-6 w-6" strokeWidth={2.5} /></div>
                  Prazos de Garantia
                </h3>
                <div className="space-y-8">
                   {[
                     { label: "Estrutural", value: "5 anos", exp: "Abr/2030", progress: 85 },
                     { label: "Impermeabilização", value: "3 anos", exp: "Abr/2028", progress: 60 },
                     { label: "Hidráulica/Elétrica", value: "2 anos", exp: "Abr/2027", progress: 40 },
                     { label: "Acabamentos", value: "1 ano", exp: "Abr/2026", progress: 20 }
                   ].map((item, i) => (
                     <div key={i} className="space-y-3">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <p className="text-base font-black">{item.label}</p>
                              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Validade: {item.exp}</p>
                           </div>
                           <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] px-4 py-1.5 uppercase tracking-widest rounded-xl">{item.value}</Badge>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                           <div className="h-full bg-primary rounded-full" style={{ width: `${100 - item.progress}%` }} />
                        </div>
                     </div>
                   ))}
                </div>
                <Button className="w-full mt-10 font-black uppercase tracking-widest text-[11px] h-14 rounded-[1.5rem] shadow-xl shadow-primary/20" onClick={() => navigate("/client/warranty")}>
                   Abrir Solicitação de Assistência
                </Button>
              </Card>

              <Card className="border-2 border-dashed border-primary/20 shadow-none bg-primary/[0.02] rounded-[3rem] flex flex-col items-center justify-center p-12 text-center space-y-6">
                 <div className="p-6 bg-white rounded-3xl shadow-xl text-primary group-hover:scale-110 transition-transform">
                   <Info className="h-10 w-10" strokeWidth={2.5} />
                 </div>
                 <h3 className="text-2xl font-black tracking-tight">Precisa de Suporte Técnico?</h3>
                 <p className="text-base text-muted-foreground font-medium max-w-[320px] leading-relaxed">Consulte o manual do proprietário digitalizado antes de realizar qualquer alteração estrutural na sua unidade.</p>
                 <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Button variant="outline" className="flex-1 font-black uppercase tracking-widest text-[10px] h-12 rounded-xl border-2">FAQ do Imóvel</Button>
                    <Button variant="outline" className="flex-1 font-black uppercase tracking-widest text-[10px] h-12 rounded-xl border-2">Ver Normas</Button>
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Card className="border-none shadow-xl bg-white p-12 rounded-[3rem]">
             <div className="relative border-l-4 border-muted/30 pl-12 space-y-16 py-6 ml-6">
                {[
                  { title: "Entrega de Chaves", date: "15/04/2025", desc: "Entrega oficial da unidade para o cliente com termo de posse assinado.", icon: CheckCircle2, color: "bg-emerald-500" },
                  { title: "Vistoria de Pré-Entrega", date: "05/04/2025", desc: "Aprovada sem ressalvas em primeira inspeção técnica.", icon: Building, color: "bg-primary" },
                  { title: "Conclusão da Obra", date: "20/03/2025", desc: "Habite-se emitido pela prefeitura e averbado.", icon: Building2, color: "bg-primary" },
                  { title: "Assinatura de Contrato", date: "10/11/2024", desc: "Financiamento bancário e alienação fiduciária aprovados.", icon: FileText, color: "bg-primary" }
                ].map((item, i) => (
                  <div key={i} className="relative">
                     <div className={cn("absolute -left-[68px] top-0 p-3 rounded-2xl text-white shadow-2xl border-4 border-white", item.color)}>
                        <item.icon size={20} strokeWidth={3} />
                     </div>
                     <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">{item.date}</span>
                        <h4 className="font-black text-2xl tracking-tight mt-2">{item.title}</h4>
                        <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-2xl">{item.desc}</p>
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
