import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Building, Bell, ShieldCheck, User, Lock, Webhook, FileText, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
        <TabsList className="bg-muted/50 p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="properties">Empreendimentos</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="warranty">Garantias</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-sm">
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
                <CardFooter className="flex justify-end gap-2 bg-muted/20 p-4">
                  <Button variant="outline">Descartar</Button>
                  <Button onClick={handleSaveSettings}>Salvar Alterações</Button>
                </CardFooter>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Configurações de Branding</CardTitle>
                  <CardDescription>
                    Personalize a identidade visual do seu sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label>Logotipo da Empresa</Label>
                      <div className="flex flex-col gap-4">
                        <div className="h-32 w-full rounded-lg border-2 border-dashed flex items-center justify-center bg-slate-50 relative group overflow-hidden">
                          <div className="text-center p-4">
                            <Building className="mx-auto h-10 w-10 text-muted-foreground/30 mb-2" />
                            <p className="text-xs text-muted-foreground">Arraste seu logo ou clique para enviar</p>
                          </div>
                          <Input id="logo-upload" type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="h-10 w-10 bg-white rounded border flex items-center justify-center font-bold text-company">A2</div>
                          <div className="flex-1">
                            <p className="text-xs font-medium">Logo_A2_v2.png</p>
                            <p className="text-[10px] text-muted-foreground">420 KB • Pronto</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs h-7">Remover</Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="primary-color">Cor da Marca</Label>
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg shadow-sm border p-1 bg-white">
                            <div className="h-full w-full rounded-md bg-company" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Input id="primary-hex" defaultValue="#9b87f5" className="font-mono text-sm" />
                            <div className="flex gap-1">
                              {["#9b87f5", "#7c3aed", "#2563eb", "#059669", "#dc2626"].map(c => (
                                <button key={c} className="h-5 w-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="dark-mode">Modo Escuro</Label>
                            <p className="text-xs text-muted-foreground">Ativar interface escura</p>
                          </div>
                          <Switch id="dark-mode" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="show-logo">Exibir Logo</Label>
                            <p className="text-xs text-muted-foreground">Mostrar logo no menu superior</p>
                          </div>
                          <Switch id="show-logo" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 bg-muted/20 p-4">
                  <Button variant="outline">Restaurar Padrão</Button>
                  <Button onClick={handleSaveSettings}>Salvar Identidade</Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-sm overflow-hidden border-company/20">
                <div className="bg-company h-2" />
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider font-bold text-muted-foreground">Status do Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Versão</span>
                    <Badge variant="outline">v2.4.0-stable</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Banco de Dados</span>
                    <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                      <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                      Conectado
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Último Backup</span>
                    <span className="text-sm text-muted-foreground">Hoje, 04:12</span>
                  </div>
                  <div className="pt-4 border-t space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Uso de Armazenamento</p>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-company w-[45%]" />
                    </div>
                    <p className="text-[10px] text-right text-muted-foreground">4.5 GB / 10 GB (45%)</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Suporte e Ajuda</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                    <FileText className="mr-2 h-4 w-4" /> Central de Ajuda
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                    <Mail className="mr-2 h-4 w-4" /> Abrir Chamado
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
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
