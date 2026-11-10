/**
 * SMART ELEC — Modern B2B Navigation Sidebar
 * Adaptive theme (clean light slate / deep twilight dark) to eliminate eye-strain.
 * Vibrant emerald & electric tech accents with high information density.
 */

import React from 'react';
import { useApp, type NavigationTab } from '../../stores/appStore';
import { useProjects } from '../../stores/projectStore';
import { useI18n } from '../../i18n';
import {
  ZapIcon,
  DashboardIcon,
  FolderIcon,
  CalculatorIcon,
  CpuIcon,
  CableIcon,
  ShieldIcon,
  BoxIcon,
  FileTextIcon,
  XIcon,
} from '../ui/Icons';

export const Sidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen, activeTab, setActiveTab } = useApp();
  const { currentProject } = useProjects();
  const { t } = useI18n();

  const generalItems: { tab: NavigationTab; labelKey: string; icon: React.ReactNode }[] = [
    { tab: 'dashboard', labelKey: 'nav.dashboard', icon: <DashboardIcon className="w-4 h-4" /> },
    { tab: 'projects', labelKey: 'nav.projects', icon: <FolderIcon className="w-4 h-4" /> },
  ];

  const calculationItems: { tab: NavigationTab; labelKey: string; icon: React.ReactNode }[] = [
    { tab: 'loads', labelKey: 'nav.loads', icon: <BoxIcon className="w-4 h-4" /> },
    { tab: 'power_balance', labelKey: 'nav.powerBalance', icon: <CalculatorIcon className="w-4 h-4" /> },
    { tab: 'generator', labelKey: 'nav.generator', icon: <CpuIcon className="w-4 h-4" /> },
    { tab: 'cable', labelKey: 'nav.cable', icon: <CableIcon className="w-4 h-4" /> },
    { tab: 'protection', labelKey: 'nav.protection', icon: <ShieldIcon className="w-4 h-4" /> },
  ];

  const toolsItems: { tab: NavigationTab; labelKey: string; icon: React.ReactNode }[] = [
    { tab: 'equipment', labelKey: 'nav.equipment', icon: <BoxIcon className="w-4 h-4" /> },
    { tab: 'reports', labelKey: 'nav.reports', icon: <FileTextIcon className="w-4 h-4" /> },
  ];

  const renderNavButton = (tab: NavigationTab, label: string, icon: React.ReactNode, count?: number) => {
    const isActive = activeTab === tab;
    return (
      <button
        key={tab}
        type="button"
        onClick={() => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-left rtl:text-right rounded-lg transition-all duration-150 cursor-pointer ${
          isActive
            ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 dark:border-emerald-500/35 font-semibold shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-[#131c2e] border border-transparent'
        }`}
      >
        <span
          className={`shrink-0 transition-colors ${
            isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          {icon}
        </span>
        <span className="flex-1 truncate">{label}</span>
        {count !== undefined && (
          <span
            className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              isActive
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950'
                : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 z-40 flex flex-col w-60 bg-white dark:bg-[#0a0e18] text-slate-800 dark:text-slate-200 border-r border-slate-200/90 dark:border-[#1a2234] transition-all duration-200 ease-in-out md:translate-x-0 select-none shadow-xs ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 rtl:translate-x-full md:rtl:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-slate-200/90 dark:border-[#1a2234]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm shadow-emerald-500/25">
              <ZapIcon className="w-4 h-4 fill-current text-white" />
            </span>
            <div>
              <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                SMART ELEC
              </div>
              <div className="text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 leading-none mt-1">
                ENGINEERING V1.0
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* General Section */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              Général
            </div>
            <div className="space-y-0.5">
              {generalItems.map(item => renderNavButton(item.tab, t(item.labelKey), item.icon))}
            </div>
          </div>

          {/* Project Calculations Section */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Études Électriques</span>
              {currentProject && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  ACTIF
                </span>
              )}
            </div>
            <div className="space-y-0.5">
              {calculationItems.map(item =>
                renderNavButton(
                  item.tab,
                  t(item.labelKey),
                  item.icon,
                  item.tab === 'loads' ? currentProject?.loads.length : undefined
                )
              )}
            </div>
          </div>

          {/* Tools & Outputs */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              Base & Édition
            </div>
            <div className="space-y-0.5">
              {toolsItems.map(item => renderNavButton(item.tab, t(item.labelKey), item.icon))}
            </div>
          </div>
        </nav>

        {/* Standards & Regulatory Footer */}
        <div className="p-3.5 border-t border-slate-200/90 dark:border-[#1a2234] bg-slate-50/70 dark:bg-[#0c1220] text-xs space-y-1">
          <div className="text-slate-700 dark:text-slate-300 font-semibold text-[11px] uppercase tracking-wider flex items-center justify-between">
            <span>Normes & Référentiels</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
            CEI 60364 • CEI 60909 • ISO 8528
          </div>
          <div className="text-slate-400 dark:text-slate-500 text-[10px]">
            Conforme CREG / Sonelgaz
          </div>
        </div>
      </aside>
    </>
  );
};
