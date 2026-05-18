# Documentação Técnica - SaaS Multi-tenant

## Arquitetura
O sistema utiliza uma arquitetura baseada em **Domínios** e **Serviços**, com isolamento estrito de dados (Multi-tenancy) na camada de serviços.

### Camada de Serviços
- `BaseService`: Classe abstrata que encapsula lógica de CRUD, persistência local (localStorage) e reatividade (pub/sub).
- **Isolamento de Tenant**: Todos os serviços que herdam de `BaseService` exigem `companyId` para operações de leitura, a menos que o usuário seja um `Super Admin`.

### Segurança (RBAC)
- **Super Admin**: Acesso global a todos os tenants e configurações do sistema.
- **Admin**: Gerencia dados específicos de seu tenant (empresa).
- **Client/User**: Acesso limitado aos seus próprios dados dentro do tenant.

## Testes
A suíte de testes utiliza **Vitest** e **React Testing Library**.
- Testes de Serviço: Localizados em `src/services/__tests__`.
- Testes de Hooks: Localizados em `src/hooks/__tests__`.

Para rodar os testes:
```bash
npm test
```

## Padronização de Código
- **Imports**: Utilize o alias `@/` para referências absolutas.
- **Serviços**: Sempre exporte tanto a classe quanto uma instância singleton. Centralize exports em `src/services/index.ts`.
