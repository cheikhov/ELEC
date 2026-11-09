/**
 * SMART ELEC — Modern Power Balance Module Page
 * Section 8 & 15: P_installed, P_demand, P, Q, S, I, cos φ + full mathematical traceability.
 */

import React from 'react';
import { useProjects } from '../stores/projectStore';
import { useApp } from '../stores/appStore';
import { useI18n } from '../i18n';
import { formatPower } from '../utils/formatters';
import { CalculationCard } from '../components/ui/CalculationCard';
import { EmptyState } from '../components/ui/EmptyState';
import {
  CalculatorIcon,
  AlertTriangleIcon,
  CheckIcon,
  CpuIcon,
} from '../components/ui/Icons';

export const PowerBalancePage: React.FC = () => {
  const { currentProject, recalculateProject } = useProjects();
  const { setActiveTab } = useApp();
  const { t } = useI18n();

  if (!currentProject) {
    return (
      <EmptyState
        icon={<CalculatorIcon className="w-6 h-6" />}
        title={t('powerBalance.noCalculation')}
        description={t('powerBalance.addLoadsFirst')}
        actionLabel={t('nav.projects')}
        onAction={() => setActiveTab('projects')}
      />
    );
  }

  const pb = currentProject.calculations.powerBalance;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t('powerBalance.title')}
            </h1>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              CEI 60364-1
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Projet : <span className="font-semibold text-zinc-700 dark:text-zinc-300">{currentProject.name}</span> • Réseau {currentProject.network.supplyVoltage}V {currentProject.network.phaseType === 'three_phase' ? '3P+N' : '1P+N'} • {currentProject.network.frequency}Hz
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => recalculateProject(currentProject.id)}
            className="eng-btn"
          >
            <CalculatorIcon className="w-4 h-4" />
            <span>{t('common.recalculate')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className="eng-btn-primary"
          >
            <CpuIcon className="w-4 h-4" />
            <span>{t('nav.generator')} &rarr;</span>
          </button>
        </div>
      </div>

      {/* Warnings Alert */}
      {pb && pb.trace.warnings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs space-y-1">
          <div className="font-semibold flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <AlertTriangleIcon className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{t('common.warning')} (Ingénierie) :</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2 text-xs">
            {pb.trace.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {pb ? (
        <>
          {/* Modern KPI Calculation Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <CalculationCard
              label="P_installée"
              value={pb.installedPower_kW}
              unit="kW"
              formula="Σ (P_unit × Qty)"
              status="pass"
              className="col-span-1"
            />
            <CalculationCard
              label="P_demandée"
              value={pb.demandPower_kW}
              unit="kW"
              formula="Σ (P_inst × Ku × Ks)"
              status="pass"
              highlight={true}
              className="col-span-1"
            />
            <CalculationCard
              label="Active (P)"
              value={pb.activePower_kW}
              unit="kW"
              formula="P = P_demand"
              status="pass"
              className="col-span-1"
            />
            <CalculationCard
              label="Réactive (Q)"
              value={pb.reactivePower_kVAr}
              unit="kVAr"
              formula="Q = P × tan φ"
              status="pass"
              className="col-span-1"
            />
            <CalculationCard
              label="Apparente (S)"
              value={pb.apparentPower_kVA}
              unit="kVA"
              formula="S = √(P² + Q²)"
              status="pass"
              highlight={true}
              className="col-span-1"
            />
            <CalculationCard
              label="Courant (Ib)"
              value={pb.estimatedCurrent_A}
              unit="A"
              formula={currentProject.network.phaseType === 'three_phase' ? 'S / (√3 × U)' : 'S / U'}
              status="pass"
              className="col-span-1"
            />
            <CalculationCard
              label="cos φ moyen"
              value={pb.powerFactor}
              unit=""
              formula="cos(arctan(Q/P))"
              status={pb.powerFactor >= 0.8 ? 'pass' : 'warning'}
              statusLabel={pb.powerFactor >= 0.8 ? 'BON' : 'FAIBLE'}
              className="col-span-1"
            />
          </div>

          {/* Aggregations: By Category & By Priority in Modern Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* By Category */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-card">
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {t('powerBalance.byCategory')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="eng-table">
                  <thead>
                    <tr>
                      <th>Catégorie</th>
                      <th className="text-center">Charges</th>
                      <th className="text-right">P. Installée</th>
                      <th className="text-right">P. Demandée</th>
                      <th className="text-right">% Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pb.byCategory.map(cat => {
                      const share = pb.demandPower_kW > 0 ? (cat.demandPower_kW / pb.demandPower_kW) * 100 : 0;
                      return (
                        <tr key={cat.category}>
                          <td className="font-medium text-zinc-800 dark:text-zinc-200">
                            {t(`loads.categories.${cat.category}`)}
                          </td>
                          <td className="text-center font-mono">{cat.loadCount}</td>
                          <td className="text-right font-mono text-zinc-600 dark:text-zinc-400">
                            {formatPower(cat.installedPower_kW, 'kW')}
                          </td>
                          <td className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {formatPower(cat.demandPower_kW, 'kW')}
                          </td>
                          <td className="text-right font-mono text-zinc-500">
                            {share.toFixed(1)} %
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* By Priority Level */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-card">
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {t('powerBalance.byPriority')} (Bilan Secours GE)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="eng-table">
                  <thead>
                    <tr>
                      <th>Priorité</th>
                      <th className="text-center">Charges</th>
                      <th className="text-right">P. Demandée</th>
                      <th className="text-right">S [kVA]</th>
                      <th className="text-center">Secours GE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pb.byPriority.map(prio => (
                      <tr key={prio.priority}>
                        <td>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              prio.priority === 'essential'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                : prio.priority === 'priority'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20'
                            }`}
                          >
                            {t(`loads.priorities.${prio.priority}`)}
                          </span>
                        </td>
                        <td className="text-center font-mono">{prio.loadCount}</td>
                        <td className="text-right font-mono font-medium">{formatPower(prio.demandPower_kW, 'kW')}</td>
                        <td className="text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">{prio.apparentPower_kVA.toFixed(1)} kVA</td>
                        <td className="text-center font-mono font-bold text-xs">
                          {prio.priority !== 'non_priority' ? (
                            <span className="text-emerald-600 dark:text-emerald-400">OUI</span>
                          ) : (
                            <span className="text-zinc-400">DÉLESTÉ</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Traceability Section per Section 15 */}
          <div className="p-5 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-emerald-500" />
              <span>{t('powerBalance.traceabilityTitle')} — Justification Mathématique</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <div className="font-semibold text-zinc-400 text-xs mb-1.5 uppercase">
                  {t('powerBalance.inputsUsed')} :
                </div>
                <div className="space-y-1 font-mono text-xs">
                  {Object.entries(pb.trace.inputs).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-zinc-400">{k} :</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <div className="font-semibold text-zinc-400 text-xs mb-1.5 uppercase">
                  {t('powerBalance.assumptionsApplied')} :
                </div>
                <ul className="list-disc list-inside space-y-1 text-zinc-700 dark:text-zinc-300 text-xs">
                  {pb.trace.assumptions.map((asm, idx) => (
                    <li key={idx}>{asm}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <div className="font-semibold text-zinc-400 text-xs mb-1.5 uppercase">
                  {t('powerBalance.formulaUsed')} :
                </div>
                <div className="p-2 rounded-md bg-zinc-50 dark:bg-zinc-900 font-mono text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed border border-zinc-200 dark:border-zinc-800">
                  {pb.trace.formulaRef}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          icon={<CalculatorIcon className="w-6 h-6" />}
          title={t('powerBalance.noCalculation')}
          description={t('powerBalance.addLoadsFirst')}
          actionLabel={t('loads.addLoad')}
          onAction={() => setActiveTab('loads')}
        />
      )}
    </div>
  );
};
