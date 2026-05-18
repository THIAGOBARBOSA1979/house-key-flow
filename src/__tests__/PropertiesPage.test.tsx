import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Properties from '../pages/Properties';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';

const queryClient = new QueryClient();

describe('Properties Page', () => {
  it('should render the properties page with list of projects', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Properties />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
    
    expect(screen.getByText(/Empreendimentos/i)).toBeDefined();
    expect(screen.getByText(/Novo Empreendimento/i)).toBeDefined();
    expect(screen.getByText(/Total de Projetos/i)).toBeDefined();
  });
});
