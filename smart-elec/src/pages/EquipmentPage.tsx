/**
 * SMART ELEC — Modern Equipment Catalogue Database Page
 * Section 12: Structured catalog with real manufacturers (Schneider, Legrand, ENICAB, Kohler-SDMO),
 * indicative pricing clearly marked DEMO DATA.
 */

import React, { useState, useMemo } from 'react';
import { useI18n } from '../i18n';
import type { EquipmentCategory } from '../types';
import { EQUIPMENT_CATALOG } from '../data/equipmentCatalog';
import { SearchIcon } from '../components/ui/Icons';

export const EquipmentPage: React.FC = () => {
  const { t } = useI18n();

  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEquipment = useMemo(() => {
    return EQUIPMENT_CATALOG.filter(item => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        !searchTerm.trim() ||
        item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t('nav.equipment')}
            </h1>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              DEMO DATA
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Base de données matériel basse tension • Données fabricants pour le marché algérien (Prix indicatifs)
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-card flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par référence, constructeur..."
            className="eng-input w-full pl-9"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
            <SearchIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as any)}
            className="eng-input w-auto cursor-pointer text-xs"
          >
            <option value="all">Toutes les catégories</option>
            <option value="circuit_breakers">Disjoncteurs</option>
            <option value="cables">Câbles & Conducteurs</option>
            <option value="generators">Groupes électrogènes</option>
            <option value="panels">Tableaux & Armoires</option>
            <option value="ups">Onduleurs (ASI / UPS)</option>
            <option value="transformers">Transformateurs MT/BT</option>
          </select>
        </div>
      </div>

      {/* Dense Technical Equipment Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="eng-table">
            <thead>
              <tr>
                <th className="w-1/6">Constructeur</th>
                <th className="w-1/4">Référence Matériel</th>
                <th>Catégorie</th>
                <th>Spécifications Techniques</th>
                <th className="text-right">Prix Indicatif</th>
                <th className="text-right">Mise à jour</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.map(item => (
                <tr key={item.id}>
                  <td className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.manufacturer}
                  </td>

                  <td>
                    <div className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                      {item.reference}
                    </div>
                  </td>

                  <td className="text-zinc-600 dark:text-zinc-400">
                    <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      {item.category.replace('_', ' ')}
                    </span>
                  </td>

                  <td>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-mono">
                      {Object.entries(item.technicalCharacteristics).map(([k, v]) => (
                        <span key={k} className="text-zinc-600 dark:text-zinc-400">
                          <span className="text-zinc-400 font-sans">{k}:</span> <strong className="text-zinc-800 dark:text-zinc-200">{v}</strong>
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="text-right font-mono font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                    {item.price?.toLocaleString()} {item.currency}
                  </td>

                  <td className="text-right font-mono text-xs text-zinc-400">
                    {item.dateUpdated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
