import { useState } from "react";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { User, Shield, Bell, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/identity/useProfile";
import { useToast } from "@/hooks";

const Profile = () => {
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      toast({ title: "Sucesso", description: "Perfil atualizado com sucesso." });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTemplate
      title="Meu Perfil"
      description="Gerencie suas informações pessoais e preferências de segurança."
      icon={User}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 rounded-card border-none bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>Informações básicas de identificação na plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="rounded-xl h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail Corporativo</Label>
              <Input 
                id="email" 
                value={formData.email} 
                disabled 
                className="rounded-xl h-11 bg-muted/50"
              />
            </div>
            <Button onClick={handleSave} disabled={loading} className="rounded-xl font-black uppercase tracking-widest text-[11px] h-11 px-8">
              {loading ? "Salvando..." : <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-card border-none bg-primary/5 dark:bg-primary/10 backdrop-blur-xl border border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Shield className="h-4 w-4" /> Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="link" className="p-0 h-auto text-[11px] font-bold uppercase tracking-widest text-primary">Alterar Senha</Button>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Sua senha deve ter pelo menos 8 caracteres e incluir números e símbolos.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
};

export default Profile;
