/**
 * SMART ELEC — Modern Project Creation Wizard
 * Section 6: 3-step technical configuration with IEC validation and hospital mode alerts.
 */

import React, { useState } from 'react';
import { useProjects } from '../stores/projectStore';
import { useApp } from '../stores/appStore';
import { useI18n } from '../i18n';
import type { ProjectType, PhaseType, NeutralSystem } from '../types';
import { validateProjectInfo, validateNetwork } from '../utils/validation';
import { AlertTriangleIcon, CheckIcon, PlusIcon, TrashIcon } from '../components/ui/Icons';

export const ProjectWizardPage: React.FC = () => {
  const { createProject } = useProjects();
  const { setActiveTab } = useApp();
  const { t } = useI18n();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Project Information
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [address, setAddress] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('commercial');
  const [description, setDescription] = useState('');

  // Step 2: Electrical Network
  const [supplyVoltage, setSupplyVoltage] = useState(400);
  const [phaseType, setPhaseType] = useState<PhaseType>('three_phase');
  const [frequency, setFrequency] = useState(50);
  const [neutralSystem, setNeutralSystem] = useState<NeutralSystem>('TN-S');
  const [networkNotes, setNetworkNotes] = useState('');

  // Step 3: Engineering Assumptions
  const [assumptions, setAssumptions] = useState<string[]>([
    'Bilan de puissance fondé sur la simultanéité usuelle des charges tertiaires.',
    'Chute de tension maximale tolérée fixée à 3% pour l\'éclairage et 5% pour la force motrice.',
  ]);
  const [newAssumptionText, setNewAssumptionText] = useState('');

  // Validation state
  const [errors, setErrors] = useState<string[]>([]);

  const handleNextStep1 = () => {
    const errs = validateProjectInfo(name, client);
    if (errs.length > 0) {
      setErrors(errs.map(e => e.messageFr));
      return;
    }
    setErrors([]);
    setStep(2);
  };

  const handleNextStep2 = () => {
    const errs = validateNetwork({ supplyVoltage, frequency, phaseType });
    if (errs.length > 0) {
      setErrors(errs.map(e => e.messageFr));
      return;
    }
    setErrors([]);
    setStep(3);
  };

  const handleAddAssumption = () => {
    if (!newAssumptionText.trim()) return;
    setAssumptions(prev => [...prev, newAssumptionText.trim()]);
    setNewAssumptionText('');
  };

  const handleRemoveAssumption = (index: number) => {
    setAssumptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    createProject({
      name,
      client,
      address,
      projectType,
      description,
      network: {
        supplyVoltage,
        phaseType,
        frequency,
        neutralSystem,
        notes: networkNotes,
      },
      assumptions: assumptions.map((desc, i) => ({
        id: `asm-wiz-${i}-${Date.now()}`,
        description: desc,
        source: 'user',
        createdAt: new Date().toISOString(),
      })),
    });

    // Go directly to load entry per Section 28
    setActiveTab('loads');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('projectWizard.title')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {step === 1 && t('projectWizard.step1Desc')}
          {step === 2 && t('projectWizard.step2Desc')}
          {step === 3 && t('projectWizard.step3Desc')}
        </p>
      </div>

      {/* Modern Segmented Progress Bar */}
      <div className="grid grid-cols-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-900/60 p-1 gap-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => step > 1 && setStep(1)}
          className={`py-2 px-3 rounded-lg text-center transition-all flex items-center justify-center gap-2 ${
            step === 1
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
              : step > 1
              ? 'text-emerald-600 dark:text-emerald-400 hover:text-slate-900 cursor-pointer'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
            step > 1 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : step === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
          }`}>
            {step > 1 ? '✓' : '1'}
          </span>
          <span className="truncate">{t('projectWizard.step1Title')}</span>
        </button>

        <button
          type="button"
          onClick={() => step > 2 && setStep(2)}
          className={`py-2 px-3 rounded-lg text-center transition-all flex items-center justify-center gap-2 ${
            step === 2
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
              : step > 2
              ? 'text-emerald-600 dark:text-emerald-400 hover:text-slate-900 cursor-pointer'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
            step > 2 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
          }`}>
            {step > 2 ? '✓' : '2'}
          </span>
          <span className="truncate">{t('projectWizard.step2Title')}</span>
        </button>

        <button
          type="button"
          className={`py-2 px-3 rounded-lg text-center transition-all flex items-center justify-center gap-2 ${
            step === 3
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
            step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
          }`}>
            3
          </span>
          <span className="truncate">{t('projectWizard.step3Title')}</span>
        </button>
      </div>

      {/* Validation Errors Alert */}
      {errors.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangleIcon className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{t('common.requiredInfoMissing')} :</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2 text-xs">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 1: Project Information */}
      {step === 1 && (
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('projectWizard.projectName')} *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('projectWizard.projectNamePlaceholder')}
              className="eng-input w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('projectWizard.client')} *
              </label>
              <input
                type="text"
                value={client}
                onChange={e => setClient(e.target.value)}
                placeholder={t('projectWizard.clientPlaceholder')}
                className="eng-input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('projectWizard.address')}
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder={t('projectWizard.addressPlaceholder')}
                className="eng-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('projectWizard.projectType')}
            </label>
            <select
              value={projectType}
              onChange={e => setProjectType(e.target.value as ProjectType)}
              className="eng-input w-full cursor-pointer"
            >
              <option value="residential">{t('projects.types.residential')}</option>
              <option value="commercial">{t('projects.types.commercial')}</option>
              <option value="tertiary">{t('projects.types.tertiary')}</option>
              <option value="industrial">{t('projects.types.industrial')}</option>
              <option value="agricultural">{t('projects.types.agricultural')}</option>
              <option value="hospital">{t('projects.types.hospital')}</option>
            </select>
          </div>

          {/* Hospital Mode Warning per Section 18 */}
          {projectType === 'hospital' && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="font-bold flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <AlertTriangleIcon className="w-5 h-5 text-amber-500 shrink-0" />
                <span>{t('hospital.warningTitle')}</span>
              </div>
              <p className="leading-relaxed">{t('hospital.warningText')}</p>
              <div className="font-mono text-[11px] text-amber-700 dark:text-amber-300/80">
                Normes requises : CEI 60364-7-710 • Schéma IT Médical • ASI temps nul / 0.5s • Sélectivité totale.
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('projectWizard.description')}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Alimentation électrique d'un bâtiment tertiaire avec groupe électrogène de secours..."
              className="eng-input w-full h-auto py-2.5"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className="eng-btn"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleNextStep1}
              className="eng-btn-primary"
            >
              <span>{t('common.next')} &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Electrical Network */}
      {step === 2 && (
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('projectWizard.supplyVoltage')} *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={supplyVoltage}
                  onChange={e => setSupplyVoltage(Number(e.target.value))}
                  className="eng-input font-mono flex-1"
                />
                <button
                  type="button"
                  onClick={() => setSupplyVoltage(400)}
                  className="eng-btn text-xs font-mono"
                >
                  400V
                </button>
                <button
                  type="button"
                  onClick={() => setSupplyVoltage(230)}
                  className="eng-btn text-xs font-mono"
                >
                  230V
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('projectWizard.phaseType')}
              </label>
              <select
                value={phaseType}
                onChange={e => setPhaseType(e.target.value as PhaseType)}
                className="eng-input w-full cursor-pointer"
              >
                <option value="three_phase">{t('projectWizard.threePhase')}</option>
                <option value="single_phase">{t('projectWizard.singlePhase')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('projectWizard.frequency')}
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(Number(e.target.value))}
                className="eng-input w-full font-mono cursor-pointer"
              >
                <option value={50}>50 Hz (Algérie / Europe)</option>
                <option value={60}>60 Hz</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('projectWizard.neutralSystem')} (SLT)
              </label>
              <select
                value={neutralSystem}
                onChange={e => setNeutralSystem(e.target.value as NeutralSystem)}
                className="eng-input w-full font-mono cursor-pointer"
              >
                <option value="TN-S">TN-S (Neutre et PE séparés - Recommandé)</option>
                <option value="TT">TT (Neutre relié à la terre, masses séparées - Sonelgaz)</option>
                <option value="TN-C">TN-C (Neutre et PE confondus PEN)</option>
                <option value="TN-C-S">TN-C-S</option>
                <option value="IT">IT (Neutre isolé ou impédant - Hôpitaux / Process)</option>
              </select>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {t('projectWizard.neutralSystemHint')}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('projectWizard.networkNotes')}
            </label>
            <textarea
              rows={2}
              value={networkNotes}
              onChange={e => setNetworkNotes(e.target.value)}
              placeholder="Ex: Poste transformateur Sonelgaz MT/BT 250 kVA, courant de court-circuit Icc = 15 kA..."
              className="eng-input w-full h-auto py-2.5"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="eng-btn"
            >
              &larr; {t('common.previous')}
            </button>
            <button
              type="button"
              onClick={handleNextStep2}
              className="eng-btn-primary"
            >
              <span>{t('common.next')} &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Assumptions & Traceability */}
      {step === 3 && (
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('projectWizard.assumptionsTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('projectWizard.assumptionsDesc')}
            </p>
          </div>

          {/* Classification Key */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
            <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              [ Donnée Utilisateur ]
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold">
              [ Valeur Calculée ]
            </div>
            <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              [ Hypothèse Formelle ]
            </div>
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
              [ Avertissement ]
            </div>
          </div>

          {/* List of recorded assumptions */}
          <div className="space-y-2">
            {assumptions.map((asm, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">HYP-{idx + 1}</span>
                  <span className="text-slate-800 dark:text-slate-200">{asm}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAssumption(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                  title="Supprimer"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add assumption input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newAssumptionText}
              onChange={e => setNewAssumptionText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddAssumption()}
              placeholder={t('projectWizard.assumptionPlaceholder')}
              className="eng-input flex-1"
            />
            <button
              type="button"
              onClick={handleAddAssumption}
              className="eng-btn"
            >
              <PlusIcon className="w-4 h-4" />
              <span>{t('projectWizard.addAssumption')}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="eng-btn"
            >
              &larr; {t('common.previous')}
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="eng-btn-primary"
            >
              <CheckIcon className="w-4 h-4" />
              <span>{t('projectWizard.saveProjectBtn')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
