/**
 * SMART ELEC — Modern Desktop Navigation Sidebar
 * Clean, structured sidebar with emerald accents and modern spacing.
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
  PlusIcon,
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
            ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
        }`}
      >
        <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>{icon}</span>
        <span className="flex-1 truncate">{label}</span>
        {count !== undefined && (
          <span className="font-mono text-[10px] text-slate-400 px-1.5 py-0.5 rounded-full bg-slate-800">
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
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 z-40 flex flex-col w-60 bg-slate-950 text-slate-200 border-r border-slate-800/80 transition-transform duration-200 ease-in-out md:translate-x-0 select-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 rtl:translate-x-full md:rtl:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ZapIcon className="w-4 h-4 fill-current" />
            </span>
            <div>
              <div className="text-sm font-bold tracking-tight text-white leading-none font-sans">
                SMART ELEC
              </div>
              <div className="text-[10px] font-mono text-emerald-400 leading-none mt-1">
                ENGINEERING V1.0
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Action: Quick "New Project" Wizard Button */}
        <div className="p-3 border-b border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              setActiveTab('wizard');
              setSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 h-9 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{t('nav.newProject')}</span>
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* General Section */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-semibold tracking-wider uppercase text-slate-500">
              Général
            </div>
            <div className="space-y-0.5">
              {generalItems.map(item => renderNavButton(item.tab, t(item.labelKey), item.icon))}
            </div>
          </div>

          {/* Project Calculations Section */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-semibold tracking-wider uppercase text-slate-500 flex items-center justify-between">
              <span>Études Électriques</span>
              {currentProject && (
                <span className="text-[9px] font-mono text-emerald-400">ACTIF</span>
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
            <div className="px-2 pb-1.5 text-[10px] font-semibold tracking-wider uppercase text-slate-500">
              Base & Édition
            </div>
            <div className="space-y-0.5">
              {toolsItems.map(item => renderNavButton(item.tab, t(item.labelKey), item.icon))}
            </div>
          </div>
        </nav>

        {/* Standards & Regulatory Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 text-[11px] text-slate-400 space-y-1">
          <div className="text-slate-300 font-semibold text-[10px] uppercase tracking-wider">
            Normes & Référentiels
          </div>
          <div className="font-mono text-[10px] text-slate-400">
            CEI 60364 • CEI 60909 • ISO 8528
          </div>
          <div className="text-slate-500 text-[10px]">
            Conforme CREG / Sonelgaz
          </div>
        </div>
      </aside>
    </>
  );
};
