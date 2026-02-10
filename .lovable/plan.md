
# Plano: Finalizacao do Modulo de Garantias e Vistorias

## Resumo

Implementar as funcionalidades faltantes para tornar o modulo de Garantias e Vistorias completo e pronto para producao: aceite/recusa de vistoria pelo cliente, logs de rastreabilidade, e correcoes de UX/integracao entre os fluxos.

---

## Diagnostico Atual

### O que ja esta implementado:
- Timeline visual para cliente (WarrantyRequestTimeline)
- Kanban administrativo com drag-and-drop
- SLA configuravel por tipo de garantia
- Dashboard de metricas
- Servicos de fluxo (WarrantyFlowService, WarrantySLAService, WarrantyAutomationService)
- Checklist de vistoria com marcacao conforme/nao-conforme (StartInspection)
- Feature gating por estagio do cliente

### O que esta faltando:
1. **Aceite de Vistoria pelo Cliente** - Nao existe mecanismo para o cliente aceitar ou recusar a vistoria apos conclusao
2. **Logs de Rastreabilidade** - O WarrantyFlowService registra historico, mas nao existe um servico unificado de audit log nem visualizacao desses logs
3. **Integracao vistoria-garantia** - A conclusao da vistoria no painel do cliente nao conecta com o fluxo de garantia automatizado
4. **Feedback visual nas acoes do cliente** - Botoes como "Cancelar solicitacao", "Adicionar informacoes", "Enviar comentario" nao tem acao implementada

---

## ETAPA 1: Servico de Audit Log

### Novo arquivo: `src/services/AuditLogService.ts`

Criar servico centralizado de rastreabilidade:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | string | ID unico do log |
| entityType | string | 'inspection' ou 'warranty' |
| entityId | string | ID da entidade |
| action | string | Acao realizada (created, updated, accepted, rejected, etc.) |
| performedBy | string | ID do usuario |
| performedByName | string | Nome do usuario |
| performedByRole | string | 'admin' ou 'client' |
| timestamp | Date | Data/hora da acao |
| details | string | Descricao da acao |
| metadata | object | Dados adicionais (campo alterado, valor anterior, etc.) |

Metodos principais:
- `log(entry)` - Registra nova entrada
- `getLogsByEntity(entityType, entityId)` - Logs por entidade
- `getLogsByUser(userId)` - Logs por usuario
- `getLogsByDateRange(from, to)` - Logs por periodo
- `getRecentLogs(limit)` - Logs recentes

Dados mock iniciais com acoes pre-registradas para as vistorias e garantias existentes.

---

## ETAPA 2: Aceite de Vistoria pelo Cliente

### Novo tipo: `InspectionAcceptance` em `src/types/clientFlow.ts`

Adicionar ao arquivo existente:

```text
InspectionAcceptanceStatus = 'pending_acceptance' | 'accepted' | 'rejected'

InspectionAcceptance = {
  inspectionId: string
  clientId: string
  status: InspectionAcceptanceStatus
  acceptedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
  registeredBy: string
}
```

### Novo componente: `src/components/Inspection/InspectionAcceptance.tsx`

Componente de aceite/recusa com:
- Resumo visual da vistoria concluida (itens conformes vs nao-conformes)
- Botao "Aceitar Vistoria" com dialog de confirmacao
- Botao "Recusar Vistoria" com campo obrigatorio de motivo
- Indicador visual do status de aceite (aceito/recusado/pendente)
- Registro de data, hora e responsavel
- Toast de confirmacao apos cada acao

### Modificacao: `src/pages/client/Inspections.tsx`

Na aba "Detalhes" de uma vistoria com status "complete":
- Mostrar o componente InspectionAcceptance
- Se vistoria aceita: mostrar banner verde "Vistoria aceita em DD/MM/YYYY as HH:MM"
- Se vistoria recusada: mostrar banner vermelho com motivo
- Se pendente de aceite: mostrar os botoes de acao

### Modificacao: `src/services/EventAutomationService.ts`

Adicionar novos metodos:
- `onInspectionAccepted(inspectionId, clientId)` - Dispara automacao de aceite
  - Registra evento no historico
  - Avanca estagio do cliente para 'warranty_enabled'
  - Cria notificacao de garantia liberada
  - Registra log de auditoria
- `onInspectionRejected(inspectionId, clientId, reason)` - Dispara automacao de recusa
  - Registra evento no historico
  - Mantem estagio atual
  - Cria notificacao de pendencia
  - Registra log de auditoria

---

## ETAPA 3: Integracao Vistoria-Garantia

### Modificacao: `src/pages/client/Inspections.tsx`

Quando o cliente aceita a vistoria:
1. Chamar `eventAutomationService.onInspectionAccepted()`
2. O servico automaticamente libera o modulo de garantias
3. Toast informando: "Vistoria aceita. O modulo de garantias foi liberado."

