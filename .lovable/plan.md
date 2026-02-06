
# Plano: Fluxo Gradual do Cliente com Automacao por Eventos

## Resumo

Implementar um sistema de fluxo progressivo para clientes no painel, onde cada cliente evolui por etapas controladas (Cadastrado > Vistoria Liberada > Garantia Liberada). O sistema incluira automacao por eventos, controle manual pelo administrador, linha do tempo visual, notificacoes automaticas e integracao total com o modulo de garantia.

## Arquitetura do Sistema

```text
+------------------+     +-------------------+     +------------------+
|  ClientStage     |     |  EventAutomation  |     |  Notifications   |
|  Service         |---->|  Service          |---->|  Service         |
|                  |     |                   |     |                  |
+------------------+     +-------------------+     +------------------+
        |                        |                        |
        v                        v                        v
+------------------+     +-------------------+     +------------------+
| Etapa 1:         |     | Evento: Vistoria  |     | - Toast          |
|   Cadastrado     |     |   Aprovada        |     | - Historico      |
|                  |     |                   |     | - (futuro: email)|
| Etapa 2:         |     | Evento: Vistoria  |     |                  |
|   Vistoria       |     |   Reprovada       |     |                  |
|   Liberada       |     |                   |     |                  |
|                  |     |                   |     |                  |
| Etapa 3:         |     |                   |     |                  |
|   Garantia       |     |                   |     |                  |
|   Liberada       |     |                   |     |                  |
+------------------+     +-------------------+     +------------------+
```

## O Que Sera Criado

### 1. Tipos e Interfaces

**Novos tipos para gerenciar o fluxo do cliente:**

| Tipo | Descricao |
|------|-----------|
| `ClientStage` | Enum com as etapas: registered, inspection_enabled, warranty_enabled |
| `ClientProfile` | Perfil completo do cliente com etapa atual e permissoes |
| `ClientEvent` | Evento registrado no historico do cliente |
| `ClientNotification` | Notificacao para o cliente |
| `StagePermissions` | Mapeamento de permissoes por etapa |
| `TimelineItem` | Item da linha do tempo visual |

### 2. Servicos

**ClientStageService:**
- `getCurrentStage(clientId)` - Retorna etapa atual do cliente
- `getPermissions(clientId)` - Retorna permissoes baseadas na etapa
- `canScheduleInspection(clientId)` - Verifica se pode agendar vistoria
- `canRequestWarranty(clientId)` - Verifica se pode solicitar garantia
- `advanceStage(clientId, newStage, reason)` - Avanca etapa do cliente
- `getTimeline(clientId)` - Retorna linha do tempo do cliente

**EventAutomationService:**
- `onInspectionApproved(inspectionId, clientId)` - Libera garantia automaticamente
- `onInspectionRejected(inspectionId, clientId)` - Bloqueia avanco
- `processEvent(event)` - Processa evento e executa automacoes

**NotificationService:**
- `createNotification(clientId, type, data)` - Cria notificacao
- `getNotifications(clientId)` - Lista notificacoes do cliente
- `markAsRead(notificationId)` - Marca como lida
- `getUnreadCount(clientId)` - Conta nao lidas

### 3. Componentes de Interface

**Componentes para o Painel do Cliente:**

| Componente | Descricao |
|------------|-----------|
| `ClientTimeline.tsx` | Linha do tempo visual com todas as etapas |
| `TimelineItem.tsx` | Item individual da timeline |
| `StageIndicator.tsx` | Indicador de etapa atual |
| `FeatureGate.tsx` | Componente que bloqueia acesso a funcionalidades |
| `BlockedFeatureMessage.tsx` | Mensagem de funcionalidade bloqueada |
| `NotificationCenter.tsx` | Central de notificacoes do cliente |
| `NotificationItem.tsx` | Item de notificacao individual |

**Componentes para o Painel do Administrador:**

| Componente | Descricao |
|------------|-----------|
| `ClientStageManager.tsx` | Gerenciador de etapas do cliente |
| `ManualReleaseDialog.tsx` | Dialog para liberacao manual |
| `ClientEventHistory.tsx` | Historico de eventos do cliente |
| `AdminNotificationTrigger.tsx` | Disparador manual de notificacoes |

### 4. Paginas Modificadas

