
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import * as AuthContext from '../contexts/AuthContext';

// Mock useAuth
vi.mock('../contexts/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../contexts/AuthContext')>();
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

const mockUseAuth = AuthContext.useAuth as any;

describe('ProtectedRoute', () => {
  it('should redirect to login if not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><div>Protected Content</div></ProtectedRoute>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText('Login Page')).toBeDefined();
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('should render children if authenticated with correct role', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: 'admin' },
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute requiredRole="admin">
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeDefined();
  });

  it('should redirect to client area if admin tries to access with wrong role', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: 'client' },
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><div>Admin Content</div></ProtectedRoute>} />
          <Route path="/client" element={<div>Client Area</div>} />
        </Routes>
      </BrowserRouter>
    );

    // Initial render of / results in matching route, but Navigate takes effect
    // In this test setup we need to navigate to /admin
    window.history.pushState({}, 'Test', '/admin');
    
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><div>Admin Content</div></ProtectedRoute>} />
          <Route path="/client" element={<div>Client Area</div>} />
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText('Client Area')).toBeDefined();
  });
});
