
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
  BookOpen
} from 'lucide-react';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

/**
 * Design System Documentation Page
 * Centralizes all visual tokens, components and usage guidelines.
 */
const DesignSystem = () => {
  return (
    <div className="container-responsive py-8 space-y-10 animate-fade-in">
      <PageHeader
        icon={Layout}
        title="Design System"
        description="Diretrizes visuais, tokens e catálogo de componentes reutilizáveis para o ecossistema A2."
      >
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <BookOpen className="w-4 h-4 mr-2" /> Documentação
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="guide" className="space-y-8">
        <TabsList className="bg-background/50 border w-full justify-start overflow-x-auto h-auto p-1">
          <TabsTrigger value="guide" className="text-xs font-bold gap-2 py-2">
            <BookOpen className="w-3.5 h-3.5" /> Guia de Uso
          </TabsTrigger>
          <TabsTrigger value="tokens" className="text-xs font-bold gap-2 py-2">
            <Layers className="w-3.5 h-3.5" /> Design Tokens
          </TabsTrigger>
          <TabsTrigger value="components" className="text-xs font-bold gap-2 py-2">
            <Box className="w-3.5 h-3.5" /> Componentes
          </TabsTrigger>
          <TabsTrigger value="layout" className="text-xs font-bold gap-2 py-2">
            <Grid className="w-3.5 h-3.5" /> Layout & Grid
          </TabsTrigger>
        </TabsList>

        {/* --- GUIDE CONTENT --- */}
        <TabsContent value="guide" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <section className="prose dark:prose-invert max-w-none">
            <h2 className="text-h2">Como usar os Tokens Semânticos</h2>
            <p className="text-body-base text-muted-foreground">
              Nosso sistema utiliza tokens semânticos para garantir que a intenção do design seja preservada 
              independente do tema ou da plataforma. Nunca utilize valores hex/rgb fixos ou classes arbitrárias 
              do Tailwind (ex: <code>text-[#333]</code>) se houver um token correspondente.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Card className="card-standard">
                <CardHeader>
                  <CardTitle className="text-h4">Convenção de Nomes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-primary/10 rounded text-primary font-mono text-[10px]">text-h*</div>
                    <div className="text-body-sm">Usado para títulos hierárquicos (h1 a h4).</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-primary/10 rounded text-primary font-mono text-[10px]">text-body-*</div>
                    <div className="text-body-sm">Usado para textos corridos (lg, base, sm).</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-primary/10 rounded text-primary font-mono text-[10px]">text-label</div>
                    <div className="text-body-sm">Usado para rótulos de formulário ou textos curtos e enfáticos.</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-primary/10 rounded text-primary font-mono text-[10px]">container-*</div>
                    <div className="text-body-sm">Utilidades para grids e containers responsivos.</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-standard border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-h4">Boas Práticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ul className="list-disc list-inside text-body-sm space-y-2">
                    <li>Use <strong>text-h1</strong> apenas uma vez por página.</li>
                    <li>Prefira <strong>gap-layout-gap</strong> para grids de conteúdo.</li>
                    <li>Utilize <strong>card-standard</strong> para todos os containers de conteúdo.</li>
                    <li>Sempre valide o contraste no tema <strong>Escuro</strong>.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>

        {/* --- TOKENS CONTENT --- */}
        <TabsContent value="tokens" className="space-y-12 animate-in fade-in slide-in-from-bottom-2">
          {/* Colors */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Cores & Status</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ColorToken name="Primary (Brand)" value="hsl(var(--primary))" variable="--primary" description="Cor principal de ação." />
              <ColorToken name="Background" value="hsl(var(--background))" variable="--background" description="Fundo da aplicação." />
              <ColorToken name="Muted" value="hsl(var(--muted))" variable="--muted" description="Textos secundários." />
              <ColorToken name="Brand Gradient" value="linear-gradient(to right, hsl(var(--brand)), #4f46e5)" variable="from-brand to-indigo-600" />
            </div>
          </section>

          {/* Typography Scale */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Type className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Tipografia</h2>
            </div>
            <div className="space-y-6 bg-card border rounded-xl p-8">
              <div className="space-y-1">
                <p className="text-tiny uppercase font-bold text-muted-foreground">Display Hero</p>
                <p className="text-display">Gestão de Excelência</p>
                <code className="text-[10px] bg-muted px-1">.text-display</code>
              </div>
              <div className="space-y-1">
                <p className="text-tiny uppercase font-bold text-muted-foreground">Heading 1</p>
                <p className="text-h1">Título de Seção Principal</p>
                <code className="text-[10px] bg-muted px-1">.text-h1</code>
              </div>
              <div className="space-y-1">
                <p className="text-tiny uppercase font-bold text-muted-foreground">Heading 3</p>
                <p className="text-h3">Título de Bloco ou Card</p>
                <code className="text-[10px] bg-muted px-1">.text-h3</code>
              </div>
              <div className="space-y-1">
                <p className="text-tiny uppercase font-bold text-muted-foreground">Body Base</p>
                <p className="text-body-base">Texto padrão para parágrafos e descrições longas com excelente legibilidade.</p>
                <code className="text-[10px] bg-muted px-1">.text-body-base</code>
              </div>
            </div>
          </section>
        </TabsContent>

        {/* --- COMPONENTS CONTENT --- */}
        <TabsContent value="components" className="space-y-12 animate-in fade-in slide-in-from-bottom-2">
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Box className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Componentes de Status</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-3 p-4 border rounded-lg bg-background/50">
                <p className="text-label">Pendente</p>
                <StatusBadge status="pending" />
              </div>
              <div className="space-y-3 p-4 border rounded-lg bg-background/50">
                <p className="text-label">Em Progresso</p>
                <StatusBadge status="progress" />
              </div>
              <div className="space-y-3 p-4 border rounded-lg bg-background/50">
                <p className="text-label">Concluído</p>
                <StatusBadge status="complete" />
              </div>
              <div className="space-y-3 p-4 border rounded-lg bg-background/50">
                <p className="text-label">Crítico</p>
                <StatusBadge status="critical" />
              </div>
            </div>
          </section>
        </TabsContent>

        {/* --- LAYOUT CONTENT --- */}
        <TabsContent value="layout" className="space-y-12 animate-in fade-in slide-in-from-bottom-2">
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Grid className="w-5 h-5 text-primary" />
              <h2 className="text-h2">Grid & Espaçamento</h2>
            </div>
            <Card className="card-standard">
              <CardContent className="p-6">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className="text-label">Container Responsivo (<code>.container-responsive</code>)</p>
                    <div className="h-10 bg-primary/10 border-2 border-dashed border-primary/30 rounded flex items-center justify-center text-tiny font-bold text-primary">
                      MAX WIDTH: 1280px + PADDING RESPONSIVO
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-label">Grid de Conteúdo (<code>.grid-layout</code>)</p>
                    <div className="grid grid-cols-4 gap-4">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-16 bg-muted/50 rounded border flex items-center justify-center text-tiny">Coluna {i}</div>
                      ))}
                    </div>
                    <p className="text-caption mt-2">Utiliza <code>gap-layout-gap</code> (1.5rem) por padrão.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ColorToken = ({ name, value, variable, description }: { name: string; value: string; variable: string; description?: string }) => (
  <Card className="card-standard overflow-hidden border-none shadow-sm">
    <div className="h-20" style={{ background: value }} />
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