Quando o cliente recusa a vistoria:
1. Chamar `eventAutomationService.onInspectionRejected()`
2. Toast informando: "Vistoria recusada. Nossa equipe entrara em contato."

### Modificacao nos mock data de `src/pages/client/Inspections.tsx`

Adicionar campo `acceptanceStatus` aos mocks de vistoria:
- Vistoria "complete" (id: 3) recebe `acceptanceStatus: 'pending_acceptance'` para demonstrar o fluxo

---

## ETAPA 4: Visualizacao de Logs de Auditoria

### Novo componente: `src/components/Admin/AuditLogViewer.tsx`

Componente reutilizavel para visualizar logs:
- Tabela com colunas: Data/Hora, Usuario, Acao, Entidade, Detalhes
- Filtros por tipo de entidade, usuario, periodo
- Badge de cor por tipo de acao (criacao=verde, edicao=azul, aceite=emerald, recusa=vermelho)
- Icone por role (admin/client)
- Paginacao

### Modificacao: `src/pages/Inspections.tsx` (admin)

Adicionar aba ou secao com logs de auditoria das vistorias, usando o AuditLogViewer filtrado por `entityType: 'inspection'`.

### Modificacao: `src/pages/Warranty.tsx` (admin)

No dialog de detalhes da solicitacao (quando clica em um card do Kanban), adicionar aba "Historico/Logs" mostrando o AuditLogViewer filtrado por `entityType: 'warranty'` e `entityId` da solicitacao.

---

## ETAPA 5: Feedback Visual e Acoes Faltantes

### Modificacao: `src/pages/client/Warranty.tsx`

- Botao "Cancelar solicitacao" (linha 494): implementar dialog de confirmacao + toast
- Botao "Adicionar informacoes" (linha 497): implementar dialog com textarea + toast
- Botao "Enviar comentario" (linha 544): implementar logica de adicionar ao array de updates + toast
- Botao "Ver manual completo de garantias" (linha 110): toast informativo

### Modificacao: `src/pages/client/Inspections.tsx`

- Botao "Falar com a equipe" (linha 219): toast informativo
- Botao "Visualizar PDF" (linha 386): toast informativo

### Modificacao: `src/pages/client/Properties.tsx`

- Botoes "Visualizar" dos documentos (linha 112): toast informativo
- Botao "Ver memorial descritivo completo" (linha 258): toast informativo
- Botao "Ver termo completo de garantia" (linha 372): toast informativo
- Botao "Solicitar garantia" (linha 375): navegar para /client/warranty

---

## ETAPA 6: Correcoes de UX e Responsividade

### Pagina do cliente - Vistorias
- Padronizar o status badge da vistoria concluida com aceite pendente (novo status visual)
- Garantir que a tab "Relatorio" mostre status de aceite
- Mobile: garantir que os botoes aceitar/recusar sejam empilhados verticalmente

### Pagina do cliente - Garantias
- A lista de solicitacoes deve mostrar o timeline compacto do WarrantyRequestTimeline
- Integrar dados do warrantyFlowService com os mock data locais
- Adicionar aba "Acompanhamento" que mostra o WarrantyRequestTimeline completo

### Pagina admin - Vistorias
- Cards de vistoria devem mostrar indicador de aceite do cliente (aceito/pendente/recusado)
- Toast de feedback ao clicar em "Detalhes"

---

## Resumo de Arquivos

### Novos arquivos:
| Arquivo | Descricao |
|---------|-----------|
| `src/services/AuditLogService.ts` | Servico centralizado de logs |
| `src/components/Inspection/InspectionAcceptance.tsx` | Componente de aceite/recusa |
| `src/components/Admin/AuditLogViewer.tsx` | Visualizador de logs |

### Arquivos modificados:
| Arquivo | Alteracao |
|---------|-----------|
| `src/types/clientFlow.ts` | Adicionar tipos de aceite de vistoria e novos event types |
| `src/services/EventAutomationService.ts` | Adicionar metodos de aceite/recusa |
| `src/pages/client/Inspections.tsx` | Integrar aceite de vistoria, feedback em acoes |
| `src/pages/client/Warranty.tsx` | Feedback em acoes, integrar timeline do warrantyFlowService |
| `src/pages/client/Properties.tsx` | Feedback em botoes sem acao |
| `src/pages/Warranty.tsx` (admin) | Aba de logs no dialog de detalhes |
| `src/pages/Inspections.tsx` (admin) | Indicador de aceite nos cards |

### Regras respeitadas:
- Nenhuma funcionalidade removida
- Nenhuma regra de negocio alterada
- Nenhum modulo novo fora do escopo
- Integracao total com servicos existentes
- Zero regressoes funcionais
