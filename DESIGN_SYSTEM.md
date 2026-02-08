# A2 Incorporadora - Design System

Este documento define os padrões visuais e componentes do sistema de gestão imobiliária.

---

## 1. TIPOGRAFIA

### Hierarquia de Títulos

| Elemento | Classes | Uso |
|----------|---------|-----|
| H1 (Página) | `text-3xl font-bold tracking-tight` | Título principal de cada página |
| H2 (Seção) | `text-xl font-semibold` | Cabeçalho de seções |
| H3 (Card) | `text-lg font-medium` | Título de cards |
| H4 (Subseção) | `text-base font-medium` | Subtítulos |
| Body | `text-sm` | Texto padrão (14px) |
| Caption | `text-xs text-muted-foreground` | Textos auxiliares |

### Espaçamentos de Texto
- Entre título e descrição: `mt-1`
- Entre seções: `space-y-6` ou `space-y-8`
- Dentro de cards: `space-y-4`
- Entre itens de lista: `space-y-2` ou `space-y-3`

---

## 2. CORES

### Cores Primárias (CSS Variables)
```css
--primary: 221 83% 53%;        /* Azul principal */
--primary-foreground: 210 40% 98%;
```

### Cores de Status (Workflow)
| Status | Background | Text | Border |
|--------|------------|------|--------|
| Pendente | `bg-amber-100` | `text-amber-700` | `border-amber-200` |
| Em Progresso | `bg-blue-100` | `text-blue-700` | `border-blue-200` |
| Concluído | `bg-emerald-100` | `text-emerald-700` | `border-emerald-200` |
| Crítico | `bg-red-100` | `text-red-700` | `border-red-200` |

### Cores Semânticas
| Tipo | Background | Text | Border |
|------|------------|------|--------|
| Sucesso | `bg-emerald-100` | `text-emerald-700` | `border-emerald-200` |
| Alerta | `bg-amber-100` | `text-amber-700` | `border-amber-200` |
| Erro | `bg-red-100` | `text-red-700` | `border-red-200` |
| Info | `bg-blue-100` | `text-blue-700` | `border-blue-200` |
| Neutro | `bg-slate-100` | `text-slate-700` | `border-slate-200` |

---

## 3. ESPAÇAMENTOS E GRID

### Escala de Espaçamento
| Token | Valor | Classes |
|-------|-------|---------|
| xs | 4px | `gap-1`, `p-1` |
| sm | 8px | `gap-2`, `p-2` |
| md | 16px | `gap-4`, `p-4` |
| lg | 24px | `gap-6`, `p-6` |
| xl | 32px | `gap-8`, `p-8` |

### Grids Padrão
- **Dashboard Cards**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- **Listagem**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Formulários**: `max-w-2xl mx-auto`

### Containers
- Página principal: `max-w-7xl mx-auto`
- Dialog pequeno: `sm:max-w-[425px]`
- Dialog médio: `sm:max-w-[600px]`
- Dialog grande: `max-w-3xl`

---

## 4. COMPONENTES

### Botões

| Variante | Classe | Uso |
|----------|--------|-----|
| Primário | `Button` (default) | Salvar, Confirmar, Criar |
| Secundário | `Button variant="outline"` | Cancelar, Voltar |
| Terciário | `Button variant="ghost"` | Ações inline, links |
| Destrutivo | `Button variant="destructive"` | Excluir, Remover |

**Tamanhos:**
- Default: `h-10` (40px)
- Small: `size="sm"` (36px) - tabelas, inline
- Large: `size="lg"` (44px) - CTAs
- Icon: `size="icon"` (40x40)

### Cards

**Card Padrão:**
```tsx
<Card className="transition-shadow hover:shadow-md">
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
</Card>
```

**Card Interativo:**
```tsx
<Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/30">
```

**Card Hero/Destaque:**
```tsx
<Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
```

### StatusBadge

Usar o componente `StatusBadge` para todos os indicadores de status:

```tsx
import { StatusBadge } from "@/components/shared/StatusBadge";

<StatusBadge status="pending" />
<StatusBadge status="progress" label="Em Andamento" />
<StatusBadge status="complete" />
<StatusBadge status="critical" />
```

### Formulários

```tsx
<div className="space-y-4">
  <div>
    <Label className="text-sm font-medium">Campo</Label>
    <Input className="h-10" />
  </div>
</div>

{/* Botões de ação */}
<div className="flex justify-end gap-2">
  <Button variant="outline">Cancelar</Button>
  <Button>Confirmar</Button>
</div>
```

---

## 5. LAYOUT DE PÁGINA

### PageHeader
Usar em todas as páginas para título e ações:

```tsx
import { PageHeader } from "@/components/Layout/PageHeader";

<PageHeader 
  icon={Building}
  title="Empreendimentos"
  description="Gerenciamento de todos os empreendimentos"
>
  <Button>Nova Ação</Button>
</PageHeader>
```

### FilterBar
Usar para filtros e busca:

```tsx
import { FilterBar } from "@/components/Layout/FilterBar";

<FilterBar 
  searchPlaceholder="Buscar..."
  searchValue={search}
  onSearchChange={setSearch}
>
  <Select>...</Select>
  <Button variant="outline">Filtros</Button>
</FilterBar>
```

### Estrutura Padrão de Página

```tsx
<div className="space-y-6">
  <PageHeader ... />
  <FilterBar ... />
  <div className="grid ...">
    {/* Conteúdo */}
  </div>
</div>
```

---

## 6. FEEDBACKS VISUAIS

### Estados de Loading
```tsx
// Spinner
<div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />

// Skeleton
<Skeleton className="h-4 w-full" />
```

### Estados de Hover
- Botões: `hover:bg-primary/90`
- Cards: `hover:shadow-md`
- Links: `hover:underline`
- Tabelas: `hover:bg-muted/50`

### Notificações (Toast)
```tsx
toast({ title: "Sucesso", description: "Ação realizada" });
toast({ title: "Erro", variant: "destructive" });
```

---

## 7. ÍCONES

**Biblioteca:** Lucide React

### Tamanhos Padrão
| Contexto | Tamanho | Classes |
|----------|---------|---------|
| Inline com texto | 16px | `h-4 w-4` |
| Cards/Botões | 20px | `h-5 w-5` |
| Headers | 24-32px | `h-6 w-6` ou `h-8 w-8` |
| Ilustrações | 48px+ | `h-12 w-12` |

### Posicionamento
- Antes do texto: `gap-2` ou `mr-2`
- Sozinho: `flex items-center justify-center`

---

## 8. RESPONSIVIDADE

### Breakpoints
| Nome | Largura | Uso |
|------|---------|-----|
| Mobile | < 640px | `sm:` |
| Tablet | 640-1024px | `md:` |
| Desktop | > 1024px | `lg:` |

### Comportamentos
- **Mobile**: Stats em 2 colunas, sidebar oculto (Sheet)
- **Tablet**: Sidebar colapsado (icons only), grids em 2 colunas
- **Desktop**: Layout completo

---

## 9. SIDEBAR (Admin)

### Grupos de Menu

**OPERACIONAL** (uso diário):
- Dashboard
- Agendamentos
- Vistorias
- Garantias

**GESTÃO** (uso semanal):
- Empreendimentos
- Área do Cliente
- Documentos
- Usuários

**SISTEMA** (uso mensal):
- Checklists
- Configurações
