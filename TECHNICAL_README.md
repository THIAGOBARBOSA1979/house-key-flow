# Documentação Técnica - Sistema de Gestão de Assistência Técnica

Este projeto segue um padrão arquitetural corporativo focado em segurança, escalabilidade e manutenibilidade.

## Arquitetura de Software

### Core Layer (Serviços Base)
- **BaseService.ts**: Classe abstrata que fornece a lógica fundamental de gerenciamento de estado local (síncrono) e notificação de ouvintes.
- **SupabaseBaseService.ts**: Especialização do BaseService para integração automática com o Supabase. Gerencia CRUD, mapeamento de campos (Snake Case para Camel Case) e auditoria automática.

### Service Layer (Regras de Negócio)
- **WarrantyFlowService**: Gerencia o ciclo de vida das solicitações de garantia, incluindo transições de estado complexas e cálculos de SLA.
- **InspectionService**: Gerencia vistorias técnicas, conflitos de agenda e conformidade técnica (ABNT).
- **AuditLogService**: Centraliza toda a trilha de auditoria do sistema, persistindo ações críticas no banco de dados.

## Segurança e Multi-tenancy

### Isolamento de Dados (RLS)
O sistema utiliza **Row Level Security (RLS)** no Supabase para garantir que usuários só acessem dados de sua própria empresa (`company_id`).

### RBAC (Role-Based Access Control)
As permissões são controladas via roles definidas no perfil do usuário (`admin`, `master`, `technical`, `client`). As checagens são feitas tanto na camada de UI quanto na camada de serviço.

## Fluxo de Dados

1. **Persistência**: Todo dado é persistido no Supabase via `SupabaseBaseService`.
2. **Sincronização**: Os serviços mantêm um cache local síncrono para garantir performance na UI, sincronizado via eventos do banco.
3. **Validação**: Esquemas **Zod** são utilizados para validar dados antes da persistência.

## Padronização de Auditoria

Todas as mutações (`create`, `update`, `delete`, `changeStatus`) disparam automaticamente um log de auditoria via `auditLogService.logAction`, registrando o autor, a ação, o payload e os valores anteriores.

## Como Adicionar um Novo Serviço

1. Crie a interface que estenda `BaseEntity`.
2. Crie a tabela correspondente no Supabase com `company_id`.
3. Crie o serviço herdando de `SupabaseBaseService<T>`.
4. Defina o `fieldMapping` se necessário.
5. Registre o serviço em `src/services/index.ts`.

---
*Documentação gerada automaticamente pela Auditoria Técnica - Onda 15.*