**Painel do Cliente:**
- `Dashboard.tsx` - Adicionar linha do tempo e indicador de etapa
- `Inspections.tsx` - Bloquear agendamento se etapa < inspection_enabled
- `Warranty.tsx` - Bloquear solicitacao se etapa < warranty_enabled

**Painel do Administrador:**
- `ClientArea.tsx` - Adicionar gerenciamento de etapas
- `Inspections.tsx` - Adicionar aprovacao/reprovacao com automacao

## Fluxo Detalhado das Etapas

### Etapa 1 - Cliente Cadastrado

```text
Permissoes:
  [x] Visualizar dashboard
  [x] Visualizar documentos
  [x] Visualizar informacoes do imovel
  [ ] Agendar vistoria (BLOQUEADO)
  [ ] Iniciar vistoria (BLOQUEADO)
  [ ] Solicitar garantia (BLOQUEADO)

Condicao para avancar:
  - Liberacao manual pelo administrador
  OU
  - Evento automatico do sistema (ex: data de entrega proxima)
```

### Etapa 2 - Vistoria Liberada

```text
Permissoes:
  [x] Todas da etapa anterior
  [x] Agendar vistoria
  [x] Iniciar vistoria
  [x] Visualizar historico de vistorias
  [ ] Solicitar garantia (BLOQUEADO)

Condicao para avancar:
  - Vistoria aprovada (AUTOMATICO)
  OU
  - Liberacao manual pelo administrador
```

### Etapa 3 - Garantia Liberada

```text
Permissoes:
  [x] Todas da etapa anterior
  [x] Solicitar garantia (respeitando regras de elegibilidade)
  [x] Visualizar historico de garantias

Validacoes adicionais:
  - Todas as regras do modulo de garantia permanecem ativas
  - Elegibilidade por data e status
  - Bloqueio de duplicidade
```

## Linha do Tempo Visual

**Estados visuais para cada item:**

| Estado | Cor | Icone | Descricao |
|--------|-----|-------|-----------|
| Concluido | Verde | CheckCircle | Etapa completada com sucesso |
| Atual | Azul | Clock | Etapa em andamento |
| Pendente | Cinza | Circle | Etapa futura |
| Bloqueado | Vermelho | Lock | Etapa bloqueada por reprovacao |

**Itens da Timeline:**
1. Cadastro realizado
2. Vistoria liberada
3. Vistoria agendada
4. Vistoria realizada
5. Vistoria aprovada/reprovada
6. Garantia liberada
7. Solicitacoes de garantia
8. Garantias concluidas

## Automacao por Eventos

### Evento: Vistoria Aprovada

```text
Trigger: Inspector marca vistoria como "aprovada"

Acoes automaticas:
  1. Atualizar etapa do cliente para "warranty_enabled"
  2. Registrar evento no historico
  3. Criar notificacao: "Sua garantia foi liberada!"
  4. Atualizar timeline
  5. Log de auditoria com data, responsavel e tipo (automatico)
```

### Evento: Vistoria Reprovada

```text
Trigger: Inspector marca vistoria como "reprovada"

Acoes automaticas:
  1. Manter cliente na etapa atual
  2. Registrar evento no historico
  3. Criar notificacao: "Sua vistoria precisa de ajustes"
  4. Agendar nova vistoria automaticamente (se configurado)
  5. Log de auditoria
```

## Notificacoes

### Tipos de Notificacao

| Tipo | Mensagem | Urgencia |
|------|----------|----------|
| inspection_enabled | "Vistoria liberada! Agende sua vistoria." | Alta |
| inspection_scheduled | "Vistoria agendada para [data]" | Normal |
| inspection_reminder | "Lembrete: sua vistoria e amanha" | Alta |
| inspection_approved | "Vistoria aprovada! Garantia liberada." | Alta |
| inspection_rejected | "Vistoria com pendencias. Verificar." | Alta |
| warranty_enabled | "Voce ja pode solicitar garantias" | Normal |
| warranty_created | "Solicitacao de garantia registrada" | Normal |
| warranty_updated | "Atualizacao na sua solicitacao" | Normal |
| warranty_completed | "Sua solicitacao foi concluida" | Normal |

### Estrutura da Notificacao

```text
{
  id: string
  clientId: string
  type: NotificationType
  title: string
  message: string
  createdAt: Date
  read: boolean
  urgent: boolean
  metadata: {
    relatedEntityId?: string
    relatedEntityType?: "inspection" | "warranty" | "stage"
  }
}
```

