
# Plano: Nova Solicitação de Garantia com Validação de Itens Elegíveis

## Resumo

Implementar a funcionalidade "Nova Solicitação de Garantia" no painel do cliente, permitindo apenas solicitações para itens com garantia ativa. O sistema validará datas de início/fim da garantia e status, exibindo itens inelegíveis como desabilitados.

## O Que Será Criado

### 1. Estrutura de Dados

**Novos tipos e interfaces:**
- `WarrantyItem` - Item coberto por garantia com campos de validação
- `WarrantyRequest` - Solicitação de garantia vinculada a um item
- `WarrantyStatus` - Status da garantia (ativa, expirada, cancelada)

**Campos de validação:**
- `data_inicio_garantia` - Data de início da cobertura
- `data_fim_garantia` - Data de término da cobertura
- `status_garantia` - Status atual (ativa/expirada/cancelada)
- `client_id` - Vinculação com o cliente autenticado

### 2. Interface do Cliente

**Novo formulário de solicitação:**
- Seletor de item com garantia ativa
- Itens expirados aparecem desabilitados com badge "Garantia expirada"
- Mensagem informativa quando não há itens elegíveis
- Validação em tempo real da elegibilidade

**Melhorias visuais:**
- Cards de itens com indicador de status da garantia
- Barra de progresso mostrando tempo restante de garantia
- Ícones diferenciados por categoria de item
- Destaque visual para itens próximos do vencimento

### 3. Serviço de Garantia

**Funções principais:**
- `getEligibleWarrantyItems()` - Retorna apenas itens elegíveis
- `validateWarrantyItem()` - Valida se item pode gerar solicitação
- `createWarrantyRequest()` - Cria solicitação com validação completa
- `getWarrantyItemsByClient()` - Lista itens do cliente autenticado

**Validações implementadas:**
- Data atual entre início e fim da garantia
- Status da garantia igual a "ativa"
- Item pertence ao cliente autenticado
- Categoria do problema compatível com tipo de garantia

### 4. Componentes Criados/Modificados

| Componente | Ação | Descrição |
|------------|------|-----------|
| `WarrantyItemSelector.tsx` | Criar | Seletor de itens com filtro de elegibilidade |
| `WarrantyItemCard.tsx` | Criar | Card de item com status visual |
| `WarrantyEligibilityBadge.tsx` | Criar | Badge de status da garantia |
| `WarrantyService.ts` | Criar | Serviço de validação e criação |
| `warranty.types.ts` | Criar | Tipos TypeScript para garantia |
| `client/Warranty.tsx` | Modificar | Integrar novo fluxo de solicitação |
| `EnhancedWarrantyRequestForm.tsx` | Modificar | Adicionar seleção de item |

## Arquitetura da Solução

```text
+------------------+     +-------------------+     +------------------+
|                  |     |                   |     |                  |
|  WarrantyItem    |---->|  WarrantyService  |---->|  WarrantyRequest |
|   Selector       |     |   (validacao)     |     |    Form          |
|                  |     |                   |     |                  |
+------------------+     +-------------------+     +------------------+
        |                        |                        |
        v                        v                        v
+------------------+     +-------------------+     +------------------+
|  Mock Data       |     |  Validacoes:      |     |  Submit com      |
|  (itens garantia)|     |  - Data ativa     |     |  item_id         |
|                  |     |  - Status ativa   |     |  validado        |
|                  |     |  - Client match   |     |                  |
+------------------+     +-------------------+     +------------------+
```

## Fluxo do Usuário

1. Cliente clica em "Nova Solicitação"
2. Sistema carrega itens do cliente
3. Exibe lista com itens elegíveis habilitados
4. Itens com garantia expirada aparecem desabilitados
5. Se não há itens elegíveis, mostra mensagem informativa
6. Cliente seleciona item e preenche formulário
7. Sistema valida antes de submeter
8. Solicitação criada ou erro retornado

## Dados Mock (Simulação)

```text
Itens com garantia para demonstracao:

1. Instalacoes Hidrraulicas
   - Inicio: 15/04/2025
   - Fim: 15/04/2027
   - Status: ativa
   - Elegivel: SIM

2. Impermeabilizacao
   - Inicio: 15/04/2025
   - Fim: 15/04/2028
   - Status: ativa
   - Elegivel: SIM

3. Revestimentos Ceramicos
   - Inicio: 15/04/2024
   - Fim: 15/04/2025
   - Status: expirada
   - Elegivel: NAO (expirado)

4. Esquadrias
   - Inicio: 15/04/2025
   - Fim: 15/04/2026
   - Status: cancelada
   - Elegivel: NAO (cancelado)
```

## Mensagens de Erro Padronizadas

| Situacao | Mensagem |
|----------|----------|
| Sem itens elegiveis | "Voce nao possui itens com garantia ativa no momento." |
| Garantia expirada | "Este item nao possui garantia ativa e nao pode gerar uma solicitacao." |
| Item nao pertence ao cliente | "Este item nao esta vinculado a sua conta." |
| Dados invalidos | "Por favor, preencha todos os campos obrigatorios." |

## Arquivos a Serem Criados

1. `src/types/warranty.ts` - Tipos e interfaces
2. `src/services/WarrantyService.ts` - Logica de validacao
3. `src/components/Warranty/WarrantyItemSelector.tsx` - Seletor de itens
4. `src/components/Warranty/WarrantyItemCard.tsx` - Card de item
5. `src/components/Warranty/WarrantyEligibilityBadge.tsx` - Badge de status

## Arquivos a Serem Modificados

1. `src/pages/client/Warranty.tsx` - Novo fluxo de solicitacao
2. `src/components/Warranty/EnhancedWarrantyRequestForm.tsx` - Integracao com seletor

## Detalhes Tecnicos

### Validacao de Elegibilidade

```text
funcao isWarrantyActive(item):
  dataAtual = hoje()
  
  se item.status_garantia != "ativa":
    retorna falso
    
  se dataAtual < item.data_inicio_garantia:
    retorna falso
    
  se dataAtual > item.data_fim_garantia:
    retorna falso
    
  retorna verdadeiro
```

### Estrutura do Erro Padronizado

```text
{
  "error": "Este item nao possui garantia ativa e nao pode gerar uma solicitacao.",
  "code": "WARRANTY_INACTIVE",
  "details": {
    "item_id": "xxx",
    "reason": "expired" | "cancelled" | "not_started" | "not_owned"
  }
}
```

## Consideracoes de Seguranca

- Validacao dupla: frontend desabilita itens, backend valida novamente
- Verificacao de propriedade do item antes de criar solicitacao
- IDs de itens nao editaveis pelo usuario no formulario
- Logs de tentativas de criacao invalidas

## Proximos Passos Apos Implementacao

1. Integrar com Supabase/Lovable Cloud para persistencia real
2. Adicionar notificacoes por email para solicitacoes criadas
3. Implementar historico de solicitacoes por item
4. Dashboard administrativo para gestao de garantias
