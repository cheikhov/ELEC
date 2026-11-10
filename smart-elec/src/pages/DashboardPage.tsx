/**
 * SMART ELEC — Modern B2B Engineering Dashboard
 * Inspired by Tailwind UI & shadcn/ui dark mode.
 * Section 5 & 23: Precision metrics, project health alerts, modern data tables.
 */

import React from 'react';
import { useProjects } from '../stores/projectStore';
import { useApp } from '../stores/appStore';
import { useI18n } from '../i18n';
import { formatPower, formatCurrent, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import {
  FolderIcon,
  CalculatorIcon,
  AlertTriangleIcon,
  FileTextIcon,
  BoxIcon,
  ArrowRightIcon,
} from '../components/ui/Icons';

export const DashboardPage: React.FC = () => {
  const { projects, currentProject, setCurrentProjectId, loadDemo } = useProjects();
  const { setActiveTab, notify } = useApp();
  const { t } = useI18n();

  const handleLoadDemo = () => {
    loadDemo();
    notify('Projet démo (Hôpital Naama) chargé avec succès', 'success');
  };

  const totalProjects = projects.length;
  const hospitalProjects = projects.filter(p => p.projectType === 'hospital');
  const projectsWithWarnings = projects.filter(p => {
    const pbWarnings = p.calculations.powerBalance?.trace.warnings.length || 0;
    const cableWarnings = p.calculations.cableSizing.some(c =>
      c.criteriaResults.some(r => r.status === 'warning' || r.status === 'fail')
    );
    return p.projectType === 'hospital' || pbWarnings > 0 || cableWarnings;
  });

  const recentProjects = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Page Header (No duplicate + Nouveau projet button, since it is in the top header) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t('dashboard.title')}
            </h1>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              CEI 60364 / CEI 60909
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Supervision technique des études électriques et conformité des installations
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

      {/* Hospital Safety Alert */}
      {hospitalProjects.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <AlertTriangleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-semibold text-amber-900 dark:text-amber-300">
              {t('hospital.warningTitle')} :
            </span>{' '}
            <span className="text-amber-800 dark:text-amber-400">
              {t('hospital.warningText')} (Norme CEI 60364-7-710 • Schéma IT Médical requis pour locaux du groupe 2).
            </span>
          </div>
        </div>
      )}

      {/* 3. Cards & Stat Metrics (shadcn / Tailwind UI Style) */}
      {totalProjects > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Projects */}
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors bg-white dark:bg-zinc-900 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {t('dashboard.totalProjects')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
                <FolderIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-3">
              {totalProjects}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {projects.filter(p => p.status === 'in_progress').length} en cours • {projects.filter(p => p.status === 'completed').length} validés
            </div>
          </div>

          {/* Card 2: Attention Warnings */}
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors bg-white dark:bg-zinc-900 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {t('dashboard.projectsAttention')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <AlertTriangleIcon className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-2xl font-semibold font-mono mt-3 ${projectsWithWarnings.length > 0 ? 'text-amber-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
              {projectsWithWarnings.length}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {hospitalProjects.length} hospitalier(s) / points de vigilance
            </div>
          </div>

          {/* Card 3: Calculations Executed */}
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors bg-white dark:bg-zinc-900 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {t('dashboard.recentCalculations')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CalculatorIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-3">
              {currentProject?.calculations.powerBalance ? '4/4' : '0/4'}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Bilan, Groupe, Câble, Protection
            </div>
          </div>

          {/* Card 4: Reports */}
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors bg-white dark:bg-zinc-900 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {t('dashboard.reportsGenerated')}
              </span>
              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
                <FileTextIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-3">
              {projects.length}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Notes de calcul PDF prêtes
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<FolderIcon className="w-6 h-6" />}
          title={t('dashboard.noProjectsTitle')}
          description={t('dashboard.noProjectsDesc')}
          actionLabel="Créer un nouveau projet"
          onAction={() => setActiveTab('wizard')}
          secondaryActionLabel={t('dashboard.loadDemoBtn')}
          onSecondaryAction={loadDemo}
        />
      )}

      {/* 4. Active Project Banner: Sleek summary header card with a subtle border highlight */}
      {currentProject && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-card overflow-hidden">
          {/* Header of Active Project */}
          <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Projet actif
                </span>
                <StatusBadge status={currentProject.status} />
                {currentProject.isDemo && (
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    DEMO
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {currentProject.name}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {currentProject.client} • {currentProject.address} • Réseau : <strong className="font-mono text-zinc-700 dark:text-zinc-300">{currentProject.network.supplyVoltage}V {currentProject.network.phaseType === 'three_phase' ? '3P+N' : '1P+N'} • {currentProject.network.frequency}Hz</strong>
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('loads')}
                className="eng-btn"
              >
                <BoxIcon className="w-4 h-4" />
                <span>Charges ({currentProject.loads.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('power_balance')}
                className="eng-btn-primary"
              >
                <CalculatorIcon className="w-4 h-4" />
                <span>{t('nav.powerBalance')}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className="eng-btn"
              >
                <FileTextIcon className="w-4 h-4" />
                <span>Note PDF</span>
              </button>
            </div>
          </div>

          {/* Balanced, evenly spaced horizontal metric grid with clear labels above values */}
          {currentProject.calculations.powerBalance ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-5 bg-zinc-50/50 dark:bg-zinc-950/40">
              <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">P. installée</div>
                <div className="text-base font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                  {formatPower(currentProject.calculations.powerBalance.installedPower_kW, 'kW')}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/30">
                <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">P. demandée (P)</div>
                <div className="text-base font-semibold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatPower(currentProject.calculations.powerBalance.demandPower_kW, 'kW')}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">P. apparente (S)</div>
                <div className="text-base font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                  {currentProject.calculations.powerBalance.apparentPower_kVA} <span className="text-xs font-normal text-zinc-400">kVA</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Courant assigné (Ib)</div>
                <div className="text-base font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                  {formatCurrent(currentProject.calculations.powerBalance.estimatedCurrent_A)}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Secours GE recommandé</div>
                <div className="text-base font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                  {currentProject.calculations.generatorSizing?.recommendedSize_kVA ? `${currentProject.calculations.generatorSizing.recommendedSize_kVA} kVA` : '—'}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Section câble proposée</div>
                <div className="text-base font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                  {currentProject.calculations.cableSizing[0]?.proposedSection_mm2 ? `${currentProject.calculations.cableSizing[0].proposedSection_mm2} mm²` : '—'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 text-xs text-zinc-500 dark:text-zinc-400 italic">
              Aucune charge définie. Saisissez vos récepteurs dans l'onglet « Saisie des charges ».
            </div>
          )}
        </div>
      )}

      {/* 5. Table & Data Lists: Strictly adhering to dark theme */}
      {recentProjects.length > 0 && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-card overflow-hidden">
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t('dashboard.recentProjects')} ({projects.length})
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1.5"
            >
              <span>Voir la liste complète</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="eng-table">
              <thead>
                <tr>
                  <th>{t('projects.colName')}</th>
                  <th>{t('projects.colClient')}</th>
                  <th>{t('projects.colType')}</th>
                  <th>{t('projects.colVoltage')}</th>
                  <th className="text-center">{t('projects.colStatus')}</th>
                  <th>{t('projects.colLastModified')}</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map(p => {
                  const isCurrent = p.id === currentProject?.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => {
                        setCurrentProjectId(p.id);
                        setActiveTab('power_balance');
                      }}
                      className={`cursor-pointer ${isCurrent ? 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06]' : ''}`}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</span>
                          {p.isDemo && (
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              DEMO
                            </span>
                          )}
                          {p.projectType === 'hospital' && (
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              HÔPITAL
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-zinc-600 dark:text-zinc-400">{p.client}</td>
                      <td className="text-zinc-600 dark:text-zinc-400">{t(`projects.types.${p.projectType}`)}</td>
                      <td className="font-mono text-zinc-700 dark:text-zinc-300 text-xs">
                        {p.network.supplyVoltage}V {p.network.phaseType === 'three_phase' ? '3P+N' : '1P+N'}
                      </td>
                      <td className="text-center">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="font-mono text-zinc-500 dark:text-zinc-400 text-xs">
                        {formatDate(p.updatedAt)}
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentProjectId(p.id);
                            setActiveTab('power_balance');
                          }}
                          className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline inline-flex items-center gap-1"
                        >
                          <span>Ouvrir</span>
                          <span>&rarr;</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
