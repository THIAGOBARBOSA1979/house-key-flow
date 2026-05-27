import React, { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/contexts/AuthContext';
import { SkeletonLoader } from '../shared/SkeletonLoader';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { CommandPalette } from '../shared/CommandPalette';

export const AppLayout = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isLoading) {
    return <SkeletonLoader type="page" />;
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative selection:bg-primary/20 selection:text-primary">
      <CommandPalette />
      <Sidebar className="hidden lg:flex" />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header />
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
          <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl">
            <ErrorBoundary>
              <Suspense fallback={<SkeletonLoader type="page" />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
};
