
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks";
import { User, Mail, Phone, MapPin, Shield, Lock, BellRing, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatsCard } from "@/components/shared/StatsCard";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";

const ClientProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "Carregando...",
    email: user?.email || "",
    phone: (user as any)?.phone || "",
    address: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: (user as any).phone || "",
        address: (user as any).address || "",
      });
    }
  }, [user]);

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-layout-gap animate-in fade-in duration-700 pb-20 md:pb-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
           <span className="w-2.5 h-2.5 rounded-full bg-primary" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Governança de Acessos • Perfil Proprietário</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
          Meu Perfil <span className="text-primary">.</span>
        </h1>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar and Summary */}
        <div className="md:col-span-1 space-y-layout-gap">
          <Card className="text-center overflow-hidden border-primary/10 shadow-xl rounded-3xl group">
            <div className="h-32 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent w-full group-hover:scale-110 transition-transform duration-700" />
            <CardContent className="pt-0 -mt-16 relative z-10">
              <div className="relative inline-block">
                <Avatar className="h-32 w-32 border-8 border-background mx-auto shadow-2xl group-hover:scale-105 transition-transform duration-500">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-4xl font-black bg-primary text-primary-foreground">
                    {profileData.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-2 right-2 p-2.5 bg-primary text-primary-foreground rounded-full border-4 border-background shadow-lg group-hover:rotate-12 transition-transform">
                  <Shield className="h-5 w-5" />
                </div>
              </div>
              <h2 className="mt-4 text-xl font-bold">{profileData.name}</h2>
              <p className="text-sm text-muted-foreground font-medium">Cliente A2</p>
              
              <div className="mt-6 flex flex-col gap-2">
                <Button 
                  variant={isEditing ? "outline" : "default"} 
                  className="w-full font-bold uppercase tracking-widest text-xs"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancelar" : "Editar Perfil"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-layout-gap">
            <StatsCard 
              label="Desde" 
              value="Jan 2024" 
              icon={Clock} 
              variant="brand" 
            />
            <StatsCard 
              label="Status da Conta" 
              value="Ativo" 
              icon={CheckCircle} 
              variant="complete" 
            />
          </div>
        </div>

        {/* Right Column: Form and Settings */}
        <div className="md:col-span-2 space-y-layout-gap">
          <Card className="border-primary/10 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6">
              <CardTitle className="flex items-center gap-3 text-xl font-black tracking-tight">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                Informações Pessoais
              </CardTitle>
              <CardDescription className="font-medium">Dados fundamentais para comunicações e contratos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="name" 
                      className="pl-10 h-11 rounded-xl border-2 focus-visible:ring-primary/20 transition-all"
                      value={profileData.name} 
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">E-mail</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="email" 
                      className="pl-10 h-11 rounded-xl border-2 focus-visible:ring-primary/20 transition-all"
                      value={profileData.email} 
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Telefone / WhatsApp</Label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="phone" 
                      className="pl-10 h-11 rounded-xl border-2 focus-visible:ring-primary/20 transition-all"
                      value={profileData.phone} 
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Endereço Principal</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="address" 
                      className="pl-10 h-11 rounded-xl border-2 focus-visible:ring-primary/20 transition-all"
                      value={profileData.address} 
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            {isEditing && (
              <CardFooter className="bg-muted/30 border-t flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                <Button onClick={handleSave} className="font-bold">Salvar Alterações</Button>
              </CardFooter>
            )}
          </Card>

          <Card className="border-primary/10 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-black tracking-tight">
                <Lock className="h-5 w-5 text-primary" />
                Governança de Segurança
              </CardTitle>
              <CardDescription className="font-medium">Gerencie sua senha e protocolos de acesso.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-5 bg-muted/20 rounded-2xl border border-border/5 group/sec hover:bg-primary/5 transition-all">
                <div className="space-y-1">
                  <p className="font-black text-sm group-hover/sec:text-primary transition-colors">Alterar Senha de Acesso</p>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Protocolo sugerido a cada 90 dias</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl font-black uppercase tracking-widest text-[9px] h-9 px-4 border-2">Redefinir</Button>
              </div>
              
              <div className="flex items-center justify-between p-5 bg-muted/20 rounded-2xl border border-border/5 group/2fa hover:bg-emerald-500/5 transition-all">
                <div className="space-y-1">
                  <p className="font-black text-sm group-hover/2fa:text-emerald-600 transition-colors">Autenticação MFA</p>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Camada extra de proteção via SMS/App</p>
                </div>
                <Badge className="bg-emerald-500 text-white border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Ativo</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-black tracking-tight">
                <BellRing className="h-5 w-5 text-primary" />
                Canais de Comunicação
              </CardTitle>
              <CardDescription className="font-medium">Defina como deseja ser notificado sobre vistorias e obras.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold">E-mail Transacional</span>
                </div>
                <Badge variant="outline" className="text-primary border-primary/20">Sempre Ativo</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-bold">WhatsApp Business</span>
                </div>
                <div className="w-10 h-6 bg-primary rounded-full p-1 flex justify-end cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-black tracking-tight">
                <Shield className="h-5 w-5 text-primary" />
                Registro de Atividades (Audit Log)
              </CardTitle>
              <CardDescription className="font-medium">Histórico de acessos e ações críticas para sua segurança.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/10">
                <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-sm font-bold">Login realizado</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Browser: Chrome (macOS) • IP: 187.64.XX.XX</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-muted-foreground whitespace-nowrap">Hoje, 09:42</span>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-bold">Download de Documento</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Planta Humanizada Unidade 402.pdf</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-muted-foreground whitespace-nowrap">Ontem, 14:15</span>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div>
                      <p className="text-sm font-bold">Alteração de Senha</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Sucesso na atualização</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-muted-foreground whitespace-nowrap">12 Abr 2024</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
