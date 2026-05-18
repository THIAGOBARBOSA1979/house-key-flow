# Arquitetura do Sistema A2

Este documento descreve os padrões arquiteturais e a organização do projeto para facilitar a manutenção e escalabilidade.

## 1. Organização de Pastas

O projeto segue uma estrutura modular baseada em responsabilidades:

- `src/components/`: Componentes de UI reutilizáveis.
  - `shared/`: Componentes globais (botões, inputs, badges).
  - `[Domain]/`: Componentes específicos de um domínio (ex: `Warranty/`, `Properties/`).
- `src/hooks/`: Custom hooks para encapsular lógica de estado e efeitos.
- `src/services/`: Camada de serviços para comunicação com APIs ou persistência local.
- `src/types/`: Definições de tipos TypeScript centralizadas por domínio.
- `src/utils/`: Funções utilitárias e formatadores globais.

## 2. Padrão de Services (Camada de Dados)

Todos os serviços devem herdar de `BaseService<T>` para garantir consistência em operações de CRUD e persistência.

### Exemplo:
```typescript
class MyDomainService extends BaseService<MyType> {
  constructor() {
    super("storage_key", initialData);
  }
  // Métodos específicos de negócio aqui
}
```

**Regras:**
- Serviços não devem gerenciar estado de UI (loading, erros de exibição).
- Regras de negócio complexas devem residir no serviço, não no componente.

## 3. Padrão de Custom Hooks (Camada de Lógica)

Hooks centralizam a lógica que seria repetida em múltiplas telas ou componentes complexos.

### Exemplo (`useWarranty.ts`):
Encapsula fetching, filtragem, atualização de status e estados de loading/error.

**Responsabilidades do Hook:**
- Gerenciar estados de `isLoading` e `error`.
- Chamar os serviços apropriados.
- Fornecer dados formatados ou filtrados para os componentes.

## 4. Design System e Tokens

- **Bordas:** Preferencialmente `rounded-2xl` para cards e diálogos grandes.
- **Tipografia:** Uso consistente de pesos `font-black` para títulos e `font-medium` para labels.
- **Formatadores:** Sempre use `src/utils/formatters.ts` para datas, moedas e porcentagens.

## 5. Fluxos de Trabalho (Workflows)

- **Garantias:** O fluxo é gerido pelo `WarrantyFlowService` com validações rigorosas de transição de status (definidas em `src/types/warrantyFlow.ts`).
- **Logs:** Todas as ações críticas devem ser registradas via `AuditLogService`.
