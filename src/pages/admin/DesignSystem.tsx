
import React, { useState } from 'react';
import { 
  Box, 
  Layers, 
  Activity, 
  Layout,
  Accessibility,
  Smartphone,
  Tablet,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Zap,
  Clock,
  MoreVertical,
  Plus,
  ArrowRight,
  ShieldCheck,
  Keyboard,
  Contrast,
  Type,
  LayoutGrid,
  List,
  Table as TableIcon,
  Calendar as CalendarIcon,
  BarChart3,
  Search
} from 'lucide-react';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/Shared/StatusBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatsCard } from '@/components/Shared/StatsCard';
import { DataView } from '@/components/Shared/DataView';

const DesignSystem = () => {
  const [playgroundState, setPlaygroundState] = useState({
    disabled: false,
    loading: false,
    theme: 'light'
  });

  return (
    <div className="container-responsive py-8 space-y-10 animate-fade-in">
      <PageHeader
        icon={Layout}
        title="Design System v3.0"
        description="Arquitetura robusta de Design Tokens, componentes compartilhados de alta performance e acessibilidade garantida."
      >
        <div className="flex gap-2">
          <Badge variant="secondary" className="h-6 font-bold">Stable v3.0.0</Badge>
          <Button variant="outline" size="sm" className="h-9 rounded-lg">
            <BookOpen className="w-4 h-4 mr-2" /> Docs
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="guide" className="space-y-8">
        <TabsList className="bg-background/50 border w-full justify-start overflow-x-auto h-auto p-1 sticky top-0 z-sticky backdrop-blur-sm rounded-xl">
          <TabsTrigger value="guide" className="text-xs font-bold gap-2 py-2.5 rounded-lg px-4">
            <BookOpen className="w-3.5 h-3.5" /> Guia
          </TabsTrigger>
          <TabsTrigger value="tokens" className="text-xs font-bold gap-2 py-2.5 rounded-lg px-4">
            <Layers className="w-3.5 h-3.5" /> Tokens
          </TabsTrigger>
          <TabsTrigger value="components" className="text-xs font-bold gap-2 py-2.5 rounded-lg px-4">
            <Box className="w-3.5 h-3.5" /> Componentes
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="text-xs font-bold gap-2 py-2.5 rounded-lg px-4">
            <Accessibility className="w-3.5 h-3.5" /> Acessibilidade
          </TabsTrigger>
          <TabsTrigger value="forms" className="text-xs font-bold gap-2 py-2.5 rounded-lg px-4">
            <Smartphone className="w-3.5 h-3.5" /> Formulários
          </TabsTrigger>
          <TabsTrigger value="playground" className="text-xs font-bold gap-2 py-2.5 rounded-lg px-4">
            <Zap className="w-3.5 h-3.5" /> Playground
          </TabsTrigger>
        </TabsList>

        {/* --- GUIDE CONTENT --- */}
        <TabsContent value="guide" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <section className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-h2">Princípios & Arquitetura</h2>
              <p className="text-body-base text-muted-foreground leading-relaxed">
                Nosso sistema é construído sobre uma base sólida de <strong>Design Tokens</strong>. 
                Cada token é uma variável semântica que permite escalabilidade, consistência e fácil manutenção. 
                O foco da v3.0 é a <strong>otimização do tema escuro</strong> e <strong>refinamento da escala tipográfica</strong>.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="card-standard p-5 border-emerald-500/20 bg-emerald-500/5">
                  <h4 className="text-label mb-3 flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" /> Boas Práticas
                  </h4>
                  <ul className="text-caption space-y-2 list-disc list-inside font-medium">
                    <li>Use <code>container-responsive</code> em todas as páginas</li>
                    <li>Siga a escala tipográfica (<code>text-h1</code> a <code>text-tiny</code>)</li>
                    <li>Utilize <code>StatsCard</code> para métricas rápidas</li>
                    <li>Implemente <code>DataView</code> para listas e grids</li>
                  </ul>
                </Card>
                <Card className="card-standard p-5 border-rose-500/20 bg-rose-500/5">
                  <h4 className="text-label mb-3 flex items-center gap-2 text-rose-600">
                    <AlertTriangle className="w-4 h-4" /> Checklist de Estados
                  </h4>
                  <ul className="text-caption space-y-2 list-disc list-inside font-medium text-muted-foreground">
                    <li><strong>Hover:</strong> Transições suaves de cor/escala</li>
                    <li><strong>Focus:</strong> Anéis de foco (ring) visíveis e nítidos</li>
                    <li><strong>Disabled:</strong> Opacidade 0.4 e cursor não permitido</li>
                    <li><strong>Active:</strong> Efeito de clique (scale 0.95-0.98)</li>
                  </ul>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="card-standard border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-h4">Breakpoints Responsivos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <BreakpointItem icon={Smartphone} label="Mobile" value="< 640px" />
                  <BreakpointItem icon={Tablet} label="Tablet" value="≥ 768px" />
                  <BreakpointItem icon={Laptop} label="Desktop" value="≥ 1024px" />
                  <BreakpointItem icon={Layout} label="Wide" value="≥ 1280px" />
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>


        {/* --- TOKENS CONTENT --- */}
        <TabsContent value="tokens" className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Cores Semânticas</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ColorToken name="Primary" token="--primary" color="hsl(var(--primary))" />
              <ColorToken name="Secondary" token="--secondary" color="hsl(var(--secondary))" />
              <ColorToken name="Destructive" token="--destructive" color="hsl(var(--destructive))" />
              <ColorToken name="Background" token="--background" color="hsl(var(--background))" />
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Layout className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Espaçamento & Grid</h2>
            </div>
            <div className="bg-card border rounded-xl overflow-hidden divide-y">
              <SpacingItem label="Layout Gap" token="gap-layout-gap" size="24px / 1.5rem" />
              <SpacingItem label="Space 6" token="gap-6-sem" size="24px / 1.5rem" />
              <SpacingItem label="Space 4" token="gap-4-sem" size="16px / 1rem" />
              <SpacingItem label="Space 2" token="gap-2-sem" size="8px / 0.5rem" />
              <SpacingItem label="Space 1" token="gap-1-sem" size="4px / 0.25rem" />
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Elevação & Opacidade</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <ShadowItem name="Shadow SM" token="shadow-sem-sm" />
              <ShadowItem name="Shadow MD" token="shadow-sem-md" />
              <ShadowItem name="Shadow LG" token="shadow-sem-lg" />
              <ShadowItem name="Shadow XL" token="shadow-sem-xl" />
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Type className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Escala Tipográfica</h2>
            </div>
            <div className="bg-card border rounded-xl overflow-hidden divide-y">
              <TypographyItem label="Display" className="text-sem-display" size="60px / 3.75rem" />
              <TypographyItem label="Heading 1" className="text-sem-h1" size="36px / 2.25rem" />
              <TypographyItem label="Heading 2" className="text-sem-h2" size="30px / 1.875rem" />
              <TypographyItem label="Heading 3" className="text-sem-h3" size="24px / 1.5rem" />
              <TypographyItem label="Body Base" className="text-sem-body-base" size="16px / 1rem" />
              <TypographyItem label="Caption" className="text-sem-caption uppercase" size="12px / 0.75rem" />
              <TypographyItem label="Tiny" className="text-sem-tiny uppercase" size="10px / 0.625rem" />
            </div>
          </section>
        </TabsContent>


        {/* --- COMPONENTS CONTENT --- */}
        <TabsContent value="components" className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <section className="space-y-8">
            <div className="flex items-center gap-2 border-b pb-2">
              <Box className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Catálogo de Shared Components</h2>
            </div>

            <div className="space-y-10">
              {/* Stats Cards */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <h3 className="text-h4">StatsCard</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatsCard 
                    label="Pendente" 
                    value="12" 
                    icon={Clock} 
                    variant="pending" 
                    description="Vistorias em espera"
                  />
                  <StatsCard 
                    label="Concluído" 
                    value="85%" 
                    icon={CheckCircle2} 
                    variant="complete" 
                    trend={{ value: '12%', isPositive: true }}
                  />
                  <StatsCard 
                    label="Urgente" 
                    value="03" 
                    icon={AlertTriangle} 
                    variant="critical" 
                  />
                </div>
              </div>

              {/* DataView */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <LayoutGrid className="w-4 h-4 text-primary" />
                  <h3 className="text-h4">DataView</h3>
                </div>
                <Card className="card-standard p-6 border-dashed bg-muted/5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <p className="text-body-sm text-muted-foreground max-w-lg">
                      O <code>DataView</code> é um componente agnóstico que gerencia visualizações (Grid, Table, Timeline, Calendar), estados de carregamento, paginação e estados vazios de forma declarativa.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="h-8"><LayoutGrid size={14} className="mr-1.5" /> Grid</Button>
                      <Button size="sm" variant="outline" className="h-8"><TableIcon size={14} className="mr-1.5" /> Table</Button>
                      <Button size="sm" variant="outline" className="h-8"><List size={14} className="mr-1.5" /> List</Button>
                      <Button size="sm" variant="outline" className="h-8"><CalendarIcon size={14} className="mr-1.5" /> Calendar</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <Card key={i} className="card-standard p-4 border-none bg-background shadow-sem-sm">
                        <div className="h-20 bg-muted/20 rounded-lg mb-3" />
                        <div className="h-4 bg-muted/40 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted/20 rounded w-1/2" />
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </section>
        </TabsContent>

        {/* --- ACCESSIBILITY CONTENT --- */}
        <TabsContent value="accessibility" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Accessibility className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Diretrizes de Acessibilidade</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <A11yCard 
                icon={Contrast} 
                title="Contraste" 
                desc="Cores semânticas testadas para conformidade WCAG AA em temas claro e escuro." 
              />
              <A11yCard 
                icon={Keyboard} 
                title="Teclado" 
                desc="Foco visível e navegação lógica garantida em todos os fluxos interativos." 
              />
              <A11yCard 
                icon={ShieldCheck} 
                title="ARIA" 
                desc="Uso sistemático de roles e labels para garantir suporte a leitores de tela." 
              />
            </div>
          </section>
        </TabsContent>

        {/* --- FORMS CONTENT --- */}
        <TabsContent value="forms" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Smartphone className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Padrões de Formulário</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="card-standard p-6 border-none bg-card/50 backdrop-blur-sm">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Input & Label</CardTitle>
                </CardHeader>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-label font-bold">Nome do Usuário</Label>
                    <Input placeholder="Ex: João Silva" />
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Use labels claros e placeholders de exemplo.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-label font-bold">Email Institucional</Label>
                    <Input type="email" defaultValue="erro@exemplo" className="border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" />
                    <p className="text-[10px] text-destructive font-black uppercase tracking-tight">Este campo requer um email válido.</p>
                  </div>
                </div>
              </Card>
              <Card className="card-standard p-6 border-none bg-card/50 backdrop-blur-sm">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Estrutura de Diálogo</CardTitle>
                </CardHeader>
                <div className="space-y-6">
                  <div className="p-6 bg-muted/20 rounded-xl border border-dashed border-border/40">
                    <p className="text-xs text-center font-bold text-muted-foreground">
                      Todos os formulários em modais devem seguir a estrutura:
                      <br/>
                      <span className="text-primary mt-2 block uppercase tracking-widest">Header &gt; Content (Scroll) &gt; Footer (Sticky)</span>
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 pt-6 border-t border-border/10">
                    <Button variant="outline" className="h-11 px-6 font-bold">Cancelar</Button>
                    <Button className="h-11 px-6 font-bold shadow-sem-md">Salvar Alterações</Button>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </TabsContent>

        {/* --- PLAYGROUND CONTENT --- */}
        <TabsContent value="playground" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="card-standard">
              <CardHeader>
                <CardTitle className="text-h4">Botões & Estados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <Button disabled={playgroundState.disabled}>Primário</Button>
                  <Button variant="secondary">Secundário</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline"><Plus size={16}/></Button>
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large <ArrowRight className="ml-2" size={16}/></Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-standard">
              <CardHeader>
                <CardTitle className="text-h4">Feedbacks Visuais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="complete" />
                  <StatusBadge status="progress" />
                  <StatusBadge status="pending" />
                  <StatusBadge status="critical" />
                </div>
                <div className="pt-4 border-t space-y-4">
                  <Label className="text-label">Anéis de Foco Padronizados</Label>
                  <div className="flex gap-4">
                    <Button variant="outline" className="focus-ring ring-2 ring-ring ring-offset-2">Foco Forçado</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const ColorToken = ({ name, token, color }: { name: string, token: string, color: string }) => (
  <div className="p-4 rounded-xl border bg-background flex flex-col gap-3">
    <div className="h-12 rounded-lg border" style={{ backgroundColor: color }} />
    <div className="flex flex-col">
      <span className="text-sem-label">{name}</span>
      <code className="text-sem-tiny text-muted-foreground">{token}</code>
    </div>
  </div>
);

const SpacingItem = ({ label, token, size }: { label: string, token: string, size: string }) => (
  <div className="p-6 flex items-center justify-between">
    <div className="flex items-center gap-6 flex-1">
      <div className="h-6 bg-primary/20 rounded border border-primary/20 flex items-center justify-center transition-all" style={{ width: size.split(' / ')[0] }}>
        <div className="h-full w-full bg-primary/40 rounded" />
      </div>
      <div className="space-y-1">
        <p className="text-sem-label">{label}</p>
        <code className="text-sem-tiny text-muted-foreground">{token}</code>
      </div>
    </div>
    <span className="text-sem-tiny font-black bg-muted/50 px-3 py-1 rounded-lg">{size}</span>
  </div>
);

const BreakpointItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/10">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sem-label">{label}</span>
    </div>
    <span className="text-sem-tiny font-black text-muted-foreground uppercase">{value}</span>
  </div>
);

const ShadowItem = ({ name, token }: { name: string, token: string }) => (
  <div className="space-y-3">
    <div className={cn("h-24 bg-card border rounded-xl flex items-center justify-center transition-all", token)}>
      <div className="w-12 h-12 bg-primary/20 rounded-lg border border-primary/20" />
    </div>
    <div className="flex flex-col">
      <span className="text-sem-label">{name}</span>
      <code className="text-sem-tiny text-muted-foreground">shadow-{token}</code>
    </div>
  </div>
);

const TypographyItem = ({ label, className, size }: { label: string, className: string, size: string }) => (
  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="space-y-1">
      <p className="text-sem-caption text-muted-foreground uppercase">{label}</p>
      <p className={cn("font-bold", className)}>The quick brown fox jumps over the lazy dog</p>
    </div>
    <code className="text-sem-tiny bg-muted/50 px-3 py-1.5 rounded-lg border border-border/20 self-start md:self-auto font-black">{size}</code>
  </div>
);

const A11yCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <Card className="card-standard p-6 border-none bg-card/40 backdrop-blur-sm">
    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
      <Icon className="w-5 h-5" />
    </div>
    <h4 className="text-label mb-2">{title}</h4>
    <p className="text-sem-body-sm text-muted-foreground leading-relaxed">{desc}</p>
  </Card>
);

export default DesignSystem;

