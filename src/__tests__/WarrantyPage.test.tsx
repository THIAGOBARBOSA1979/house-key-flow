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
    // Verify some kanban columns labels (labels from WARRANTY_STAGES)
    expect(screen.getByText(/Solicitação Aberta/i)).toBeDefined();
    expect(screen.getByText(/Em Análise/i)).toBeDefined();
    expect(screen.getByText(/Vistoria Agendada/i)).toBeDefined();
    expect(screen.getByText(/Em Execução/i)).toBeDefined();
  });
});


