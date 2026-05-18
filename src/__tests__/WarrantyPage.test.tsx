import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Warranty from '../pages/Warranty';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';

const queryClient = new QueryClient();

describe('Warranty Page', () => {
  it('should render the warranty kanban view', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Warranty />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
    
    expect(screen.getByText(/Gestão de Garantias/i)).toBeDefined();
    // Use getAllByText for labels that might repeat in the sidebar or breadcrumbs
    expect(screen.getAllByText(/Solicitação Aberta/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Em Análise/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Vistoria Agendada/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Em Execução/i).length).toBeGreaterThan(0);
  });
});
