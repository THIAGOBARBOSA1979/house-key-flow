import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Users from '../pages/Users';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

describe('Users Page', () => {
  it('should render the users page without errors', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Users />
        </BrowserRouter>
      </QueryClientProvider>
    );
    
    expect(screen.getByText(/Gestão de Usuários/i)).toBeDefined();
    expect(screen.getByText(/Novo Usuário/i)).toBeDefined();
  });
});
