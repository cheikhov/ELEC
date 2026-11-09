/**
 * SMART ELEC — Main Shell Layout
 * Modern, high-density desktop workspace with sleek header, sidebar, and content area.
 */

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useI18n } from '../../i18n';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isRTL } = useI18n();

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans ${isRTL ? 'rtl' : 'ltr'}`}>
      <Sidebar />

      {/* Main content wrapper shifted by sidebar width (60 = 240px) */}
      <div className="flex-1 flex flex-col md:pl-60 rtl:md:pl-0 rtl:md:pr-60 transition-all min-w-0">
        <Header />

        <main className="flex-1 p-4 sm:p-6 md:p-8 w-full mx-auto max-w-7xl">
          {children}
        </main>

        <footer className="py-3 px-6 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 select-none">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span>SMART ELEC &copy; 2026 — Outil d'aide à la décision technique pour professionnels de l'électricité</span>
            <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">CEI 60364 • CEI 60909 • Non-contractuel sans validation d'ingénieur</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