## Seguranca e Validacao

### Validacao Dupla (Frontend + Backend)

**Frontend:**
- Componente `FeatureGate` verifica permissoes antes de renderizar
- Botoes desabilitados com tooltip explicativo
- Redirecionamento automatico se tentar acessar URL diretamente

**Backend (preparado para integracao):**
- Validacao de etapa antes de processar requisicoes
- Verificacao de propriedade (clientId match)
- Logs de tentativas de acesso nao autorizado

### Bloqueio de Acesso Direto

```text
Se cliente tenta acessar /client/warranty sem etapa warranty_enabled:
  -> Exibir FeatureGate com mensagem:
     "Esta funcionalidade sera liberada apos a aprovacao da sua vistoria."
  -> Botao: "Ver minhas vistorias"
```

## Arquivos a Serem Criados

| Arquivo | Descricao |
|---------|-----------|
| `src/types/clientFlow.ts` | Tipos para fluxo do cliente |
| `src/services/ClientStageService.ts` | Servico de gerenciamento de etapas |
| `src/services/EventAutomationService.ts` | Servico de automacao por eventos |
| `src/services/NotificationService.ts` | Servico de notificacoes |
| `src/components/ClientFlow/ClientTimeline.tsx` | Linha do tempo visual |
| `src/components/ClientFlow/TimelineItem.tsx` | Item da timeline |
| `src/components/ClientFlow/StageIndicator.tsx` | Indicador de etapa |
| `src/components/ClientFlow/FeatureGate.tsx` | Bloqueio de funcionalidades |
| `src/components/ClientFlow/NotificationCenter.tsx` | Central de notificacoes |
| `src/components/ClientFlow/NotificationItem.tsx` | Item de notificacao |
| `src/components/Admin/ClientStageManager.tsx` | Gerenciador admin de etapas |
| `src/components/Admin/ManualReleaseDialog.tsx` | Dialog de liberacao manual |
| `src/components/Admin/ClientEventHistory.tsx` | Historico de eventos |
| `src/hooks/useClientStage.ts` | Hook para gerenciar etapa do cliente |
| `src/hooks/useNotifications.ts` | Hook para notificacoes |

## Arquivos a Serem Modificados

| Arquivo | Modificacoes |
|---------|--------------|
| `src/pages/client/Dashboard.tsx` | Adicionar timeline e indicador de etapa |
| `src/pages/client/Inspections.tsx` | Integrar FeatureGate para agendamento |
| `src/pages/client/Warranty.tsx` | Integrar FeatureGate e validacao de etapa |
| `src/pages/ClientArea.tsx` | Adicionar gerenciamento de etapas no admin |
| `src/components/Layout/ClientLayout.tsx` | Integrar NotificationCenter |
| `src/contexts/AuthContext.tsx` | Adicionar informacoes de etapa ao contexto |
| `src/types/auth.ts` | Estender User com clientStage |

## Integracao com Modulo de Garantia

A validacao de garantia tera duas camadas:

```text
Camada 1 - Etapa do Cliente (ClientStageService):
  -> Cliente esta na etapa "warranty_enabled"?
  -> Se NAO: bloquear acesso

Camada 2 - Elegibilidade do Item (WarrantyValidationService):
  -> Item tem garantia ativa?
  -> Data dentro do periodo?
  -> Status = "ativa"?
  -> Item pertence ao cliente?
```

Ambas as camadas precisam ser satisfeitas para criar uma solicitacao.

## Dados Mock Iniciais

```text
Cliente de demonstracao:
  id: "client-1"
  nome: "Maria Oliveira"
  etapa: "inspection_enabled"
  
  Timeline:
    [CONCLUIDO] Cadastro: 20/11/2024
    [CONCLUIDO] Vistoria Liberada: 15/03/2025
    [ATUAL] Vistoria Agendada: 15/05/2025
    [PENDENTE] Vistoria Realizada
    [PENDENTE] Garantia Liberada
    
  Notificacoes:
    - "Vistoria de pre-entrega agendada" (2h atras)
    - "Sua vistoria foi liberada" (1 dia atras)
```

## Proximos Passos Pos-Implementacao

1. Integrar com Supabase/Lovable Cloud para persistencia real
2. Implementar envio de email para notificacoes
3. Adicionar integracao com WhatsApp
4. Criar dashboard de metricas para administrador
5. Implementar regras de SLA para tempos de resposta
