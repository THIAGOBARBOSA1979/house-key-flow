
# Plano: Modulo Completo de Garantias com Timeline, Kanban, SLA e Relatorios

## Resumo Executivo

Implementar um modulo de garantia completo que inclui:
1. Timeline visual para o cliente acompanhar sua solicitacao
2. Kanban administrativo com drag-and-drop
3. Automacao por eventos para transicoes de status
4. SLA configuravel por tipo de garantia
5. Dashboard de metricas e relatorios
6. Notificacoes automaticas integradas

O sistema sera construido sobre a infraestrutura existente, reutilizando servicos ja implementados (EventAutomationService, NotificationService, ClientStageService) e mantendo todas as funcionalidades atuais.

---

## Arquitetura Geral

```text
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
|  PAINEL CLIENTE   |     |  PAINEL ADMIN     |     |  SERVICOS         |
|                   |     |                   |     |                   |
+-------------------+     +-------------------+     +-------------------+
        |                         |                         |
        v                         v                         v
+-------------------+     +-------------------+     +-------------------+
| WarrantyTimeline  |     | WarrantyKanban    |     | WarrantyService   |
| (etapas visuais)  |     | (drag-and-drop)   |     | (logica central)  |
+-------------------+     +-------------------+     +-------------------+
        |                         |                         |
        v                         v                         v
+-------------------+     +-------------------+     +-------------------+
| SLA Indicators    |     | SLA Dashboard     |     | SLAService        |
| (prazo restante)  |     | (metricas)        |     | (calculo prazos)  |
+-------------------+     +-------------------+     +-------------------+
        |                         |                         |
        +------------+------------+                         |
                     |                                      |
                     v                                      v
            +-------------------+                  +-------------------+
            | EventAutomation   |<---------------->| Notification      |
            | Service (existente)|                  | Service (existente)|
            +-------------------+                  +-------------------+
```

---

## 1. TIMELINE DO CLIENTE (Nova Pagina)

### Objetivo
Permitir ao cliente visualizar todas as etapas da sua solicitacao de garantia com transparencia total.

### Etapas da Timeline

| Ordem | Etapa | Descricao | SLA Padrao |
|-------|-------|-----------|------------|
| 1 | Solicitacao aberta | Cliente criou a solicitacao | - |
| 2 | Em analise | Equipe esta analisando | 2 dias uteis |
| 3 | Vistoria agendada | Tecnico designado | 3 dias uteis |
| 4 | Vistoria realizada | Tecnico visitou o local | - |
| 5 | Aprovada/Reprovada | Decisao sobre a garantia | 1 dia util |
| 6 | Em execucao | Reparo em andamento | Var. por tipo |
| 7 | Finalizada | Garantia concluida | - |

### Componentes Criados

| Componente | Descricao |
|------------|-----------|
| `WarrantyRequestTimeline.tsx` | Timeline visual completa |
| `WarrantyTimelineStep.tsx` | Etapa individual com SLA |
| `SLAIndicator.tsx` | Badge de prazo (no prazo/alerta/atrasado) |
| `WarrantyRequestDetail.tsx` | Pagina de detalhe da solicitacao |

### Indicadores Visuais

```text
Estados da Etapa:
  [VERDE]   Concluido - Etapa finalizada no prazo
  [AZUL]    Em andamento - Etapa atual
  [AMARELO] Alerta - Menos de 20% do prazo restante
  [VERMELHO] Atrasado - Prazo SLA estourado
  [CINZA]   Pendente - Etapa futura
```

---

## 2. KANBAN ADMINISTRATIVO

### Objetivo
Centralizar a gestao de todas as solicitacoes de garantia em um painel visual drag-and-drop.

### Colunas do Kanban

```text
|  ABERTAS  |  EM ANALISE  |  VISTORIA  |  VISTORIA   |  APROVADAS  |  EM EXECUCAO  |  FINALIZADAS  |
|           |              |  AGENDADA  |  REALIZADA  |             |               |               |
|   [Card]  |    [Card]    |   [Card]   |   [Card]    |   [Card]    |    [Card]     |    [Card]     |
|   [Card]  |              |   [Card]   |             |   [Card]    |    [Card]     |               |
```

### Card de Solicitacao

