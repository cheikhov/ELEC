/**
 * SMART ELEC — Modern B2B Navigation Sidebar
 * Inspired by Tailwind UI / shadcn/ui.
 * Clean zinc palette (#09090b / #18181b / #27272a) with emerald active accents.
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
        className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-left rtl:text-right rounded-lg transition-all cursor-pointer ${
          isActive
            ? 'bg-zinc-900 text-zinc-100 font-semibold shadow-xs'
            : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100'
        }`}
      >
        <span className={isActive ? 'text-emerald-400' : 'text-zinc-400'}>{icon}</span>
        <span className="flex-1 truncate">{label}</span>
        {count !== undefined && (
          <span className="font-mono text-[10px] text-zinc-400 px-1.5 py-0.5 rounded-full bg-zinc-800">
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
          className="fixed inset-0 z-30 bg-zinc-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 z-40 flex flex-col w-60 bg-zinc-950 text-zinc-200 border-r border-zinc-800 transition-transform duration-200 ease-in-out md:translate-x-0 select-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 rtl:translate-x-full md:rtl:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ZapIcon className="w-4 h-4 fill-current" />
            </span>
            <div>
              <div className="text-sm font-semibold tracking-tight text-white leading-none font-sans">
                SMART ELEC
              </div>
              <div className="text-[10px] font-mono text-zinc-400 leading-none mt-1">
                ENGINEERING V1.0
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-md"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* General Section */}
          <div>
            <div className="px-2 pb-2 text-[11px] font-medium tracking-wider uppercase text-zinc-500">
              Général
            </div>
            <div className="space-y-1">
              {generalItems.map(item => renderNavButton(item.tab, t(item.labelKey), item.icon))}
            </div>
          </div>

          {/* Project Calculations Section */}
          <div>
            <div className="px-2 pb-2 text-[11px] font-medium tracking-wider uppercase text-zinc-500 flex items-center justify-between">
              <span>Études Électriques</span>
              {currentProject && (
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">ACTIF</span>
              )}
            </div>
            <div className="space-y-1">
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
            <div className="px-2 pb-2 text-[11px] font-medium tracking-wider uppercase text-zinc-500">
              Base & Édition
            </div>
            <div className="space-y-1">
              {toolsItems.map(item => renderNavButton(item.tab, t(item.labelKey), item.icon))}
            </div>
          </div>
        </nav>

        {/* Standards & Regulatory Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 text-xs text-zinc-400 space-y-1">
          <div className="text-zinc-300 font-medium text-[11px] uppercase tracking-wider">
            Normes & Référentiels
          </div>
          <div className="font-mono text-[11px] text-zinc-400">
            CEI 60364 • CEI 60909 • ISO 8528
          </div>
          <div className="text-zinc-500 text-[11px]">
            Conforme CREG / Sonelgaz
          </div>
        </div>
      </aside>
    </>
  );
};
