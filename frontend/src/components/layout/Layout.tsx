import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  conflictCount: number;
}

export const Layout: React.FC<LayoutProps> = ({ children, conflictCount }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f6] text-slate-900 font-sans">
      <Navbar conflictCount={conflictCount} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar conflictCount={conflictCount} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#eef2f6] bg-workspace-pattern">
          {children}
        </main>
      </div>
    </div>
  );
};
