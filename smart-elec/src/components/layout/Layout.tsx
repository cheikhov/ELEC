/**
 * SMART ELEC — Main Shell Layout
 * Inspired by Tailwind UI / shadcn/ui.
 * Clean zinc dark background (#09090b) with fluid content padding.
 */

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StudyStepper } from './StudyStepper';
import { ToastContainer } from '../ui/ToastContainer';
import { useI18n } from '../../i18n';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isRTL } = useI18n();

  return (
    <div className={`min-h-screen bg-[#f8fafc] dark:bg-[#080c14] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white transition-colors duration-150 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Sidebar />

      {/* Main content wrapper shifted by sidebar width (60 = 240px) */}
      <div className="flex-1 flex flex-col md:pl-60 rtl:md:pl-0 rtl:md:pr-60 transition-all min-w-0">
        <Header />

        <main className="flex-1 p-5 sm:p-6 md:p-8 w-full mx-auto max-w-7xl">
          <StudyStepper />
          {children}
        </main>

        <footer className="py-4 px-6 border-t border-slate-200/90 dark:border-[#1a2234] text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-[#0a0e18]/80 backdrop-blur-sm select-none">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span className="font-medium text-slate-600 dark:text-slate-400">SMART ELEC &copy; 2026 — Outil d'aide à la décision technique pour professionnels de l'électricité</span>
            <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">CEI 60364 • CEI 60909 • Non-contractuel sans validation d'ingénieur</span>
          </div>
        </footer>
      </div>

      <ToastContainer />
    </div>
  );
};
