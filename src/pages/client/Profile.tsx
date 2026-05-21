
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks";
import { User, Mail, Phone, MapPin, Shield, Lock, BellRing } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { StatsCard } from "@/components/shared/StatsCard";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { CheckCircle, Clock } from "lucide-react";

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

          <Card className="border-primary/10 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Segurança
              </CardTitle>
              <CardDescription>Gerencie sua senha e acessos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
                <div className="space-y-1">
                  <p className="font-bold text-sm">Alterar Senha</p>
                  <p className="text-xs text-muted-foreground">Recomendamos trocar sua senha a cada 90 dias.</p>
                </div>
                <Button variant="outline" size="sm" className="font-bold uppercase tracking-tighter text-[10px]">Alterar</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
                <div className="space-y-1">
                  <p className="font-bold text-sm">Autenticação em Duas Etapas</p>
                  <p className="text-xs text-muted-foreground">Adicione uma camada extra de segurança via SMS.</p>
                </div>
                <Button variant="outline" size="sm" className="font-bold uppercase tracking-tighter text-[10px]">Ativar</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-primary" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>Defina como você quer receber alertas do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground font-medium">
              <p>Gerencie estas preferências na <Button variant="link" className="p-0 h-auto font-bold text-primary">Central de Notificações</Button>.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