Cada card exibira:
- Cliente + Imovel
- Tipo de garantia
- Prioridade (badge colorido)
- Data de abertura
- SLA restante (barra de progresso)
- Indicador de atraso (se aplicavel)
- Responsavel designado

### Funcionalidades do Kanban

| Funcionalidade | Descricao |
|----------------|-----------|
| Drag & Drop | Mover cards entre colunas |
| Auto-sync | Atualiza timeline do cliente |
| Historico | Registra quem moveu, quando |
| Filtros | Por imovel, tipo, responsavel, prazo |
| Ordenacao | Por SLA, prioridade, data |

### Componentes Criados

| Componente | Descricao |
|------------|-----------|
| `WarrantyKanban.tsx` | Board principal |
| `KanbanColumn.tsx` | Coluna individual |
| `KanbanCard.tsx` | Card de solicitacao |
| `KanbanFilters.tsx` | Barra de filtros |

---

## 3. AUTOMACAO POR EVENTOS

### Eventos e Acoes Automaticas

| Evento | Acoes Automaticas |
|--------|-------------------|
| `warranty_status_changed` | Atualiza timeline, recalcula SLA, notifica cliente |
| `warranty_inspection_scheduled` | Avanca etapa, notifica cliente com data |
| `warranty_inspection_completed` | Marca vistoria realizada, aguarda decisao |
| `warranty_approved` | Avanca para execucao, inicia SLA de reparo |
| `warranty_rejected` | Finaliza com reprovacao, notifica cliente |
| `warranty_execution_started` | Registra inicio do reparo |
| `warranty_completed` | Encerra fluxo, bloqueia edicao, notifica |
| `sla_expired` | Marca como atrasado, alerta responsaveis |

### Novo Servico: WarrantyAutomationService

```text
WarrantyAutomationService
  |
  +-- onStatusChange(requestId, oldStatus, newStatus)
  |     -> Atualiza timeline
  |     -> Recalcula SLA
  |     -> Registra historico
  |     -> Cria notificacao
  |
  +-- onInspectionScheduled(requestId, date, technicianId)
  |     -> Avanca status
  |     -> Notifica cliente
  |
  +-- onInspectionCompleted(requestId, result, notes)
  |     -> Atualiza status
  |     -> Aguarda aprovacao
  |
  +-- onApproved(requestId, notes)
  |     -> Avanca para execucao
  |     -> Inicia SLA de reparo
  |
  +-- onRejected(requestId, reason)
  |     -> Finaliza com motivo
  |     -> Notifica cliente
  |
  +-- onCompleted(requestId)
  |     -> Encerra fluxo
  |     -> Bloqueia edicao
  |     -> Notificacao final
  |
  +-- checkSLAExpiration()
        -> Verifica todos os SLAs
        -> Marca atrasados
        -> Gera alertas
```

---

## 4. SLA CONFIGURAVEL POR TIPO

### Tipos de Garantia com SLA

| Tipo | SLA Analise | SLA Vistoria | SLA Decisao | SLA Execucao |
|------|-------------|--------------|-------------|--------------|
| Estrutural | 3 dias | 5 dias | 2 dias | 30 dias |
| Hidraulica | 2 dias | 3 dias | 1 dia | 7 dias |
| Eletrica | 2 dias | 3 dias | 1 dia | 7 dias |
| Impermeabilizacao | 3 dias | 5 dias | 2 dias | 15 dias |
| Acabamento | 2 dias | 3 dias | 1 dia | 5 dias |
| Esquadrias | 2 dias | 3 dias | 1 dia | 10 dias |

### Servico SLA

```text
SLAService
  |
  +-- getSLAForType(warrantyType)
  |     -> Retorna configuracao SLA
  |
  +-- calculateDeadline(startDate, slaHours)
  |     -> Calcula prazo considerando dias uteis
  |
  +-- getRemainingTime(requestId, stage)
  |     -> Retorna tempo restante
  |
  +-- getSLAStatus(requestId, stage)
  |     -> "on_track" | "warning" | "expired"
  |
  +-- updateSLAConfiguration(warrantyType, config)
        -> Permite admin alterar SLAs
```

### Componentes de Configuracao (Admin)

| Componente | Descricao |
|------------|-----------|
| `SLAConfigurationPanel.tsx` | Painel de configuracao |
| `SLATypeEditor.tsx` | Editor de SLA por tipo |
| `SLAPreview.tsx` | Visualizacao do fluxo |

