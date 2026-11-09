/**
 * SMART ELEC — Modern B2B SaaS Application Header
 * Inspired by Tailwind UI / shadcn/ui dark mode.
 * Hosts active project selector, primary "+ Nouveau projet" action, language, theme, and profile.
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
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-4 sm:px-6 select-none">
      {/* Left side: Hamburger + Active Project Selector */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="md:hidden p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        {/* Project Context Toolbar */}
        {currentProject ? (
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t('nav.projects')} :
            </span>
            <div className="relative">
              <select
                value={currentProject.id}
                onChange={e => setCurrentProjectId(e.target.value)}
                className="h-8 text-xs font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-1 pl-3 pr-7 max-w-[200px] sm:max-w-xs truncate focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer appearance-none"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isDemo ? ' [DEMO]' : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
                <ChevronDownIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            <StatusBadge status={currentProject.status} />

            {currentProject.isDemo && (
              <span className="hidden lg:inline-flex text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                DEMO
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs text-zinc-500">
            {t('dashboard.noProjectsTitle')}
          </div>
        )}
      </div>

      {/* Center: Hospital Critical Notice Banner */}
      {currentProject?.projectType === 'hospital' && (
        <button
          onClick={() => setActiveTab('power_balance')}
          className="hidden md:flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full cursor-pointer hover:bg-amber-500/20 transition-colors"
          title={t('hospital.warningText')}
        >
          <AlertTriangleIcon className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="truncate max-w-sm font-medium">{t('hospital.warningTitle')}</span>
        </button>
      )}

      {/* Right side: Deduplicated Actions (ONE Primary + Nouveau Projet Button + Controls Container) */}
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
        <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
          {/* Language selector */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setLanguage('fr')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                language === 'fr'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                language === 'ar'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              العربية
            </button>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            aria-label="Toggle Theme"
            title={theme === 'light' ? t('common.darkMode') : t('common.lightMode')}
          >
            {theme === 'light' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Engineer Profile Avatar */}
          <div className="hidden sm:flex items-center gap-2 pl-1 text-xs">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-medium flex items-center justify-center text-xs shadow-xs">
              AB
            </div>
            <div className="hidden lg:block text-left">
              <div className="font-medium text-zinc-900 dark:text-zinc-100 leading-none">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-none">
                Ingénieur d'Études
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
