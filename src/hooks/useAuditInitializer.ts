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
  // Wave 8: Performance Monitoring & Advanced Analytics
  { module: 'Analytics', description: 'Gargalo de performance na geração de relatórios PDF com grandes volumes de dados', impact: 'medium', wave: 8 },
  { module: 'Monitoring', description: 'Monitoramento de erros de rede (Network Error) sem retry automático em áreas de sinal fraco', impact: 'high', wave: 8 },
  { module: 'Performance', description: 'Queries Supabase sem filtragem no lado do servidor em listas de notificações antigas', impact: 'medium', wave: 8 },
  { module: 'UX', description: 'Falta de feedback visual em operações de "Sincronização em Segundo Plano"', impact: 'low', wave: 8 },
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
          { id: 8, status: 'completed', issues: [] }
        ],
        currentWave: 8
      }));

      // Simulate wave completion
      setTimeout(markAllFixed, 1000);
    }
  }, [issues.length, addIssue]);
};
