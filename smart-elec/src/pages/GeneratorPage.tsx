/**
 * SMART ELEC — Modern Generator Sizing Module Page
 * Section 9: Steady-state vs transient power, motor inrush analysis, configurable margin,
 * PRELIMINARY ESTIMATE badge, hospital safety notices.
 */

import React, { useState } from 'react';
import { useProjects } from '../stores/projectStore';
import { useApp } from '../stores/appStore';
import { useI18n } from '../i18n';
import { calculateGeneratorSizing } from '../engine/generatorSizing';
import { formatPower } from '../utils/formatters';
import { CalculationCard } from '../components/ui/CalculationCard';
import { EmptyState } from '../components/ui/EmptyState';
import {
  CpuIcon,
  AlertTriangleIcon,
  CableIcon,
} from '../components/ui/Icons';

export const GeneratorPage: React.FC = () => {
  const { currentProject, updateProject } = useProjects();
  const { setActiveTab } = useApp();
  const { t } = useI18n();

  const [marginPct, setMarginPct] = useState(15);

  if (!currentProject) {
    return (
      <EmptyState
        icon={<CpuIcon className="w-6 h-6" />}
        title="Aucun projet sélectionné"
        actionLabel={t('nav.projects')}
        onAction={() => setActiveTab('projects')}
      />
    );
  }

  const gen = calculateGeneratorSizing(currentProject.loads, currentProject.network, marginPct / 100);

  const handleUpdateMargin = (newMargin: number) => {
    setMarginPct(newMargin);
    const updatedGen = calculateGeneratorSizing(currentProject.loads, currentProject.network, newMargin / 100);
    updateProject(currentProject.id, {
      calculations: {
        ...currentProject.calculations,
        generatorSizing: updatedGen,
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('generator.title')}
            </h1>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              {t('generator.badge')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('generator.subtitle')} • CEI 60034 / ISO 8528
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('cable')}
            className="eng-btn-primary"
          >
            <CableIcon className="w-4 h-4" />
            <span>{t('nav.cable')} &rarr;</span>
          </button>
        </div>
      </div>

      {/* Hospital Warning per Section 18 */}
      {currentProject.projectType === 'hospital' && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 text-xs space-y-1.5">
          <div className="font-bold flex items-center gap-2 text-rose-800 dark:text-rose-300">
            <AlertTriangleIcon className="w-5 h-5 text-rose-500 shrink-0" />
            <span>AVERTISSEMENT HOSPITALIER : LE GROUPE ÉLECTROGÈNE NE SUFFIT PAS</span>
          </div>
          <p className="leading-relaxed">
            Ne déclarez pas automatiquement ce groupe électrogène suffisant pour l'hôpital.
            Les installations de santé imposent une alimentation de sécurité de classe 0.5s ou temps nul (ASI statique en ligne) pour les blocs opératoires, réanimations, soins intensifs et équipements de maintien de la vie (CEI 60364-7-710).
          </p>
        </div>
      )}

      {/* Configurable Margin Controls */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {t('generator.engineeringMargin')} (Configurable)
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Réserve de puissance pour extensions futures et usure alternateur (10% à 25%)
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/60 p-0.5 gap-0.5">
            {[10, 15, 20, 25].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => handleUpdateMargin(m)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                  marginPct === m
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                +{m}%
              </button>
            ))}
          </div>
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
            Marge : {marginPct}%
          </span>
        </div>
      </div>

      {/* Sizing KPIs: Steady-State vs Transient per Section 9 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <CalculationCard
          label={t('generator.steadyStatePower')}
          value={gen.steadyStatePower_kW}
          unit="kW"
          formula="P_essentiel + P_prioritaire"
          status="pass"
        />
        <CalculationCard
          label="Apparente Continue"
          value={gen.steadyStatePower_kVA}
          unit="kVA"
          formula="P_secours / cos φ_moyen"
          status="pass"
        />
        <CalculationCard
          label={t('generator.transientPower')}
          value={gen.transientPower_kVA}
          unit="kVA"
          formula="S_régime + Max(S_démarrage)"
          status={gen.transientPower_kVA > gen.steadyStatePower_kVA * 1.5 ? 'warning' : 'pass'}
          statusLabel={gen.transientPower_kVA > gen.steadyStatePower_kVA * 1.5 ? 'FORT IMPACT' : 'NORMAL'}
          highlight={true}
        />
        <CalculationCard
          label={t('generator.recommendedSize')}
          value={gen.recommendedSize_kVA}
          unit="kVA"
          formula={`max(S_régime, S_trans) × (1 + ${marginPct}%)`}
          status="pass"
          statusLabel="CALCULÉ"
          highlight={true}
        />
      </div>

      {/* Priority Loads Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.03] dark:bg-rose-500/[0.05]">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            {t('generator.essentialLoads')}
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            {formatPower(gen.essentialLoads_kW, 'kW')}
          </div>
          <div className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">
            100% secourues (Sécurité, IT, froid critique)
          </div>
        </div>

        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/[0.03] dark:bg-blue-500/[0.05]">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {t('generator.priorityLoads')}
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            {formatPower(gen.priorityLoads_kW, 'kW')}
          </div>
          <div className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
            Secourues (Éclairage, CVC partiel)
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('generator.nonPriorityLoads')}
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            {formatPower(gen.nonPriorityLoads_kW, 'kW')}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Délestage automatique lors du basculement
          </div>
        </div>
      </div>

      {/* Motor Inrush & Starting Analysis Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/70 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t('generator.motorAnalysisTitle')}
          </h3>
        </div>

        {gen.motorStartingConsiderations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="eng-table">
              <thead>
                <tr>
                  <th>{t('generator.motorName')}</th>
                  <th className="text-right">{t('generator.motorPower')}</th>
                  <th>{t('generator.startingMethod')}</th>
                  <th className="text-center">{t('generator.startingMultiplier')}</th>
                  <th className="text-right">{t('generator.startingKVA')}</th>
                </tr>
              </thead>
              <tbody>
                {gen.motorStartingConsiderations.map((motor, idx) => (
                  <tr key={idx}>
                    <td className="font-medium text-slate-900 dark:text-white">
                      {motor.loadName}
                    </td>
                    <td className="text-right font-mono text-slate-700 dark:text-slate-300">
                      {formatPower(motor.ratedPower_kW, 'kW')}
                    </td>
                    <td className="text-slate-600 dark:text-slate-400">
                      {t(`loads.startingMethods.${motor.startingMethod}`)}
                    </td>
                    <td className="text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {motor.startingCurrentMultiplier}× In
                    </td>
                    <td className="text-right font-mono font-bold text-slate-900 dark:text-white">
                      {motor.startingPower_kVA} kVA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-slate-400">
            {t('generator.noMotors')}
          </div>
        )}
      </div>

      {/* Limitations Notice */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <div className="font-semibold text-slate-800 dark:text-slate-200">
          Remarque d'ingénierie & Limites de l'estimation :
        </div>
        <p className="leading-relaxed">{t('generator.limitationsNotice')}</p>
      </div>
    </div>
  );
};
