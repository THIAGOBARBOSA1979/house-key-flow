import React from 'react';
import { GlobalSearch } from './GlobalSearch';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';
import { Breadcrumbs } from './Breadcrumbs';
import { useCommandPalette } from '@/hooks/shared/useCommandPalette';

export const Header = () => {
  const { toggle } = useCommandPalette();
  
  return (
    <header className="h-20 border-b border-border/10 bg-background/80 backdrop-blur-md sticky top-0 z-40 px-6-sem flex items-center justify-between">
      <div className="flex items-center gap-6-sem flex-1">
        <Breadcrumbs />
        <div className="hidden md:block w-full max-w-md">
          <GlobalSearch />
        </div>
      </div>
      
      <div className="flex items-center gap-4-sem">
        <NotificationBell />
        <div className="h-8 w-px bg-border/10 mx-2 hidden sm:block" />
        <UserMenu onOpenShortcuts={toggle} />
      </div>
    </header>
  );
};
