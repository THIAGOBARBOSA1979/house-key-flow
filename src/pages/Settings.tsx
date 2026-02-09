import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Building, Bell, ShieldCheck, User, Lock, Webhook } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import WebhooksConfig from "@/components/Settings/WebhooksConfig";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings = () => {
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas alterações foram salvas com sucesso."
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={SettingsIcon}
        title="Configurações do Sistema"
        description="Personalize a aplicação conforme as necessidades da sua empresa"
      />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="properties">Empreendimentos</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="warranty">Garantias</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Dados básicos que aparecem em documentos e relatórios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input id="company-name" defaultValue="A2 Incorporadora" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-cnpj">CNPJ</Label>
                  <Input id="company-cnpj" defaultValue="12.345.678/0001-90" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">E-mail de Contato</Label>
                  <Input id="company-email" type="email" defaultValue="contato@a2incorporadora.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Telefone</Label>
                  <Input id="company-phone" defaultValue="(11) 3456-7890" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-address">Endereço</Label>
                <Input id="company-address" defaultValue="Av. Paulista, 1000, São Paulo - SP" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={handleSaveSettings}>Salvar Alterações</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personalização</CardTitle>
              <CardDescription>
                Personalize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">Ativar o modo escuro para a interface</p>
                  </div>
                  <Switch id="dark-mode" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-logo">Mostrar Logo na Interface</Label>
                    <p className="text-sm text-muted-foreground">Exibir o logo da empresa em todas as páginas</p>
                  </div>
                  <Switch id="show-logo" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-upload">Logotipo da Empresa</Label>
                  <Input id="logo-upload" type="file" accept="image/*" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input id="primary-color" type="color" className="w-24 h-10" defaultValue="#9b87f5" />
                    <Input id="primary-hex" className="flex-1" defaultValue="#9b87f5" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Restaurar Padrão</Button>
              <Button onClick={handleSaveSettings}>Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Configurações de Empreendimentos
              </CardTitle>
              <CardDescription>
                Defina as configurações padrão para novos empreendimentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Agendamento Automático de Vistorias</Label>
                  <p className="text-sm text-muted-foreground">Agendar vistorias automaticamente após a conclusão do empreendimento</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Relatórios Mensais</Label>
                  <p className="text-sm text-muted-foreground">Gerar relatórios mensais de status para todos os empreendimentos</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Integração de Documentos</Label>
                  <p className="text-sm text-muted-foreground">Sincronizar documentos automaticamente com Google Drive</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings}>Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificações
              </CardTitle>
              <CardDescription>
                Gerencie como e quando as notificações são enviadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notificações para Clientes</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="client-email">E-mail</Label>
                    <Switch id="client-email" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="client-sms">SMS</Label>
                    <Switch id="client-sms" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="client-push">Push (Aplicativo)</Label>
                    <Switch id="client-push" defaultChecked />
                  </div>
                </div>

                <Separator className="my-4" />

                <h3 className="text-lg font-medium">Notificações para Equipe Interna</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="team-email">E-mail</Label>
                    <Switch id="team-email" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="team-sms">SMS</Label>
                    <Switch id="team-sms" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="team-system">Notificações no Sistema</Label>
                    <Switch id="team-system" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings}>Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="warranty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Configurações de Garantias
              </CardTitle>
              <CardDescription>
                Configure os prazos e regras para garantias de imóveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Prazos de Garantia</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="structural-warranty">Problemas Estruturais (anos)</Label>
                      <Input id="structural-warranty" type="number" defaultValue="5" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="waterproofing-warranty">Impermeabilização (anos)</Label>
                      <Input id="waterproofing-warranty" type="number" defaultValue="3" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="installations-warranty">Instalações Elétricas e Hidráulicas (anos)</Label>
                      <Input id="installations-warranty" type="number" defaultValue="2" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="finishings-warranty">Acabamentos (anos)</Label>
                      <Input id="finishings-warranty" type="number" defaultValue="1" />
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-medium mt-6">SLA de Atendimento</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency-sla">Emergencial (horas)</Label>
                      <Input id="emergency-sla" type="number" defaultValue="24" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="urgent-sla">Urgente (horas)</Label>
                      <Input id="urgent-sla" type="number" defaultValue="72" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="normal-sla">Normal (dias)</Label>
                      <Input id="normal-sla" type="number" defaultValue="10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="low-sla">Baixa Prioridade (dias)</Label>
                      <Input id="low-sla" type="number" defaultValue="30" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings}>Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Configurações de Usuários
              </CardTitle>
              <CardDescription>
                Configure as políticas de acesso e permissões de usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Cadastro de Clientes</Label>
                    <p className="text-sm text-muted-foreground">Permitir que clientes criem suas próprias contas</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Aprovação de Novos Usuários</Label>
                    <p className="text-sm text-muted-foreground">Exigir aprovação manual para novos usuários do sistema</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autenticação em Dois Fatores</Label>
                    <p className="text-sm text-muted-foreground">Exigir autenticação em dois fatores para todos os usuários</p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Tempo de Expiração de Sessão (minutos)</Label>
                  <Input id="session-timeout" type="number" defaultValue="30" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings}>Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Segurança
              </CardTitle>
              <CardDescription>
                Configure as políticas de segurança do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Criptografia de Dados</Label>
                    <p className="text-sm text-muted-foreground">Criptografar todos os dados sensíveis de clientes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">Realizar backup automático diário de todos os dados</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Log de Auditoria</Label>
                    <p className="text-sm text-muted-foreground">Registrar todas as ações realizadas no sistema</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-policy">Política de Senhas</Label>
                  <Select defaultValue="strong">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar política" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Básica (mínimo 8 caracteres)</SelectItem>
                      <SelectItem value="medium">Média (letras, números e símbolos)</SelectItem>
                      <SelectItem value="strong">Forte (letras maiúsculas, minúsculas, números e símbolos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings}>Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <WebhooksConfig />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Integrações Externas
              </CardTitle>
              <CardDescription>
                Configure as integrações com serviços externos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google-api-key">Google Drive API Key</Label>
                <Input
                  id="google-api-key"
                  type="password"
                  placeholder="Insira sua chave de API do Google Drive"
                />
                <p className="text-sm text-muted-foreground">
                  Esta chave é usada para armazenar documentos e fotos no Google Drive
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings}>Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
