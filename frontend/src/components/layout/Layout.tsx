import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  conflictCount: number;
}

export const Layout: React.FC<LayoutProps> = ({ children, conflictCount }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <Navbar conflictCount={conflictCount} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar conflictCount={conflictCount} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-b from-slate-950 via-[#0a0f1d] to-[#080b14]">
          {children}
        </main>
      </div>
    </div>
  );
};
