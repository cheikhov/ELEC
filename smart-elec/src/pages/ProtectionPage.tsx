/**
 * SMART ELEC — Modern Protection Selection Assistance Page
 * Section 11: Circuit breakers, fuses, RCDs, thermal relays, Ib <= In <= Iz verification,
 * breaking capacity Icu check, explicit labelling of incomplete calculations.
 */

import React, { useState } from 'react';
import { useProjects } from '../stores/projectStore';
import { useApp } from '../stores/appStore';
import { useI18n } from '../i18n';
import type { LoadCategory } from '../types';
import { calculateProtection } from '../engine/protectionSelection';
import { EmptyState } from '../components/ui/EmptyState';
import {
  ShieldIcon,
  FileTextIcon,
} from '../components/ui/Icons';

export const ProtectionPage: React.FC = () => {
  const { currentProject } = useProjects();
  const { setActiveTab } = useApp();
  const { t } = useI18n();

  const pb = currentProject?.calculations.powerBalance;
  const cable = currentProject?.calculations.cableSizing[0];

  const [designCurrent_A, setDesignCurrent_A] = useState<number>(pb?.estimatedCurrent_A || 45);
  const [cableCapacity_A, setCableCapacity_A] = useState<number>(cable?.derated_currentCapacity_A || 60);
  const [shortCircuitCurrent_kA, setShortCircuitCurrent_kA] = useState<number>(10);
  const [isMotor, setIsMotor] = useState<boolean>(false);
  const [loadType, setLoadType] = useState<LoadCategory>('other');

  if (!currentProject) {
    return (
      <EmptyState
        icon={<ShieldIcon className="w-6 h-6" />}
        title="Aucun projet sélectionné"
        actionLabel={t('nav.projects')}
        onAction={() => setActiveTab('projects')}
      />
    );
  }

  const recommendations = calculateProtection({
    designCurrent_A,
    cableCapacity_A,
    shortCircuitCurrent_kA: shortCircuitCurrent_kA > 0 ? shortCircuitCurrent_kA : undefined,
    phaseType: currentProject.network.phaseType,
    loadType,
    isMotor,
  });

  const isCompliant =
    designCurrent_A <= (recommendations[0]?.nominalCurrent_A || 0) &&
    (recommendations[0]?.nominalCurrent_A || 0) <= cableCapacity_A;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t('protection.title')}
            </h1>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              CEI 60364-4-43 & 4-41
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {t('protection.subtitle')} • Règle fondamentale : Ib ≤ In ≤ Iz
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className="eng-btn-primary"
          >
            <FileTextIcon className="w-4 h-4" />
            <span>{t('nav.reports')} &rarr;</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Circuit parameters vs Protection Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Circuit Parameters */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-card space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            Paramètres du Circuit à Protéger
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              {t('protection.designCurrent')} (Ib) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={designCurrent_A}
                onChange={e => setDesignCurrent_A(parseFloat(e.target.value) || 0)}
                className="eng-input font-mono font-bold pr-8 w-full"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-zinc-400">A</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              {t('protection.cableCapacity')} (Iz admissible déclassé) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={cableCapacity_A}
                onChange={e => setCableCapacity_A(parseFloat(e.target.value) || 0)}
                className="eng-input font-mono font-bold pr-8 w-full"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-zinc-400">A</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Condition fondamentale : Ib ≤ In ≤ Iz
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Courant de Court-Circuit Présumé (Icc amont)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={shortCircuitCurrent_kA}
                onChange={e => setShortCircuitCurrent_kA(parseFloat(e.target.value) || 0)}
                className="eng-input font-mono pr-9 w-full"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-zinc-400">kA</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Catégorie de charge
              </label>
              <select
                value={loadType}
                onChange={e => setLoadType(e.target.value as LoadCategory)}
                className="eng-input w-full cursor-pointer"
              >
                <option value="lighting">Éclairage</option>
                <option value="sockets">Prises de courant</option>
                <option value="motors">Moteur électrique</option>
                <option value="pumps">Pompe</option>
                <option value="air_conditioning">Climatisation</option>
                <option value="it_equipment">Informatique</option>
                <option value="other">Autre récepteur</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                <input
                  type="checkbox"
                  checked={isMotor}
                  onChange={e => setIsMotor(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Relais thermique</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Protective Devices Recommendations */}
        <div className="lg:col-span-7 space-y-4">
          {/* Engineering Compliance Status Strip */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-card flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-zinc-400">
                Condition Normative de Protection
              </div>
              <div className="text-base font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                {designCurrent_A} A (Ib) ≤ {recommendations[0]?.nominalCurrent_A} A (In) ≤ {cableCapacity_A} A (Iz)
              </div>
            </div>
            <div>
              {isCompliant ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold">
                  ✓ CONFORME
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-mono font-semibold">
                  ✕ NON CONFORME
                </span>
              )}
            </div>
          </div>

          {/* Protective Devices Cards */}
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-card space-y-3"
              >
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {rec.deviceType === 'circuit_breaker' && t('protection.circuitBreaker')}
                      {rec.deviceType === 'rcd' && t('protection.rcd')}
                      {rec.deviceType === 'thermal_relay' && t('protection.thermalRelay')}
                    </h3>
                  </div>

                  <span className="font-mono text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                    In = {rec.nominalCurrent_A} A
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  {rec.tripCurve && (
                    <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-400 text-[11px]">Courbe : </span>
                      <strong className="text-zinc-900 dark:text-zinc-100">Courbe {rec.tripCurve}</strong>
                    </div>
                  )}

                  {rec.rcdSensitivity_mA && (
                    <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-400 text-[11px]">Sensibilité : </span>
                      <strong className="text-emerald-600 dark:text-emerald-400">{rec.rcdSensitivity_mA} mA</strong>
                    </div>
                  )}

                  {rec.breakingCapacity_kA && (
                    <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-400 text-[11px]">Icu requis : </span>
                      <strong className="text-zinc-900 dark:text-zinc-100">≥ {rec.breakingCapacity_kA} kA</strong>
                    </div>
                  )}
                </div>

                <ul className="list-disc list-inside space-y-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {rec.notes.map((note, nIdx) => (
                    <li key={nIdx}>{note}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Coordination Notice per Section 11 */}
          <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
            <div className="font-semibold text-zinc-800 dark:text-zinc-200">
              Notice sur la coordination et la sélectivité :
            </div>
            <p className="leading-relaxed">{t('protection.coordinationNotice')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
