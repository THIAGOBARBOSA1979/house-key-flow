# Arquitetura do Projeto A2

Esta documentação descreve os padrões arquiteturais e a organização do código do projeto.

## Estrutura de Pastas

- `src/components`: Componentes React organizados por domínio (e.g., `Warranty`, `Properties`, `Users`).
- `src/services`: Camada de serviços para lógica de negócio e integração com API/Supabase.
- `src/hooks`: Hooks customizados para gerenciamento de estado e lógica de UI.
- `src/types`: Definições de tipos TypeScript.
- `src/utils`: Funções utilitárias e formatadores.
- `src/contexts`: Contextos do React para estado global (e.g., Autenticação).

## Camada de Serviços (Services)

Todos os serviços de domínio devem herdar de `BaseService` para manter padrões de CRUD consistentes.

### Exemplo
```typescript
class MyService extends BaseService<MyType> {
  constructor() {
    super("storage_key", INITIAL_DATA);
  }
  // Lógica específica aqui
}
```

## Camada de Hooks

Os hooks customizados são responsáveis por:
- Buscar dados dos serviços.
- Gerenciar estados locais da página.
- Filtragem e ordenação.
- Notificações de feedback (Toasts).

### Hook useWarranty
Centraliza toda a lógica de garantias, incluindo tratamento de erros e estados de carregamento.

## Padrões de Código

- **Formatadores**: Use sempre `src/utils/formatters.ts` para datas e moedas.
- **Componentes Compartilhados**: Utilize `DataView`, `PageHeader` e `StatsCard` para manter a consistência visual.
- **Tipagem**: Evite o uso de `any`. Utilize os tipos definidos em `src/types`.

## Fluxo de Trabalho de Garantias

O fluxo de garantias segue estágios bem definidos (`opened` -> `in_analysis` -> `inspection_scheduled` -> etc.).
As transições de status são validadas pelo `WarrantyFlowService`.
