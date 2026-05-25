import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Warranty from '../pages/Warranty';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { ConfirmProvider } from '../contexts/ConfirmContext';

const queryClient = new QueryClient();

describe('Warranty Page', () => {
  it('should render the warranty kanban view', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ConfirmProvider>
              <Warranty />
            </ConfirmProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
    
    expect(screen.getByText(/Engenharia de Diagnóstico & Assistência/i)).toBeDefined();
    expect(screen.getByText(/Governança técnica do pós-venda/i)).toBeDefined();


  });
});
