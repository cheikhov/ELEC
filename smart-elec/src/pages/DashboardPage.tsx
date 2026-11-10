/**
 * SMART ELEC — Modern B2B Engineering Dashboard
 * Eye-strain-free, high-vibrancy design system inspired by Linear & Vercel.
 * Precision engineering metrics, mission control active project showcase, and dense data tables.
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
  ZapIcon,
  ShieldIcon,
  CpuIcon,
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
  const inProgressProjects = projects.filter(p => p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');
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
      {/* Page Title & Normative Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200/90 dark:border-[#1a2234]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('dashboard.title')}
            </h1>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#111726] text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-[#1e2a42]">
              CEI 60364 / CEI 60909
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supervision technique des études électriques et conformité réglementaire des installations
          </p>
        </div>

        {projects.length === 0 && (
          <button
            type="button"
            onClick={handleLoadDemo}
            className="eng-btn"
          >
            <FolderIcon className="w-4 h-4 text-emerald-500" />
            <span>Charger projet démo</span>
          </button>
        )}
      </div>

      {/* Hospital Safety Alert */}
      {hospitalProjects.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-start gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangleIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <span>{t('hospital.warningTitle')}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-semibold">CEI 60364-7-710</span>
            </div>
            <p className="text-amber-800 dark:text-amber-300/90 mt-1 leading-relaxed">
              {t('hospital.warningText')} (Schéma IT Médical obligatoire pour locaux du groupe 2 et alimentation de secours autonome temps nul requise).
            </p>
          </div>
        </div>
      )}

      {/* Bento Grid: 4 Metric Cards */}
      {totalProjects > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Projects */}
          <div className="group p-5 rounded-2xl border border-slate-200/90 dark:border-[#1a2234] hover:border-emerald-500/50 dark:hover:border-emerald-500/40 bg-white dark:bg-[#0c1220] shadow-card dark:shadow-card-dark transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('dashboard.totalProjects')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white mt-3">
              {totalProjects}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                {inProgressProjects.length} en cours
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {completedProjects.length} validés
              </span>
            </div>
          </div>

          {/* Card 2: Attention Warnings */}
          <div className="group p-5 rounded-2xl border border-slate-200/90 dark:border-[#1a2234] hover:border-amber-500/50 dark:hover:border-amber-500/40 bg-white dark:bg-[#0c1220] shadow-card dark:shadow-card-dark transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('dashboard.projectsAttention')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertTriangleIcon className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-3xl font-extrabold font-mono tracking-tight mt-3 ${projectsWithWarnings.length > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
              {projectsWithWarnings.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>{hospitalProjects.length} dossier(s) critique(s) / points de vigilance</span>
            </div>
          </div>

          {/* Card 3: Calculations Executed */}
          <div className="group p-5 rounded-2xl border border-slate-200/90 dark:border-[#1a2234] hover:border-indigo-500/50 dark:hover:border-indigo-500/40 bg-white dark:bg-[#0c1220] shadow-card dark:shadow-card-dark transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('dashboard.recentCalculations')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CalculatorIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white mt-3 flex items-baseline gap-2">
              <span>{currentProject?.calculations.powerBalance ? '4/4' : '0/4'}</span>
              <span className="text-xs font-sans font-semibold text-emerald-600 dark:text-emerald-400">
                {currentProject?.calculations.powerBalance ? '100% calculé' : 'en attente'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              <span>Bilan, Groupe, Câble, Protection</span>
            </div>
          </div>

          {/* Card 4: Reports */}
          <div className="group p-5 rounded-2xl border border-slate-200/90 dark:border-[#1a2234] hover:border-sky-500/50 dark:hover:border-sky-500/40 bg-white dark:bg-[#0c1220] shadow-card dark:shadow-card-dark transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('dashboard.reportsGenerated')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileTextIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white mt-3">
              {projects.length}
            </div>
            <div className="text-xs text-sky-600 dark:text-sky-400 mt-2 font-medium">
              Notes techniques PDF prêtes à l'export
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

      {/* Active Project Mission Control Showcase */}
      {currentProject && (
        <div className="rounded-2xl border border-slate-200/90 dark:border-[#1a2234] bg-white dark:bg-[#0c1220] shadow-card dark:shadow-card-dark overflow-hidden">
          {/* Header of Active Project */}
          <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-[#162035] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse" />
                  Projet actif
                </span>
                <StatusBadge status={currentProject.status} />
                {currentProject.isDemo && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    DEMO
                  </span>
                )}
                {currentProject.projectType === 'hospital' && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                    ÉTABLISSEMENT DE SANTÉ
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {currentProject.name}
              </h2>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                <span>Client : <strong className="font-semibold text-slate-800 dark:text-slate-200">{currentProject.client}</strong></span>
                <span>•</span>
                <span>Lieu : <span className="text-slate-700 dark:text-slate-300">{currentProject.address}</span></span>
                <span>•</span>
                <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#141d30] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#1e2a42]">
                  {currentProject.network.supplyVoltage}V {currentProject.network.phaseType === 'three_phase' ? '3P+N' : '1P+N'} • {currentProject.network.frequency}Hz • Régime {currentProject.network.neutralSystem}
                </span>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('loads')}
                className="eng-btn"
              >
                <BoxIcon className="w-4 h-4 text-slate-500" />
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
                <FileTextIcon className="w-4 h-4 text-slate-500" />
                <span>Note PDF</span>
              </button>
            </div>
          </div>

          {/* Balanced 6-Tile Technical Metric Ribbon */}
          {currentProject.calculations.powerBalance ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 sm:p-5 bg-slate-50/70 dark:bg-[#080d17]/80">
              {/* Tile 1: Installed Power */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-[#1e293b] shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">P. installée</div>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {formatPower(currentProject.calculations.powerBalance.installedPower_kW, 'kW')}
                </div>
              </div>

              {/* Tile 2: Demand Power (HIGHLIGHTED VIBRANT) */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/35 shadow-xs text-emerald-700 dark:text-emerald-400">
                <div className="text-[11px] font-bold flex items-center justify-between">
                  <span>P. demandée (P)</span>
                  <ZapIcon className="w-3.5 h-3.5 fill-current" />
                </div>
                <div className="text-base font-bold font-mono mt-1">
                  {formatPower(currentProject.calculations.powerBalance.demandPower_kW, 'kW')}
                </div>
              </div>

              {/* Tile 3: Apparent Power */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-[#1e293b] shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">P. apparente (S)</div>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {currentProject.calculations.powerBalance.apparentPower_kVA} <span className="text-xs font-normal text-slate-400">kVA</span>
                </div>
              </div>

              {/* Tile 4: Design Current */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-[#1e293b] shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Courant assigné (Ib)</div>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {formatCurrent(currentProject.calculations.powerBalance.estimatedCurrent_A)}
                </div>
              </div>

              {/* Tile 5: Generator Sizing */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-[#1e293b] shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Secours GE</span>
                  <CpuIcon className="w-3 h-3 text-amber-500" />
                </div>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {currentProject.calculations.generatorSizing?.recommendedSize_kVA ? `${currentProject.calculations.generatorSizing.recommendedSize_kVA} kVA` : '—'}
                </div>
              </div>

              {/* Tile 6: Proposed Cable Section */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-[#1e293b] shadow-xs">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Section câble</span>
                  <ShieldIcon className="w-3 h-3 text-emerald-500" />
                </div>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {currentProject.calculations.cableSizing[0]?.proposedSection_mm2 ? `${currentProject.calculations.cableSizing[0].proposedSection_mm2} mm²` : '—'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50/50 dark:bg-[#080d17]/80">
              Aucune charge définie pour ce projet. Saisissez vos récepteurs dans l'onglet « Saisie des charges ».
            </div>
          )}
        </div>
      )}

      {/* 5. Recent Projects Data Table */}
      {recentProjects.length > 0 && (
        <div className="rounded-2xl border border-slate-200/90 dark:border-[#1a2234] bg-white dark:bg-[#0c1220] shadow-card dark:shadow-card-dark overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-[#162035] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('dashboard.recentProjects')}
              </h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#141d30] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1e2a42]">
                {projects.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
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
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                              HÔPITAL
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-slate-600 dark:text-slate-400 font-medium">{p.client}</td>
                      <td className="text-slate-600 dark:text-slate-400">{t(`projects.types.${p.projectType}`)}</td>
                      <td className="font-mono text-slate-700 dark:text-slate-300 text-xs font-medium">
                        {p.network.supplyVoltage}V {p.network.phaseType === 'three_phase' ? '3P+N' : '1P+N'}
                      </td>
                      <td className="text-center">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="font-mono text-slate-500 dark:text-slate-400 text-xs">
                        {formatDate(p.updatedAt)}
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1 group-hover:underline"
                        >
                          <span>{t('common.open')}</span>
                          <ArrowRightIcon className="w-3.5 h-3.5" />
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
