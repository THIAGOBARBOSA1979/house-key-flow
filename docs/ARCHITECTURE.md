# Arquitetura do Sistema A2

Este documento descreve os padrões de arquitetura e organização do projeto, visando garantir escalabilidade, manutenibilidade e clareza.

## 1. Estrutura de Pastas

```text
src/
├── components/     # Componentes React
│   ├── shared/     # Componentes genéricos reutilizáveis (DataTable, StatsCard, etc.)
│   ├── Layout/     # Componentes de estrutura (PageTemplate, Navigation)
│   ├── ui/         # Componentes base (Shadcn UI)
│   └── [Domain]/   # Componentes específicos de cada domínio (Properties, Users, etc.)
├── services/       # Camada de lógica de negócio e persistência
├── hooks/          # Hooks customizados (incluindo useService genérico)
├── types/          # Definições de tipos TypeScript centralizadas
├── utils/          # Funções utilitárias (formatadores, validadores)
├── pages/          # Componentes de página (rotas)
└── lib/            # Configurações de bibliotecas externas (Supabase, utils)
```

## 2. Camadas do Sistema

### 2.1 Services (`src/services/`)
Toda a lógica de manipulação de dados e regras de negócio deve residir em serviços que herdam de `BaseService`.
- **BaseService**: Provê métodos CRUD básicos e persistência automática.
- **Domínio**: Cada feature (ex: `PropertyService`) estende o `BaseService` para adicionar regras específicas.

### 2.2 Hooks (`src/hooks/`)
Utilizados para orquestrar o estado da UI e conectar os componentes aos serviços.
- **useService**: Hook genérico para gerenciar listas de dados, estados de carregamento e notificações automáticas.
- **Domain Hooks**: Hooks específicos (ex: `useProperties`) que utilizam `useService` e adicionam filtros ou métricas específicas.

### 2.3 Componentes (`src/components/`)
Divididos em componentes de UI puros (Shadcn), componentes compartilhados (Shared) e componentes de domínio.
- Devem ser focados em apresentação.
- Lógica complexa deve ser extraída para hooks.

## 3. Padrões de Código

### 3.1 Nomenclatura
- Componentes e Pastas: `PascalCase`
- Hooks: `useCamelCase`
- Serviços: `PascalCaseService`
- Tipos: `PascalCase`

### 3.2 Formatação e Tipagem
- Utilizar `Intl` via `src/utils/formatters.ts` para datas e moedas.
- Evitar o uso de `any`; definir interfaces claras em `src/types/`.

### 3.3 Layout de Página
Todas as páginas principais devem utilizar o componente `PageTemplate` para manter a consistência visual.

```tsx
<PageTemplate
  title="Título"
  description="Descrição"
  icon={LucideIcon}
  actions={<Button>Ação</Button>}
>
  {/* Conteúdo */}
</PageTemplate>
```

## 4. Fluxo de Dados

1. **Componente** chama um **Hook**.
2. **Hook** utiliza um **Service**.
3. **Service** manipula os dados (LocalStorage/Supabase) e emite logs via **AuditLogService**.
4. **Hook** atualiza o estado e o **Componente** renderiza a mudança.
