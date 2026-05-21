
import { describe, it, expect, beforeEach, vi, beforeEach as setup } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '../components/ui/toaster';





// Helper component to test useAuth hook
const AuthTestComponent = () => {
  const { user, login, logout, isAuthenticated, isLoading } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-name">{user?.name || 'No User'}</div>
      <div data-testid="loading-status">{isLoading ? 'Loading' : 'Loaded'}</div>
      <button onClick={() => login('admin@exemplo.com', '123456', 'admin')} data-testid="login-btn">Login Admin</button>
      <button onClick={() => logout()} data-testid="logout-btn">Logout</button>
    </div>
  );
};

describe('Auth Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize as not authenticated', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <AuthTestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('Not Authenticated');
    expect(screen.getByTestId('user-name').textContent).toBe('No User');
  });

  it('should login successfully as admin', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <AuthTestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    const loginBtn = screen.getByTestId('login-btn');
    
    await act(async () => {
      loginBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
    }, { timeout: 3000 });

    expect(screen.getByTestId('user-name').textContent).toContain('Admin');
  });


  it('should logout and clear session', async () => {
    // Manually set a user in localStorage
    const mockUser = { id: '1', name: 'Test User', role: 'admin', email: 'test@example.com' };
    localStorage.setItem('auth_user', JSON.stringify(mockUser));

    render(
      <BrowserRouter>
        <AuthProvider>
          <AuthTestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading-status').textContent).toBe('Loaded');
    });

    // Initial check (from localStorage)
    expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');

    const logoutBtn = screen.getByTestId('logout-btn');
    
    await act(async () => {
      logoutBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Not Authenticated');
    });
    
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});
