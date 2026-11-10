/**
 * SMART ELEC — Modern Projects Management Page
 * Section 5: Filterable data table, instant search, modern actions.
 * Inspired by Tailwind UI / shadcn/ui dark mode.
 */

import React, { useState, useMemo } from 'react';
import { useProjects } from '../stores/projectStore';
import { useApp } from '../stores/appStore';
import { useI18n } from '../i18n';
import type { ProjectType, ProjectStatus } from '../types';
import { formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import {
  FolderIcon,
  TrashIcon,
  CopyIcon,
  AlertTriangleIcon,
  SearchIcon,
} from '../components/ui/Icons';

export const ProjectsPage: React.FC = () => {
  const { projects, currentProjectId, setCurrentProjectId, duplicateProject, deleteProject, loadDemo } = useProjects();
  const { setActiveTab, notify } = useApp();
  const { t } = useI18n();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ProjectType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch =
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = filterType === 'all' || p.projectType === filterType;
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [projects, searchTerm, filterType, filterStatus]);

  const handleOpenProject = (id: string) => {
    setCurrentProjectId(id);
    setActiveTab('power_balance');
  };

  const handleDuplicate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    duplicateProject(id);
    notify('Projet dupliqué avec succès', 'success');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(t('projects.confirmDelete'))) {
      deleteProject(id);
      notify('Projet supprimé', 'info');
    }
  };

  const handleLoadDemo = () => {
    loadDemo();
    notify('Projet démo (Hôpital Naama) chargé avec succès', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200/90 dark:border-[#1a2234]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('projects.title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {filteredProjects.length} projet(s) répertorié(s) • Base de données locale sécurisée
          </p>
        </div>

        {projects.length === 0 && (
          <button
            type="button"
            onClick={handleLoadDemo}
            className="eng-btn"
          >
            Charger projet démo
          </button>
        )}
      </div>

      {/* Modern Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/90 dark:border-[#1a2234] shadow-card dark:shadow-card-dark flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={t('projects.searchPlaceholder')}
            className="eng-input w-full pl-9"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
            <SearchIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as any)}
            className="eng-input cursor-pointer text-xs"
          >
            <option value="all">{t('projects.filterType')} : {t('common.all')}</option>
            <option value="residential">{t('projects.types.residential')}</option>
            <option value="commercial">{t('projects.types.commercial')}</option>
            <option value="tertiary">{t('projects.types.tertiary')}</option>
            <option value="industrial">{t('projects.types.industrial')}</option>
            <option value="agricultural">{t('projects.types.agricultural')}</option>
            <option value="hospital">{t('projects.types.hospital')}</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="eng-input cursor-pointer text-xs"
          >
            <option value="all">{t('projects.filterStatus')} : {t('common.all')}</option>
            <option value="draft">{t('projects.status.draft')}</option>
            <option value="in_progress">{t('projects.status.in_progress')}</option>
            <option value="completed">{t('projects.status.completed')}</option>
            <option value="archived">{t('projects.status.archived')}</option>
          </select>

          {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterStatus('all');
              }}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Modern Data Table */}
      {filteredProjects.length > 0 ? (
        <div className="rounded-2xl border border-slate-200/90 dark:border-[#1a2234] bg-white dark:bg-[#0c1220] shadow-card dark:shadow-card-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="eng-table">
              <thead>
                <tr>
                  <th className="w-1/4">{t('projects.colName')}</th>
                  <th>{t('projects.colClient')}</th>
                  <th>{t('projects.colType')}</th>
                  <th>{t('projects.colVoltage')}</th>
                  <th className="text-center">{t('projects.colStatus')}</th>
                  <th>{t('projects.colLastModified')}</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(p => {
                  const isCurrent = p.id === currentProjectId;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleOpenProject(p.id)}
                      className={`cursor-pointer ${
                        isCurrent
                          ? 'border-l-2 border-emerald-500 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08]'
                          : ''
                      }`}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</span>
                          {p.isDemo && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              DEMO
                            </span>
                          )}
                          {p.projectType === 'hospital' && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 flex items-center gap-1">
                              <AlertTriangleIcon className="w-2.5 h-2.5" />
                              Hôpital
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-sm mt-0.5">
                          {p.description || p.address}
                        </div>
                      </td>

                      <td>
                        <div className="text-slate-800 dark:text-slate-200 font-semibold">{p.client}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">{p.address}</div>
                      </td>

                      <td className="text-slate-600 dark:text-slate-400 font-medium">
                        {t(`projects.types.${p.projectType}`)}
                      </td>

                      <td className="font-mono text-slate-700 dark:text-slate-300 text-xs">
                        <div>{p.network.supplyVoltage} V {p.network.phaseType === 'three_phase' ? 'Triphasé' : 'Monophasé'}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">{p.network.neutralSystem || 'SLT non défini'} • {p.network.frequency} Hz</div>
                      </td>

                      <td className="text-center">
                        <StatusBadge status={p.status} />
                      </td>

                      <td className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        <div>{formatDate(p.updatedAt)}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">Créé : {formatDate(p.createdAt)}</div>
                      </td>

                      <td className="text-right">
                        <div className="inline-flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenProject(p.id)}
                            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 px-2 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40 mr-1"
                          >
                            Ouvrir &rarr;
                          </button>
                          <button
                            type="button"
                            onClick={e => handleDuplicate(e, p.id)}
                            title={t('common.duplicate')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141d30] transition-colors cursor-pointer"
                          >
                            <CopyIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={e => handleDelete(e, p.id)}
                            title={t('common.delete')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<FolderIcon className="w-6 h-6" />}
          title={t('projects.emptyTitle')}
          description={t('projects.emptyDesc')}
          actionLabel="Créer un nouveau projet"
          onAction={() => setActiveTab('wizard')}
          secondaryActionLabel={projects.length === 0 ? t('dashboard.loadDemoBtn') : undefined}
          onSecondaryAction={projects.length === 0 ? loadDemo : undefined}
        />
      )}
    </div>
  );
};
