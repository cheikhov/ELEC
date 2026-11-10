/**
 * SMART ELEC — Modern B2B SaaS Application Header
 * Adaptive theme, vibrant tech accents, refined project context switcher, and streamlined controls.
 */

import React from 'react';
import { useApp } from '../../stores/appStore';
import { useProjects } from '../../stores/projectStore';
import { useI18n } from '../../i18n';
import { MenuIcon, SunIcon, MoonIcon, AlertTriangleIcon, ChevronDownIcon, PlusIcon } from '../ui/Icons';
import { StatusBadge } from '../ui/StatusBadge';

export const Header: React.FC = () => {
  const { theme, toggleTheme, toggleSidebar, currentUser, setActiveTab } = useApp();
  const { currentProject, projects, setCurrentProjectId } = useProjects();
  const { language, setLanguage, t } = useI18n();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200/90 dark:border-[#1a2234] bg-white/90 dark:bg-[#0a0e18]/90 backdrop-blur-md px-4 sm:px-6 select-none shadow-xs transition-colors duration-150">
      {/* Left side: Hamburger + Active Project Selector */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="md:hidden p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#141c2e] focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        {/* Project Context Toolbar */}
        {currentProject ? (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t('nav.projects')} :
            </span>
            <div className="relative">
              <select
                value={currentProject.id}
                onChange={e => setCurrentProjectId(e.target.value)}
                className="h-8 text-xs font-semibold text-slate-900 dark:text-slate-100 bg-slate-100/80 dark:bg-[#111726] border border-slate-200 dark:border-[#1e293b] rounded-lg py-1 pl-3 pr-7 max-w-[190px] sm:max-w-xs truncate focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer appearance-none transition-colors"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-[#0e1422] text-slate-900 dark:text-slate-100">
                    {p.name} {p.isDemo ? ' [DEMO]' : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <ChevronDownIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            <StatusBadge status={currentProject.status} />

            {currentProject.isDemo && (
              <span className="hidden lg:inline-flex text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                DEMO
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-medium">
            {t('dashboard.noProjectsTitle')}
          </div>
        )}
      </div>

      {/* Center: Hospital Critical Notice Banner */}
      {currentProject?.projectType === 'hospital' && (
        <button
          onClick={() => setActiveTab('power_balance')}
          className="hidden md:flex items-center gap-2 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full cursor-pointer hover:bg-amber-500/20 transition-all shadow-xs"
          title={t('hospital.warningText')}
        >
          <AlertTriangleIcon className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="truncate max-w-sm font-semibold">{t('hospital.warningTitle')}</span>
        </button>
      )}

      {/* Right side: Deduplicated Actions (ONE Primary + Controls Container) */}
      <div className="flex items-center gap-3">
        {/* ONE Primary Action Button */}
        <button
          type="button"
          onClick={() => setActiveTab('wizard')}
          className="eng-btn-primary"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Nouveau projet</span>
        </button>

        {/* Controls Container: Language, Theme & Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-[#1a2234]">
          {/* Language selector */}
          <div className="flex items-center bg-slate-100 dark:bg-[#111726] border border-slate-200/90 dark:border-[#1e293b] rounded-lg p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setLanguage('fr')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                language === 'fr'
                  ? 'bg-white dark:bg-[#1a233a] text-slate-900 dark:text-white font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                language === 'ar'
                  ? 'bg-white dark:bg-[#1a233a] text-slate-900 dark:text-white font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              العربية
            </button>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#111726] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-[#1e293b]"
            aria-label="Toggle Theme"
            title={theme === 'light' ? t('common.darkMode') : t('common.lightMode')}
          >
            {theme === 'light' ? <MoonIcon className="w-4 h-4 text-slate-600" /> : <SunIcon className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Engineer Profile Avatar */}
          <div className="hidden sm:flex items-center gap-2 pl-1 text-xs">
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold flex items-center justify-center text-xs shadow-xs ring-2 ring-emerald-500/20">
              AB
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-[#0a0e18]" />
            </div>
            <div className="hidden lg:block text-left">
              <div className="font-bold text-slate-900 dark:text-slate-100 leading-none">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-none">
                Ingénieur d'Études
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
