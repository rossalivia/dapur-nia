import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-muted/20 text-foreground flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-background border-x border-border/50 flex flex-col relative shadow-sm">
        <Header />
        <main className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default MainLayout;
