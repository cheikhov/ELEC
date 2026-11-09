/**
 * SMART ELEC — Modern Electrical Load Schedule Page
 * Section 7: Professional load schedule table with total summary footer and modern modal editor.
 */

import React, { useState } from 'react';
import { useProjects } from '../stores/projectStore';
import { useApp } from '../stores/appStore';
import { useI18n } from '../i18n';
import type {
  ElectricalLoad,
  LoadCategory,
  LoadPriority,
  PowerUnit,
  PhaseType,
  StartingMethod,
} from '../types';
import { formatPower } from '../utils/formatters';
import { validateLoad } from '../utils/validation';
import { EmptyState } from '../components/ui/EmptyState';
import {
  PlusIcon,
  TrashIcon,
  EditIcon,
  BoxIcon,
  CalculatorIcon,
  XIcon,
} from '../components/ui/Icons';

export const LoadsPage: React.FC = () => {
  const { currentProject, addLoad, updateLoad, deleteLoad } = useProjects();
  const { setActiveTab } = useApp();
  const { t } = useI18n();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoadId, setEditingLoadId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<LoadCategory>('lighting');
  const [quantity, setQuantity] = useState(1);
  const [unitPower, setUnitPower] = useState(100);
  const [powerUnit, setPowerUnit] = useState<PowerUnit>('W');
  const [loadType, setLoadType] = useState<PhaseType>('three_phase');
  const [powerFactor, setPowerFactor] = useState(0.85);
  const [efficiency, setEfficiency] = useState(0.9);
  const [startingMethod, setStartingMethod] = useState<StartingMethod>('not_applicable');
  const [utilizationFactor, setUtilizationFactor] = useState(1.0);
  const [simultaneityFactor, setSimultaneityFactor] = useState(1.0);
  const [priority, setPriority] = useState<LoadPriority>('priority');
  const [notes, setNotes] = useState('');

  const [formErrors, setFormErrors] = useState<string[]>([]);

  if (!currentProject) {
    return (
      <EmptyState
        icon={<BoxIcon className="w-6 h-6" />}
        title={t('loads.noLoadsTitle')}
        description={t('loads.noLoadsDesc')}
        actionLabel={t('nav.projects')}
        onAction={() => setActiveTab('projects')}
      />
    );
  }

  const handleOpenAddModal = () => {
    setEditingLoadId(null);
    setName('');
    setCategory('lighting');
    setQuantity(1);
    setUnitPower(50);
    setPowerUnit('W');
    setLoadType(currentProject.network.phaseType);
    setPowerFactor(0.9);
    setEfficiency(1.0);
    setStartingMethod('not_applicable');
    setUtilizationFactor(1.0);
    setSimultaneityFactor(0.8);
    setPriority('priority');
    setNotes('');
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (load: ElectricalLoad) => {
    setEditingLoadId(load.id);
    setName(load.name);
    setCategory(load.category);
    setQuantity(load.quantity);
    setUnitPower(load.unitPower);
    setPowerUnit(load.powerUnit);
    setLoadType(load.loadType);
    setPowerFactor(load.powerFactor);
    setEfficiency(load.efficiency);
    setStartingMethod(load.startingMethod);
    setUtilizationFactor(load.utilizationFactor);
    setSimultaneityFactor(load.simultaneityFactor);
    setPriority(load.priority);
    setNotes(load.notes || '');
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const handleSaveLoad = () => {
    const candidate = {
      name,
      category,
      quantity,
      unitPower,
      powerUnit,
      loadType,
      powerFactor,
      efficiency,
      startingMethod,
      utilizationFactor,
      simultaneityFactor,
      priority,
      notes,
    };

    const errs = validateLoad(candidate);
    if (errs.length > 0) {
      setFormErrors(errs.map(e => e.messageFr));
      return;
    }

    if (editingLoadId) {
      updateLoad(currentProject.id, editingLoadId, candidate);
    } else {
      addLoad(currentProject.id, candidate);
    }

    setIsModalOpen(false);
  };

  const handleCategoryChange = (newCat: LoadCategory) => {
    setCategory(newCat);
    if (newCat === 'lighting') {
      setPowerFactor(0.95);
      setStartingMethod('not_applicable');
      setPowerUnit('W');
    } else if (newCat === 'motors' || newCat === 'pumps') {
      setPowerFactor(0.82);
      setStartingMethod('direct');
      setPowerUnit('kW');
      setEfficiency(0.88);
    } else if (newCat === 'air_conditioning') {
      setPowerFactor(0.85);
      setStartingMethod('vfd');
      setPowerUnit('kW');
    } else if (newCat === 'it_equipment') {
      setPowerFactor(0.9);
      setStartingMethod('not_applicable');
      setPowerUnit('kW');
    } else if (newCat === 'medical_equipment') {
      setPowerFactor(0.88);
      setPriority('essential');
    }
  };

  // Totals for schedule footer
  const totalInst_kW = currentProject.loads.reduce((acc, load) => {
    const unitKW = load.powerUnit === 'W' ? load.unitPower / 1000 : load.powerUnit === 'HP' ? load.unitPower * 0.7457 : load.unitPower;
    return acc + (load.quantity * unitKW);
  }, 0);

  const totalDemand_kW = currentProject.loads.reduce((acc, load) => {
    const unitKW = load.powerUnit === 'W' ? load.unitPower / 1000 : load.powerUnit === 'HP' ? load.unitPower * 0.7457 : load.unitPower;
    const inst = load.quantity * unitKW;
    return acc + ((inst / (load.efficiency || 1)) * load.utilizationFactor * load.simultaneityFactor);
  }, 0);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('loads.title')}
            </h1>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {currentProject.loads.length} récepteur(s)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Projet : <span className="font-semibold text-slate-700 dark:text-slate-300">{currentProject.name}</span> • Réseau {currentProject.network.supplyVoltage}V {currentProject.network.phaseType === 'three_phase' ? 'Triphasé' : 'Monophasé'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="eng-btn-primary"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{t('loads.addLoad')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('power_balance')}
            className="eng-btn"
          >
            <CalculatorIcon className="w-4 h-4" />
            <span>{t('nav.powerBalance')} &rarr;</span>
          </button>
        </div>
      </div>

      {/* Modern Load Schedule Table */}
      {currentProject.loads.length > 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/70 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="eng-table">
              <thead>
                <tr>
                  <th className="w-1/4">{t('loads.colName')}</th>
                  <th>{t('loads.colCategory')}</th>
                  <th className="text-center">{t('loads.colQty')}</th>
                  <th className="text-right">{t('loads.colUnitP')}</th>
                  <th className="text-right">{t('loads.colTotalInst')} [kW]</th>
                  <th className="text-center">Ku / Ks</th>
                  <th className="text-right">{t('loads.colDemandP')} [kW]</th>
                  <th className="text-center">cos φ</th>
                  <th className="text-center">{t('loads.colPriority')}</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProject.loads.map(load => {
                  const unitKW = load.powerUnit === 'W' ? load.unitPower / 1000 : load.powerUnit === 'HP' ? load.unitPower * 0.7457 : load.unitPower;
                  const inst_kW = load.quantity * unitKW;
                  const dem_kW = (inst_kW / (load.efficiency || 1)) * load.utilizationFactor * load.simultaneityFactor;

                  return (
                    <tr key={load.id}>
                      <td>
                        <div className="font-semibold text-slate-900 dark:text-white">{load.name}</div>
                        {load.notes && (
                          <div className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-xs mt-0.5">{load.notes}</div>
                        )}
                      </td>

                      <td className="text-slate-600 dark:text-slate-400">
                        {t(`loads.categories.${load.category}`)}
                      </td>

                      <td className="text-center font-mono font-bold">
                        {load.quantity}
                      </td>

                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">
                        {load.unitPower} {load.powerUnit}
                      </td>

                      <td className="text-right font-mono text-slate-800 dark:text-slate-200">
                        {formatPower(inst_kW, 'kW')}
                      </td>

                      <td className="text-center font-mono text-xs text-slate-500 dark:text-slate-400">
                        {load.utilizationFactor} / {load.simultaneityFactor}
                      </td>

                      <td className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatPower(dem_kW, 'kW')}
                      </td>

                      <td className="text-center font-mono text-slate-700 dark:text-slate-300">
                        {load.powerFactor}
                      </td>

                      <td className="text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            load.priority === 'essential'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              : load.priority === 'priority'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {t(`loads.priorities.${load.priority}`)}
                        </span>
                      </td>

                      <td className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(load)}
                            title={t('common.edit')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteLoad(currentProject.id, load.id)}
                            title={t('common.delete')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Total Footer Row */}
              <tfoot>
                <tr className="bg-slate-50 dark:bg-slate-900 border-t-2 border-slate-200 dark:border-slate-800 font-bold text-xs">
                  <td colSpan={2} className="py-3 px-4 uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Total Bilan ({currentProject.loads.length} récepteurs)
                  </td>
                  <td className="py-3 px-2 text-center font-mono">
                    {currentProject.loads.reduce((acc, l) => acc + l.quantity, 0)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400">—</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-900 dark:text-white">
                    {formatPower(totalInst_kW, 'kW')}
                  </td>
                  <td className="py-3 px-2 text-center text-slate-400">—</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatPower(totalDemand_kW, 'kW')}
                  </td>
                  <td colSpan={3} className="py-3 px-4 text-right text-xs text-slate-500 font-normal">
                    P. demandée totale
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<BoxIcon className="w-6 h-6" />}
          title={t('loads.noLoadsTitle')}
          description={t('loads.noLoadsDesc')}
          actionLabel={t('loads.addLoad')}
          onAction={handleOpenAddModal}
        />
      )}

      {/* Add / Edit Load Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingLoadId ? t('loads.editLoad') : t('loads.addLoad')}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {formErrors.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 space-y-1">
                  <div className="font-bold">{t('common.requiredInfoMissing')} :</div>
                  {formErrors.map((e, idx) => (
                    <div key={idx}>• {e}</div>
                  ))}
                </div>
              )}

              {/* 1. Identification */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  1. Identification du Récepteur
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {t('loads.form.name')} *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ex: Éclairage Bureaux, Pompe de Relevage, Ascenseur..."
                      className="eng-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {t('loads.form.category')} *
                    </label>
                    <select
                      value={category}
                      onChange={e => handleCategoryChange(e.target.value as LoadCategory)}
                      className="eng-input w-full cursor-pointer"
                    >
                      <option value="lighting">{t('loads.categories.lighting')}</option>
                      <option value="sockets">{t('loads.categories.sockets')}</option>
                      <option value="heating">{t('loads.categories.heating')}</option>
                      <option value="air_conditioning">{t('loads.categories.air_conditioning')}</option>
                      <option value="pumps">{t('loads.categories.pumps')}</option>
                      <option value="motors">{t('loads.categories.motors')}</option>
                      <option value="elevators">{t('loads.categories.elevators')}</option>
                      <option value="it_equipment">{t('loads.categories.it_equipment')}</option>
                      <option value="medical_equipment">{t('loads.categories.medical_equipment')}</option>
                      <option value="other">{t('loads.categories.other')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Electrical characteristics */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  2. Caractéristiques Électriques
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {t('loads.form.quantity')} *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="eng-input font-mono w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {t('loads.form.unitPower')} *
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        step="any"
                        min={0.1}
                        value={unitPower}
                        onChange={e => setUnitPower(parseFloat(e.target.value) || 0)}
                        className="eng-input font-mono flex-1"
                      />
                      <select
                        value={powerUnit}
                        onChange={e => setPowerUnit(e.target.value as PowerUnit)}
                        className="eng-input w-16 px-1 font-mono font-bold"
                      >
                        <option value="W">W</option>
                        <option value="kW">kW</option>
                        <option value="kVA">kVA</option>
                        <option value="HP">HP</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {t('loads.form.loadType')}
                    </label>
                    <select
                      value={loadType}
                      onChange={e => setLoadType(e.target.value as PhaseType)}
                      className="eng-input w-full cursor-pointer"
                    >
                      <option value="three_phase">Triphasé</option>
                      <option value="single_phase">Monophasé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      cos φ *
                    </label>
                    <input
                      type="number"
                      step={0.01}
                      min={0.1}
                      max={1.0}
                      value={powerFactor}
                      onChange={e => setPowerFactor(parseFloat(e.target.value) || 0.85)}
                      className="eng-input font-mono w-full"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Factors */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  3. Facteurs de Calcul & Sécurité
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Ku (Utilisation)
                    </label>
                    <input
                      type="number"
                      step={0.05}
                      min={0.1}
                      max={1.0}
                      value={utilizationFactor}
                      onChange={e => setUtilizationFactor(parseFloat(e.target.value) || 1.0)}
                      className="eng-input font-mono w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Ks (Simultanéité)
                    </label>
                    <input
                      type="number"
                      step={0.05}
                      min={0.1}
                      max={1.0}
                      value={simultaneityFactor}
                      onChange={e => setSimultaneityFactor(parseFloat(e.target.value) || 1.0)}
                      className="eng-input font-mono w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Rendement (η)
                    </label>
                    <input
                      type="number"
                      step={0.01}
                      min={0.1}
                      max={1.0}
                      value={efficiency}
                      onChange={e => setEfficiency(parseFloat(e.target.value) || 1.0)}
                      className="eng-input font-mono w-full"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Motor and Priority */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  4. Démarrage Moteur & Secours
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {t('loads.form.startingMethod')}
                    </label>
                    <select
                      value={startingMethod}
                      onChange={e => setStartingMethod(e.target.value as StartingMethod)}
                      className="eng-input w-full cursor-pointer"
                    >
                      <option value="not_applicable">{t('loads.startingMethods.not_applicable')}</option>
                      <option value="direct">{t('loads.startingMethods.direct')} (Id/In = 6.0)</option>
                      <option value="star_delta">{t('loads.startingMethods.star_delta')} (Id/In = 2.5)</option>
                      <option value="soft_starter">{t('loads.startingMethods.soft_starter')} (Id/In = 3.0)</option>
                      <option value="vfd">{t('loads.startingMethods.vfd')} (Id/In = 1.2)</option>
                      <option value="autotransformer">{t('loads.startingMethods.autotransformer')} (Id/In = 2.0)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {t('loads.form.priority')}
                    </label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as LoadPriority)}
                      className="eng-input w-full cursor-pointer"
                    >
                      <option value="priority">{t('loads.priorities.priority')}</option>
                      <option value="essential">{t('loads.priorities.essential')}</option>
                      <option value="non_priority">{t('loads.priorities.non_priority')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {t('loads.form.notes')}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Ex: Raccordé au TGBT départ 4, local technique niveau -1..."
                    className="eng-input w-full"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="eng-btn"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveLoad}
                className="eng-btn-primary"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
