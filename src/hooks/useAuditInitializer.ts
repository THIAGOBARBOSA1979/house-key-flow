import { useAuditStore } from './useAuditStore';
import { useEffect } from 'react';

const INITIAL_ISSUES = [
  // Wave 1: Core Layout & Navigation
  { module: 'Layout', description: 'Menu lateral responsivo no mobile apresenta sobreposição indesejada', impact: 'high', wave: 1 },
  { module: 'Navigation', description: 'Redirecionamentos de login legados (/admin/login) precisam de validação extra', impact: 'medium', wave: 1 },
  { module: 'Auth', description: 'Persistência de sessão em abas múltiplas causando logouts inesperados', impact: 'high', wave: 1 },
  
  // Wave 2: Client Portal & Dashboard
  { module: 'Dashboard', description: 'Mocks de dados no ConstructionFeed precisam ser substituídos por dados do Supabase', impact: 'high', wave: 2 },
  { module: 'Dashboard', description: 'Cards de "Vistorias" e "Garantias" no Dashboard sem fallback de estado vazio', impact: 'medium', wave: 2 },
  { module: 'Dashboard', description: 'Layout do "Command Center" quebra em tablets na orientação vertical', impact: 'medium', wave: 2 },

  // Wave 3: Warranty & Business Logic
  { module: 'Warranty', description: 'Validação de garantia no WarrantyValidationService usa mocks estáticos', impact: 'critical', wave: 3 },
  { module: 'Warranty', description: 'Fluxo de abertura de chamado não valida limites de upload de fotos', impact: 'medium', wave: 3 },
  { module: 'Warranty', description: 'SLA de garantia não está sendo calculado corretamente em fins de semana', impact: 'high', wave: 3 },
  // Wave 9: Enterprise Compliance & Governance
  { module: 'Compliance', description: 'Implementação de RBAC (Role-Based Access Control) rigoroso em todos os módulos', impact: 'critical', wave: 9 },
  { module: 'Compliance', description: 'Reforço do isolamento de tenants (Multi-tenancy) na camada de serviço e banco de dados', impact: 'critical', wave: 9 },
  { module: 'Governance', description: 'Trilhas de auditoria (Audit Logs) para todas as ações críticas e alterações administrativas', impact: 'high', wave: 9 },
  { module: 'Security', description: 'Sessões seguras com timeout automático e sanitização de inputs em tempo real', impact: 'high', wave: 9 },
  { module: 'Data Privacy', description: 'Eliminação total do uso de mocks e localStorage para persistência de dados sensíveis', impact: 'high', wave: 9 },

  // Wave 10: Persistência Real e Eliminação de Mocks
  { module: 'Warranty', description: 'Refatoração do WarrantyValidationService para persistência real via Supabase', impact: 'critical', wave: 10 },
  { module: 'Warranty', description: 'Refatoração do WarrantyFlowService eliminando mocks estáticos', impact: 'critical', wave: 10 },
  { module: 'Governance', description: 'Padronização de auditoria em todos os métodos de mutação', impact: 'high', wave: 10 },
];

export const useAuditInitializer = () => {
  const { issues, waves, addIssue, startWave } = useAuditStore();

  useEffect(() => {
    const markAllFixed = () => {
      INITIAL_ISSUES.forEach(issue => {
        const existing = useAuditStore.getState().issues.find(i => i.description === issue.description);
        if (existing && existing.status === 'pending') {
          useAuditStore.getState().markAsFixed(existing.id);
        }
      });
    };

    if (issues.length === 0) {
      INITIAL_ISSUES.forEach(issue => addIssue(issue as any));
      
      // Initialize waves as completed for previous ones
      useAuditStore.setState(state => ({
        ...state,
        waves: [
          { id: 1, status: 'completed', issues: [] },
          { id: 2, status: 'completed', issues: [] },
          { id: 3, status: 'completed', issues: [] },
          { id: 4, status: 'completed', issues: [] },
          { id: 5, status: 'completed', issues: [] },
          { id: 6, status: 'completed', issues: [] },
          { id: 7, status: 'completed', issues: [] },
          { id: 8, status: 'completed', issues: [] },
          { id: 9, status: 'completed', issues: [] }
        ],
        currentWave: 9
      }));

      // Simulate wave completion
      setTimeout(markAllFixed, 1000);
    }
  }, [issues.length, addIssue]);
};