---

## 5. DASHBOARD DE METRICAS (Admin)

### Cards de Resumo

```text
+-------------------+  +-------------------+  +-------------------+  +-------------------+
|  ABERTAS HOJE     |  |  EM ATRASO        |  |  TEMPO MEDIO      |  |  % NO PRAZO       |
|       12          |  |        5          |  |     4.2 dias      |  |       87%         |
+-------------------+  +-------------------+  +-------------------+  +-------------------+
```

### Graficos Implementados

| Grafico | Tipo | Descricao |
|---------|------|-----------|
| Solicitacoes por Status | Donut | Distribuicao atual |
| Evolucao Mensal | Linha | Abertas vs Finalizadas |
| Tempo por Tipo | Barras | Tempo medio por categoria |
| SLA Performance | Gauge | % cumprimento SLA |
| Gargalos por Etapa | Barras horizontais | Tempo medio por etapa |
| Heatmap Semanal | Heatmap | Volume por dia/hora |

### Filtros Disponiveis

- Periodo (hoje, semana, mes, customizado)
- Tipo de garantia
- Imovel/Empreendimento
- Responsavel
- Status

### Componentes Criados

| Componente | Descricao |
|------------|-----------|
| `WarrantyDashboard.tsx` | Dashboard principal |
| `MetricsCards.tsx` | Cards de resumo |
| `PerformanceCharts.tsx` | Graficos de performance |
| `BottleneckAnalysis.tsx` | Analise de gargalos |
| `SLAComplianceChart.tsx` | Grafico de SLA |
| `ExportReportButton.tsx` | Botao de exportacao |

---

## 6. NOTIFICACOES AUTOMATICAS

### Novos Tipos de Notificacao

| Tipo | Titulo | Destinatario |
|------|--------|--------------|
| `warranty_opened` | Solicitacao Registrada | Cliente |
| `warranty_in_analysis` | Em Analise | Cliente |
| `warranty_inspection_scheduled` | Vistoria Agendada | Cliente |
| `warranty_inspection_done` | Vistoria Realizada | Cliente |
| `warranty_approved` | Garantia Aprovada | Cliente |
| `warranty_rejected` | Garantia Negada | Cliente |
| `warranty_in_execution` | Reparo Iniciado | Cliente |
| `warranty_completed` | Garantia Concluida | Cliente |
| `sla_warning` | Prazo Proximo | Admin |
| `sla_expired` | SLA Estourado | Admin + Cliente |

### Integracao com NotificationService Existente

Estender o servico atual para incluir os novos tipos, mantendo compatibilidade.

---

## 7. ESTRUTURA DE DADOS

### Novos Tipos TypeScript

```text
// Etapas da garantia
WarrantyStage = 
  | "opened"
  | "in_analysis" 
  | "inspection_scheduled"
  | "inspection_completed"
  | "approved"
  | "rejected"
  | "in_execution"
  | "completed"

// Configuracao SLA
SLAConfig = {
  warrantyType: string
  analysisHours: number
  inspectionHours: number
  decisionHours: number
  executionHours: number
}

// Status do SLA
SLAStatus = "on_track" | "warning" | "expired"

// Historico de movimentacao
WarrantyStatusHistory = {
  id: string
  requestId: string
  fromStatus: WarrantyStage | null
  toStatus: WarrantyStage
  changedAt: Date
  changedBy: string
  isAutomatic: boolean
  notes?: string
}

// Solicitacao de garantia estendida
WarrantyRequestExtended = WarrantyRequest & {
  currentStage: WarrantyStage
  stageStartedAt: Date
  slaDeadline: Date
  slaStatus: SLAStatus
  assignedTo: string | null
  inspectionDate?: Date
  inspectionNotes?: string
  executionStartDate?: Date
  completionDate?: Date
  history: WarrantyStatusHistory[]
}
```

---

## 8. ARQUIVOS A CRIAR

### Tipos
- `src/types/warrantyFlow.ts` - Tipos para fluxo de garantia

### Servicos
- `src/services/WarrantySLAService.ts` - Gerenciamento de SLA
- `src/services/WarrantyFlowService.ts` - Fluxo e historico
- `src/services/WarrantyAutomationService.ts` - Automacoes

