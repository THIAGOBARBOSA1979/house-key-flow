
import React from 'react';
import { 
  Palette, 
  Type, 
  Square, 
  Box, 
  Layers, 
  Grid, 
  Activity, 
  Layout,
  MousePointer2,
  Accessibility,
  Laptop,
  Tablet,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Info
} from 'lucide-react';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const DesignSystem = () => {
  return (
    <div className="container-responsive py-8 space-y-10 animate-fade-in">
      <PageHeader
        icon={Layout}
        title="Design System"
        description="Diretrizes visuais, tokens e catálogo de componentes reutilizáveis."
      >
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Laptop className="w-4 h-4 mr-2" /> Desktop
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Tablet className="w-4 h-4 mr-2" /> Tablet
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Smartphone className="w-4 h-4 mr-2" /> Mobile
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="tokens" className="space-y-8">
        <TabsList className="bg-background/50 border w-full justify-start overflow-x-auto">
          <TabsTrigger value="tokens" className="text-xs font-bold gap-2">
            <Layers className="w-3.5 h-3.5" /> Tokens Visuais
          </TabsTrigger>
          <TabsTrigger value="components" className="text-xs font-bold gap-2">
            <Box className="w-3.5 h-3.5" /> Catálogo de Componentes
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="text-xs font-bold gap-2">
            <Accessibility className="w-3.5 h-3.5" /> Acessibilidade
          </TabsTrigger>
          <TabsTrigger value="playground" className="text-xs font-bold gap-2">
            <Activity className="w-3.5 h-3.5" /> Playground
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="space-y-12 animate-in fade-in slide-in-from-bottom-2">
          {/* Colors */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Paleta de Cores</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ColorToken name="Primary (Brand)" value="hsl(var(--primary))" variable="--primary" description="Cor principal para ações e destaques." />
              <ColorToken name="Background" value="hsl(var(--background))" variable="--background" description="Fundo principal da aplicação." />
              <ColorToken name="Foreground" value="hsl(var(--foreground))" variable="--foreground" description="Cor de texto padrão." />
              <ColorToken name="Muted" value="hsl(var(--muted))" variable="--muted" description="Elementos secundários ou desabilitados." />
            </div>
            
            <h3 className="text-h3 mt-6">Status Semânticos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ColorToken name="Pending" value="hsl(var(--status-pending))" variable="--status-pending" />
              <ColorToken name="Progress" value="hsl(var(--status-progress))" variable="--status-progress" />
              <ColorToken name="Complete" value="hsl(var(--status-complete))" variable="--status-complete" />
              <ColorToken name="Critical" value="hsl(var(--status-critical))" variable="--status-critical" />
            </div>
          </section>

          {/* Typography */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Type className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Tipografia</h2>
            </div>
            <Card className="card-standard">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <p className="text-tiny text-muted-foreground">Display / Hero</p>
                  <p className="text-display">O Futuro da Gestão de Propriedades</p>
                </div>
                <div className="space-y-2">
                  <p className="text-tiny text-muted-foreground">Heading 1</p>
                  <p className="text-h1">Título Principal de Seção</p>
                </div>
                <div className="space-y-2">
                  <p className="text-tiny text-muted-foreground">Heading 2</p>
                  <p className="text-h2">Subtítulo ou Seção Secundária</p>
                </div>
                <div className="space-y-2">
                  <p className="text-tiny text-muted-foreground">Body Text</p>
                  <p className="text-body">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Borders & Radii */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Square className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Bordas e Radii</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <RadiusToken name="Radius XS" value="var(--radius-xs)" />
              <RadiusToken name="Radius SM" value="var(--radius-sm)" />
              <RadiusToken name="Radius MD" value="var(--radius-md)" />
              <RadiusToken name="Radius LG" value="var(--radius-lg)" />
              <RadiusToken name="Radius XL" value="var(--radius-xl)" />
            </div>
          </section>

          {/* Elevation & Shadows */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Box className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Elevação e Sombras</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="card-standard p-8 text-center bg-background shadow-sm border-none">
                <p className="text-xs font-bold uppercase">Shadow SM</p>
                <p className="text-[10px] text-muted-foreground mt-1">var(--shadow-sm)</p>
              </div>
              <div className="card-standard p-8 text-center bg-background shadow-md border-none">
                <p className="text-xs font-bold uppercase">Shadow MD</p>
                <p className="text-[10px] text-muted-foreground mt-1">var(--shadow-md)</p>
              </div>
              <div className="card-standard p-8 text-center bg-background shadow-lg border-none">
                <p className="text-xs font-bold uppercase">Shadow LG</p>
                <p className="text-[10px] text-muted-foreground mt-1">var(--shadow-lg)</p>
              </div>
            </div>
          </section>

          {/* Spacing Scale */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Grid className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Escala de Espaçamento</h2>
            </div>
            <div className="space-y-4 max-w-xl bg-muted/20 p-6 rounded-xl border">
              <SpacingItem label="Space 1" variable="--space-1" width="w-[0.25rem]" />
              <SpacingItem label="Space 2" variable="--space-2" width="w-[0.5rem]" />
              <SpacingItem label="Space 3" variable="--space-3" width="w-[0.75rem]" />
              <SpacingItem label="Space 4" variable="--space-4" width="w-[1rem]" />
              <SpacingItem label="Space 6" variable="--space-6" width="w-[1.5rem]" />
              <SpacingItem label="Space 8" variable="--space-8" width="w-[2rem]" />
            </div>
          </section>

        </TabsContent>

        <TabsContent value="components" className="space-y-12 animate-in fade-in slide-in-from-bottom-2">
          {/* Status Badges Catalogo */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Status Badges</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="space-y-2">
                <p className="text-tiny text-muted-foreground">Pendente</p>
                <StatusBadge status="pending" />
              </div>
              <div className="space-y-2">
                <p className="text-tiny text-muted-foreground">Em Andamento</p>
                <StatusBadge status="progress" />
              </div>
              <div className="space-y-2">
                <p className="text-tiny text-muted-foreground">Concluído</p>
                <StatusBadge status="complete" />
              </div>
              <div className="space-y-2">
                <p className="text-tiny text-muted-foreground">Crítico</p>
                <StatusBadge status="critical" />
              </div>
              <div className="space-y-2">
                <p className="text-tiny text-muted-foreground">Custom Label</p>
                <StatusBadge status="success" label="Finalizado" />
              </div>
            </div>
          </section>

          {/* Buttons Catalogo */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <MousePointer2 className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Botões e Interativos</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button>Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="outline">Outline Style</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive</Button>
              <Button disabled>Disabled State</Button>
            </div>
          </section>

          {/* Forms Catalogo */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Square className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Formulários</h2>
            </div>
            <div className="max-w-md space-y-4 bg-muted/20 p-6 rounded-lg border">
              <div className="space-y-2">
                <Label htmlFor="demo-input">Input Padrão</Label>
                <Input id="demo-input" placeholder="Digite algo..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-select">Select Customizado</Label>
                <Select>
                  <SelectTrigger id="demo-select">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Opção 1</SelectItem>
                    <SelectItem value="2">Opção 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-12 animate-in fade-in slide-in-from-bottom-2">
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Accessibility className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Diretrizes de Acessibilidade</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="card-standard bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    WCAG AA Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Contraste mínimo de 4.5:1 para texto normal.
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Foco visível (Focus Ring) em todos os elementos interativos.
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Área mínima de toque de 44x44px em mobile.
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Semântica correta com ARIA roles.
                  </div>
                </CardContent>
              </Card>

              <Card className="card-standard bg-amber-500/5 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Pontos de Atenção
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground italic">"A acessibilidade não é um recurso, é uma premissa básica de design no A2 Gestão de Propriedades."</p>
                  <ul className="list-disc list-inside text-sm space-y-2 mt-4">
                    <li>Evite confiar apenas na cor para transmitir informação.</li>
                    <li>Sempre forneça alternativas textuais (alt) para imagens.</li>
                    <li>Garanta que a navegação por teclado siga uma ordem lógica.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="playground" className="space-y-12 animate-in fade-in slide-in-from-bottom-2">
           <section className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-2">
                <Activity className="w-5 h-5 text-primary" />
                <h2 className="text-h2">Simulador de Breakpoints</h2>
              </div>
              <div className="border rounded-xl p-10 bg-muted/10 flex items-center justify-center min-h-[400px]">
                 <div className="text-center space-y-4">
                    <Layout className="w-12 h-12 text-primary mx-auto opacity-50" />
                    <p className="text-muted-foreground">Selecione um breakpoint acima para simular visualizações.</p>
                 </div>
              </div>
           </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ColorToken = ({ name, value, variable, description }: { name: string; value: string; variable: string; description?: string }) => (
  <Card className="card-standard overflow-hidden border-none shadow-sm">
    <div className="h-20" style={{ backgroundColor: value }} />
    <CardContent className="p-3 bg-background">
      <p className="text-xs font-bold">{name}</p>
      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{variable}</p>
      {description && <p className="text-[10px] text-muted-foreground mt-2 italic">{description}</p>}
    </CardContent>
  </Card>
);

const RadiusToken = ({ name, value }: { name: string; value: string }) => (
  <div className="space-y-2">
    <div className="h-12 bg-primary/20 border-2 border-primary/40" style={{ borderRadius: `var(${value.replace('var(', '').replace(')', '')})` }} />
    <p className="text-[10px] font-bold text-center">{name}</p>
  </div>
);

const SpacingItem = ({ label, variable, width }: { label: string; variable: string; width: string }) => (
  <div className="flex items-center gap-4">
    <div className="w-20 text-[10px] font-bold uppercase text-muted-foreground">{label}</div>
    <div className={cn("h-4 bg-primary rounded-sm", width)} />
    <div className="text-[10px] font-mono text-muted-foreground">{variable}</div>
  </div>
);

export default DesignSystem;

