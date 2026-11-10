/**
 * SMART ELEC — Modern Cable Sizing & Verification Page
 * Section 10: Multi-criteria evaluation table (Current capacity, Voltage drop, Short circuit,
 * Protection compatibility), proposed section, missing data enforcement.
 */

import React, { useState } from 'react';
import { useProjects } from '../stores/projectStore';
import { useApp } from '../stores/appStore';
import { useI18n } from '../i18n';
import type {
  ConductorMaterial,
  InsulationType,
  InstallationMethod,
  CableSizingInput,
} from '../types';
import { calculateCableSizing } from '../engine/cableSizing';
import { formatSection } from '../utils/formatters';
import { validateCableInput } from '../utils/validation';
import { ValidationBadge } from '../components/ui/ValidationBadge';
import { EmptyState } from '../components/ui/EmptyState';
import {
  CableIcon,
  ShieldIcon,
  AlertTriangleIcon,
} from '../components/ui/Icons';

export const CablePage: React.FC = () => {
  const { currentProject } = useProjects();
  const { setActiveTab, notify } = useApp();
  const { t } = useI18n();

  const pb = currentProject?.calculations.powerBalance;

  // Sizing Inputs
  const [loadCurrent_A, setLoadCurrent_A] = useState<number>(pb?.estimatedCurrent_A || 45);
  const [cableLength_m, setCableLength_m] = useState<number>(35);
  const [conductorMaterial, setConductorMaterial] = useState<ConductorMaterial>('copper');
  const [insulationType, setInsulationType] = useState<InsulationType>('XLPE');
  const [installationMethod, setInstallationMethod] = useState<InstallationMethod>('B1');
  const [ambientTemperature_C, setAmbientTemperature_C] = useState<number>(40);
  const [cableGrouping, setCableGrouping] = useState<number>(2);
  const [numberOfLoadedConductors, setNumberOfLoadedConductors] = useState<number>(
    currentProject?.network.phaseType === 'three_phase' ? 3 : 2
  );
  const [permittedVoltageDrop_percent, setPermittedVoltageDrop_percent] = useState<number>(3.0);
  const [shortCircuitCurrent_kA, setShortCircuitCurrent_kA] = useState<number>(15);
  const [shortCircuitDuration_s, setShortCircuitDuration_s] = useState<number>(0.1);

  if (!currentProject) {
    return (
      <EmptyState
        icon={<CableIcon className="w-6 h-6" />}
        title="Aucun projet sélectionné"
        actionLabel={t('nav.projects')}
        onAction={() => setActiveTab('projects')}
      />
    );
  }

  const currentInput: CableSizingInput = {
    loadCurrent_A,
    cableLength_m,
    conductorMaterial,
    insulationType,
    installationMethod,
    ambientTemperature_C,
    cableGrouping,
    numberOfLoadedConductors,
    permittedVoltageDrop_percent,
    shortCircuitCurrent_kA: shortCircuitCurrent_kA > 0 ? shortCircuitCurrent_kA : undefined,
    shortCircuitDuration_s: shortCircuitDuration_s > 0 ? shortCircuitDuration_s : undefined,
    networkVoltage_V: currentProject.network.supplyVoltage,
    phaseType: currentProject.network.phaseType,
  };

  const validationErrors = validateCableInput(currentInput);
  const isInputValid = validationErrors.length === 0;

  const result = isInputValid ? calculateCableSizing(currentInput) : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t('cable.title')}
            </h1>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              CEI 60364-5-52
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {t('cable.subtitle')} • Méthode de vérification multi-critères
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('protection')}
            className="eng-btn-primary"
          >
            <ShieldIcon className="w-4 h-4" />
            <span>{t('nav.protection')} &rarr;</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Parameters on Left, Engineering Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Sizing Parameters */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Paramètres d'Entrée
            </span>
            {pb && pb.estimatedCurrent_A > 0 && (
              <button
                type="button"
                onClick={() => {
                  setLoadCurrent_A(pb.estimatedCurrent_A);
                  notify(`Courant Ib synchronisé depuis le bilan (${pb.estimatedCurrent_A} A)`, 'success');
                }}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
              >
                Sync Bilan ({pb.estimatedCurrent_A} A)
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {t('cable.loadCurrent')} (Ib) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min={1}
                  value={loadCurrent_A}
                  onChange={e => setLoadCurrent_A(parseFloat(e.target.value) || 0)}
                  className="eng-input font-mono font-bold pr-8 w-full"
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-zinc-400">A</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {t('cable.cableLength')} (L) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={cableLength_m}
                  onChange={e => setCableLength_m(parseFloat(e.target.value) || 0)}
                  className="eng-input font-mono font-bold pr-8 w-full"
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-zinc-400">m</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {t('cable.material')}
              </label>
              <select
                value={conductorMaterial}
                onChange={e => setConductorMaterial(e.target.value as ConductorMaterial)}
                className="eng-input w-full cursor-pointer"
              >
                <option value="copper">{t('cable.copper')} (Cu)</option>
                <option value="aluminium">{t('cable.aluminium')} (Al)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {t('cable.insulation')}
              </label>
              <select
                value={insulationType}
                onChange={e => setInsulationType(e.target.value as InsulationType)}
                className="eng-input w-full cursor-pointer"
              >
                <option value="XLPE">{t('cable.xlpe')} (PR 90°C)</option>
                <option value="PVC">{t('cable.pvc')} (PVC 70°C)</option>
                <option value="EPR">EPR (90°C)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {t('cable.installationMethod')}
              </label>
              <select
                value={installationMethod}
                onChange={e => setInstallationMethod(e.target.value as InstallationMethod)}
                className="eng-input w-full cursor-pointer text-xs"
              >
                <option value="B1">B1 (Sous conduit en paroi)</option>
                <option value="B2">B2 (Sous conduit apparent)</option>
                <option value="C">C (Chemin non perforé)</option>
                <option value="E">E (Chemin perforé horiz.)</option>
                <option value="F">F (Chemin perforé vert.)</option>
                <option value="D">D (Enterré sous fourreau)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {t('cable.ambientTemp')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={ambientTemperature_C}
                  onChange={e => setAmbientTemperature_C(parseFloat(e.target.value) || 30)}
                  className="eng-input font-mono pr-8 w-full"
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-zinc-400">°C</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {t('cable.grouping')} (Nb circuits)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={cableGrouping}
                onChange={e => setCableGrouping(Math.max(1, parseInt(e.target.value) || 1))}
                className="eng-input font-mono w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {t('cable.permittedVDrop')} (ΔU max)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min={1}
                  max={10}
                  value={permittedVoltageDrop_percent}
                  onChange={e => setPermittedVoltageDrop_percent(parseFloat(e.target.value) || 3)}
                  className="eng-input font-mono pr-8 w-full"
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-zinc-400">%</span>
              </div>
            </div>
          </div>

          {/* Short-circuit info */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Contrainte Thermique Court-Circuit
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  {t('cable.shortCircuitCurrent')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={shortCircuitCurrent_kA}
                    onChange={e => setShortCircuitCurrent_kA(parseFloat(e.target.value) || 0)}
                    placeholder="15"
                    className="eng-input font-mono pr-9 w-full"
                  />
                  <span className="absolute right-3 top-2 text-xs font-mono text-zinc-400">kA</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  {t('cable.shortCircuitDuration')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    value={shortCircuitDuration_s}
                    onChange={e => setShortCircuitDuration_s(parseFloat(e.target.value) || 0.1)}
                    placeholder="0.1"
                    className="eng-input font-mono pr-8 w-full"
                  />
                  <span className="absolute right-3 top-2 text-xs font-mono text-zinc-400">s</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Engineering Results */}
        <div className="lg:col-span-7 space-y-4">
          {!isInputValid ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs space-y-1">
              <div className="font-semibold flex items-center gap-2">
                <AlertTriangleIcon className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{t('cable.cannotCompleteMsg')}</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-2">
                {validationErrors.map((e, idx) => (
                  <li key={idx}>{e.messageFr}</li>
                ))}
              </ul>
            </div>
          ) : result ? (
            <>
              {/* Highlight Proposed Section Card */}
              <div className="p-5 rounded-xl bg-zinc-900 dark:bg-zinc-950 text-white border border-zinc-800 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Section Normalisée Proposée (CEI 60364-5-52)
                  </div>
                  <div className="text-3xl font-bold font-mono text-white mt-1">
                    {formatSection(result.proposedSection_mm2)}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {conductorMaterial === 'copper' ? 'Cuivre' : 'Aluminium'} / {insulationType} • Méthode {installationMethod}
                  </div>
                </div>

                <div className="text-right rtl:text-left space-y-1 font-mono text-xs border-t sm:border-t-0 sm:border-l border-zinc-800 pt-3 sm:pt-0 sm:pl-5">
                  <div>
                    <span className="text-zinc-400">Admissible Iz : </span>
                    <strong className="text-emerald-400">{result.derated_currentCapacity_A} A</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400">Chute tension : </span>
                    <strong className={result.voltageDrop_percent <= permittedVoltageDrop_percent ? 'text-emerald-400' : 'text-rose-400'}>
                      {result.voltageDrop_percent}% ({result.voltageDrop_V} V)
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-400">Facteur k combiné : </span>
                    <strong className="text-zinc-200">{result.correctionFactors.combined}</strong>
                  </div>
                </div>
              </div>

              {/* Exact 5-Criteria Table per Section 10 */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-card">
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {t('cable.criteriaTableTitle')}
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="eng-table">
                    <thead>
                      <tr>
                        <th>{t('cable.colCriterion')}</th>
                        <th className="text-right">{t('cable.colResult')}</th>
                        <th className="text-center">{t('cable.colStatus')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.criteriaResults.map((crit, idx) => (
                        <tr key={idx}>
                          <td className="font-medium text-zinc-800 dark:text-zinc-200">
                            {crit.criterion}
                          </td>
                          <td className="text-right font-mono text-zinc-800 dark:text-zinc-200 font-semibold">
                            {crit.value}
                          </td>
                          <td className="text-center">
                            <ValidationBadge status={crit.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Traceability Audit Box */}
              <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Formule & Référentiel normatif :
                </div>
                <div className="p-2 rounded-md bg-white dark:bg-zinc-900 font-mono text-xs text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
                  {result.trace.formulaRef}
                </div>
                <div className="text-[11px] text-zinc-500">
                  Correction thermique : k_temp = {result.correctionFactors.temperature} • Groupement ({cableGrouping} circuits) : k_group = {result.correctionFactors.grouping}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