### Componentes Cliente
- `src/components/Warranty/ClientTimeline/WarrantyRequestTimeline.tsx`
- `src/components/Warranty/ClientTimeline/WarrantyTimelineStep.tsx`
- `src/components/Warranty/ClientTimeline/SLAIndicator.tsx`

### Componentes Admin - Kanban
- `src/components/Warranty/Kanban/WarrantyKanban.tsx`
- `src/components/Warranty/Kanban/KanbanColumn.tsx`
- `src/components/Warranty/Kanban/KanbanCard.tsx`
- `src/components/Warranty/Kanban/KanbanFilters.tsx`

### Componentes Admin - Dashboard
- `src/components/Warranty/Dashboard/WarrantyMetricsDashboard.tsx`
- `src/components/Warranty/Dashboard/MetricsCards.tsx`
- `src/components/Warranty/Dashboard/PerformanceCharts.tsx`
- `src/components/Warranty/Dashboard/SLAComplianceChart.tsx`
- `src/components/Warranty/Dashboard/BottleneckAnalysis.tsx`

### Componentes Admin - SLA Config
- `src/components/Warranty/SLA/SLAConfigurationPanel.tsx`
- `src/components/Warranty/SLA/SLATypeEditor.tsx`

### Paginas
- Modificar: `src/pages/client/Warranty.tsx` (adicionar timeline)
- Modificar: `src/pages/Warranty.tsx` (adicionar kanban + dashboard)

---

## 9. ARQUIVOS A MODIFICAR

| Arquivo | Modificacoes |
|---------|--------------|
| `src/types/clientFlow.ts` | Adicionar novos tipos de notificacao |
| `src/services/NotificationService.ts` | Adicionar templates de notificacao |
| `src/services/EventAutomationService.ts` | Integrar automacoes de garantia |
| `src/pages/client/Warranty.tsx` | Adicionar timeline de acompanhamento |
| `src/pages/Warranty.tsx` | Adicionar tabs: Kanban, Dashboard, SLA Config |
| `src/types/warranty.ts` | Estender tipos existentes |

---

## 10. FLUXO DE USUARIO - CLIENTE

```text
1. Cliente acessa /client/warranty
2. Ve lista de solicitacoes abertas
3. Clica em uma solicitacao
4. Ve timeline visual com:
   - Todas as etapas
   - Status atual destacado
   - Prazo SLA de cada etapa
   - Indicador de atraso se houver
5. Recebe notificacoes a cada mudanca
```

---

## 11. FLUXO DE USUARIO - ADMIN

```text
1. Admin acessa /warranty (painel admin)
2. Ve tabs: Kanban | Dashboard | Configuracao SLA
3. No Kanban:
   - Ve todas as solicitacoes por status
   - Arrasta cards para mudar status
   - Sistema atualiza automaticamente timeline + notifica cliente
4. No Dashboard:
   - Ve metricas em tempo real
   - Filtra por periodo/tipo/imovel
   - Identifica gargalos
   - Exporta relatorios
5. Em Configuracao SLA:
   - Ajusta prazos por tipo de garantia
   - Alteracoes afetam novas solicitacoes
```

---

## 12. CONSIDERACOES TECNICAS

### Performance
- Kanban usa virtualizacao para muitos cards
- Dashboard carrega dados sob demanda
- Metricas cacheadas por 5 minutos

### Responsividade
- Kanban colapsa em coluna unica no mobile
- Dashboard adapta graficos para telas menores
- Timeline vertical sempre responsiva

### Seguranca
- Validacao de permissoes em cada acao
- Historico imutavel de movimentacoes
- Logs de auditoria completos

### Estabilidade
- Nao quebrar funcionalidades existentes
- Reutilizar servicos ja implementados
- Testes de integracao em pontos criticos

---

## 13. ORDEM DE IMPLEMENTACAO

1. Criar tipos e interfaces (`warrantyFlow.ts`)
2. Criar servico SLA (`WarrantySLAService.ts`)
3. Criar servico de fluxo (`WarrantyFlowService.ts`)
4. Criar timeline do cliente
5. Criar kanban administrativo
6. Criar dashboard de metricas
7. Criar configuracao de SLA
8. Integrar automacoes
9. Atualizar notificacoes
10. Testes e ajustes finais
