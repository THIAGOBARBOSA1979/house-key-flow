
import React, { useState } from 'react';
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
  BookOpen,
  Eye,
  Zap,
  Clock,
  Menu,
  MoreVertical,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Keyboard,
  Contrast,
  Command,
  Table as TableIcon
} from 'lucide-react';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/StatusBadge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DesignSystem = () => {

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
        title="Design System v2.0"
        description="Arquitetura robusta de Design Tokens e catálogo de componentes evoluídos para o ecossistema A2."
      >
        <div className="flex gap-2">
          <Badge variant="secondary" className="h-6">Alpha v2.0.0</Badge>
          <Button variant="outline" size="sm" className="h-9">
            <BookOpen className="w-4 h-4 mr-2" /> Documentação Técnica
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="guide" className="space-y-8">
        <TabsList className="bg-background/50 border w-full justify-start overflow-x-auto h-auto p-1 sticky top-0 z-sticky backdrop-blur-sm">
          <TabsTrigger value="guide" className="text-xs font-bold gap-2 py-2">
            <BookOpen className="w-3.5 h-3.5" /> Guia
          </TabsTrigger>
          <TabsTrigger value="tokens" className="text-xs font-bold gap-2 py-2">
            <Layers className="w-3.5 h-3.5" /> Tokens
          </TabsTrigger>
          <TabsTrigger value="components" className="text-xs font-bold gap-2 py-2">
            <Box className="w-3.5 h-3.5" /> Componentes
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="text-xs font-bold gap-2 py-2">
            <Accessibility className="w-3.5 h-3.5" /> Acessibilidade
          </TabsTrigger>
          <TabsTrigger value="playground" className="text-xs font-bold gap-2 py-2">
            <Zap className="w-3.5 h-3.5" /> Playground
          </TabsTrigger>
        </TabsList>

        {/* --- GUIDE CONTENT --- */}
        <TabsContent value="guide" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <section className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-h2">Arquitetura de Tokens</h2>
              <p className="text-body-base text-muted-foreground leading-relaxed">
                Nosso sistema é construído sobre uma base sólida de <strong>Design Tokens</strong>. 
                Cada token é uma variável semântica que permite escalabilidade, consistência e fácil manutenção. 
                Ao invés de usar valores fixos, usamos abstrações que podem ser alteradas globalmente.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="card-standard p-5">
                  <h4 className="text-label mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Do's
                  </h4>
                  <ul className="text-caption space-y-2 list-disc list-inside">
                    <li>Use utilitários semânticos (ex: <code>text-primary</code>)</li>
                    <li>Siga a hierarquia de grid (<code>grid-layout</code>)</li>
                    <li>Mantenha o espaçamento padrão (<code>gap-layout-gap</code>)</li>
                    <li>Use <code>card-standard</code> para containers</li>
                  </ul>
                </Card>
                <Card className="card-standard p-5">
                  <h4 className="text-label mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" /> Don'ts
                  </h4>
                  <ul className="text-caption space-y-2 list-disc list-inside text-muted-foreground">
                    <li>Não use valores hex/rgb no JSX</li>
                    <li>Evite classes arbitrárias (<code>m-[13px]</code>)</li>
                    <li>Não quebre a escala tipográfica</li>
                    <li>Não use z-index arbitrário</li>
                  </ul>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="card-standard border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-h4">Breakpoints</CardTitle>
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
        <TabsContent value="tokens" className="space-y-12 animate-in fade-in slide-in-from-bottom-2">
          {/* Shadows & Opacity */}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <OpacityItem name="Disabled" token="opacity-disabled" value="0.4" />
              <OpacityItem name="Muted" token="opacity-muted" value="0.6" />
              <OpacityItem name="Hover" token="opacity-hover" value="0.9" />
              <OpacityItem name="Full" token="opacity-full" value="1.0" />
            </div>
          </section>

          {/* Z-Index Hierarchy */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Hierarquia Z-Index</h2>
            </div>
            <div className="bg-card border rounded-xl p-6 space-y-4">
              <ZIndexItem label="Tooltip" value="1060" className="z-tooltip" color="bg-rose-500" />
              <ZIndexItem label="Popover" value="1050" className="z-popover" color="bg-amber-500" />
              <ZIndexItem label="Modal" value="1040" className="z-modal" color="bg-emerald-500" />
              <ZIndexItem label="Fixed" value="1030" className="z-fixed" color="bg-blue-500" />
              <ZIndexItem label="Sticky" value="1020" className="z-sticky" color="bg-indigo-500" />
              <ZIndexItem label="Dropdown" value="1000" className="z-dropdown" color="bg-purple-500" />
            </div>
          </section>

          {/* Animations */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Animações & Easing</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimationCard name="Fade In" animation="animate-fade-in" duration="400ms" />
              <AnimationCard name="Slide Up" animation="animate-slide-up" duration="400ms" />
              <AnimationCard name="Pulse (Loading)" animation="animate-pulse" duration="2s" />
            </div>
          </section>

          {/* Typography */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Type className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Escala Tipográfica</h2>
            </div>
            <div className="bg-card border rounded-xl overflow-hidden divide-y">
              <TypographyItem label="Display" className="text-sem-display" size="60px / 3.75rem" />
              <TypographyItem label="Heading 1" className="text-sem-h1" size="40px / 2.5rem" />
              <TypographyItem label="Heading 2" className="text-sem-h2" size="32px / 2rem" />
              <TypographyItem label="Heading 3" className="text-sem-h3" size="24px / 1.5rem" />
              <TypographyItem label="Body Large" className="text-sem-body-lg" size="18px / 1.125rem" />
              <TypographyItem label="Body Base" className="text-sem-body-base" size="16px / 1rem" />
              <TypographyItem label="Caption" className="text-sem-caption uppercase" size="12px / 0.75rem" />
            </div>
          </section>
        </TabsContent>

        {/* --- ACCESSIBILITY CONTENT --- */}
        <TabsContent value="accessibility" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Accessibility className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Diretrizes WCAG</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <A11yCard 
                icon={Contrast} 
                title="Contraste" 
                desc="Garantimos contraste mínimo de 4.5:1 para texto normal e 3:1 para texto grande em ambos os temas." 
              />
              <A11yCard 
                icon={Keyboard} 
                title="Teclado" 
                desc="Navegação completa via Tab, Enter e Space. Todos os componentes interativos possuem focus-visible." 
              />
              <A11yCard 
                icon={ShieldCheck} 
                title="Semântica" 
                desc="Uso rigoroso de tags HTML5 (main, section, nav) e atributos ARIA para leitores de tela." 
              />
            </div>

            <Card className="card-standard">
              <CardHeader>
                <CardTitle className="text-h4">Focus Ring Global</CardTitle>
                <CardDescription>Nosso anel de foco é padronizado para garantir visibilidade em qualquer contexto.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button variant="outline" className="focus-ring ring-2 ring-ring ring-offset-2">Foco Forçado</Button>
                  <code className="bg-muted p-2 rounded text-xs flex-1">
                    .focus-ring {'{'} @apply focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2; {'}'}
                  </code>
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        {/* --- PLAYGROUND CONTENT --- */}
        <TabsContent value="playground" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <h2 className="text-h2">Sandbox Interativo</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="p-disabled" 
                    checked={playgroundState.disabled} 
                    onCheckedChange={(val) => setPlaygroundState(s => ({...s, disabled: val}))} 
                  />
                  <Label htmlFor="p-disabled" className="text-xs">Disabled</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="p-loading" 
                    checked={playgroundState.loading} 
                    onCheckedChange={(val) => setPlaygroundState(s => ({...s, loading: val}))} 
                  />
                  <Label htmlFor="p-loading" className="text-xs">Loading</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Buttons Playground */}
              <Card className="card-standard">
                <CardHeader>
                  <CardTitle className="text-h4">Botões & Estados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-4">
                    <Button disabled={playgroundState.disabled} className={playgroundState.loading ? 'animate-pulse' : ''}>
                      {playgroundState.loading ? 'Processando...' : 'Primário'}
                    </Button>
                    <Button variant="secondary" disabled={playgroundState.disabled}>Secundário</Button>
                    <Button variant="outline" disabled={playgroundState.disabled}>Outline</Button>
                    <Button variant="ghost" disabled={playgroundState.disabled}>Ghost</Button>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline"><Plus className="w-4 h-4"/></Button>
                    <Button size="sm">Small Button</Button>
                    <Button size="lg">Large Button <ArrowRight className="ml-2 w-4 h-4"/></Button>
                  </div>
                </CardContent>
              </Card>

              {/* Form Playground */}
              <Card className="card-standard">
                <CardHeader>
                  <CardTitle className="text-h4">Formulários</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-label">Input Padrão</Label>
                    <Input placeholder="Digite algo..." disabled={playgroundState.disabled} />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch disabled={playgroundState.disabled} id="sw1" />
                      <Label htmlFor="sw1">Ativo</Label>
                    </div>
                    <Badge variant="outline" className="h-6">Filtro Ativo</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Feedback Playground */}
              <Card className="card-standard">
                <CardHeader>
                  <CardTitle className="text-h4">Feedback Visual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <StatusBadge status="complete" />
                    <StatusBadge status="progress" />
                    <StatusBadge status="pending" />
                    <StatusBadge status="critical" />
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm">Hover para Tooltip</Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Exemplo de feedback de contexto</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>

              {/* Navigation Playground */}
              <Card className="card-standard">
                <CardHeader>
                  <CardTitle className="text-h4">Navegação & Menus</CardTitle>
                </CardHeader>
                <CardContent>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">Ações <MoreVertical className="ml-2 w-4 h-4"/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Perfil</DropdownMenuItem>
                      <DropdownMenuItem>Configurações</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Sair</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const BreakpointItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-md text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-body-sm font-semibold">{label}</span>
    </div>
    <code className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded">{value}</code>
  </div>
);

const ShadowItem = ({ name, token }: { name: string; token: string }) => (
  <div className="space-y-3">
    <div className={cn("h-24 bg-card border rounded-xl flex items-center justify-center transition-all hover:-translate-y-1", token)}>
      <span className="text-tiny font-bold text-muted-foreground uppercase">{name}</span>
    </div>
    <code className="text-[10px] bg-muted p-1 block text-center">.{token}</code>
  </div>
);

const OpacityItem = ({ name, token, value }: { name: string; token: string; value: string }) => (
  <div className="space-y-2">
    <div className="h-12 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold text-xs" style={{ opacity: value }}>
      {value}
    </div>
    <div className="text-center">
      <p className="text-tiny font-bold uppercase">{name}</p>
      <code className="text-[10px] text-muted-foreground">.{token}</code>
    </div>
  </div>
);

const ZIndexItem = ({ label, value, className, color }: { label: string; value: string; className: string; color: string }) => (
  <div className="flex items-center gap-4 group">
    <div className="w-24 text-tiny font-bold uppercase text-muted-foreground">{label}</div>
    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
      <div className={cn("h-full transition-all duration-500 group-hover:scale-x-105 origin-left", color)} style={{ width: `${(parseInt(value) / 1060) * 100}%` }} />
    </div>
    <div className="w-16 text-right">
      <code className="text-[10px] bg-muted px-2 py-0.5 rounded">{value}</code>
    </div>
  </div>
);

const AnimationCard = ({ name, animation, duration }: { name: string; animation: string; duration: string }) => {
  const [key, setKey] = useState(0);
  return (
    <Card className="card-standard p-6 flex flex-col items-center justify-between gap-4">
      <div key={key} className={cn("w-12 h-12 bg-primary rounded-lg shadow-sem-md", animation)} />
      <div className="text-center">
        <p className="text-label">{name}</p>
        <p className="text-caption text-muted-foreground">{duration}</p>
      </div>
      <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => setKey(k => k + 1)}>
        <Activity className="w-3 h-3 mr-1" /> Replay
      </Button>
    </Card>
  );
};

const TypographyItem = ({ label, className, size }: { label: string; className: string; size: string }) => (
  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
    <div className="space-y-1">
      <p className="text-tiny font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={cn(className, "truncate")}>O rato roeu a roupa do rei.</p>
    </div>
    <div className="flex items-center gap-3">
      <code className="text-[10px] bg-muted px-2 py-1 rounded">.{className}</code>
      <span className="text-[10px] text-muted-foreground font-mono">{size}</span>
    </div>
  </div>
);

const A11yCard = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <Card className="card-standard border-t-4 border-t-primary/40">
    <CardHeader className="pb-2">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
        <Icon className="w-4 h-4" />
      </div>
      <CardTitle className="text-label">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-caption text-muted-foreground leading-relaxed">{desc}</p>
    </CardContent>
  </Card>
);

export default DesignSystem;
