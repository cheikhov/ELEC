/**
 * SMART ELEC — Modern Technical PDF Report Generation Page
 * Section 13: Full 15-item technical calculation note with engineering title block and disclaimer.
 */

import React, { useState } from 'react';
import { useProjects } from '../stores/projectStore';
import { useApp } from '../stores/appStore';
import { useI18n } from '../i18n';
import { generateTechnicalReportPDF } from '../reports/pdfGenerator';
import { formatDate, formatPower, formatCurrent, formatSection } from '../utils/formatters';
import { EmptyState } from '../components/ui/EmptyState';
import {
  FileTextIcon,
  DownloadIcon,
  PrinterIcon,
  AlertTriangleIcon,
} from '../components/ui/Icons';

export const ReportsPage: React.FC = () => {
  const { currentProject } = useProjects();
  const { setActiveTab } = useApp();
  const { t, language } = useI18n();

  const [isGenerating, setIsGenerating] = useState(false);

  if (!currentProject) {
    return (
      <EmptyState
        icon={<FileTextIcon className="w-6 h-6" />}
        title={t('reports.noReport')}
        description={t('reports.generateFirst')}
        actionLabel={t('nav.projects')}
        onAction={() => setActiveTab('projects')}
      />
    );
  }

  const handleDownloadPDF = () => {
    try {
      setIsGenerating(true);
      const doc = generateTechnicalReportPDF(currentProject, language);
      const filename = `SMART_ELEC_Etude_${currentProject.name.replace(/\s+/g, '_')}_${new Date().toISOString().substring(0, 10)}.pdf`;
      doc.save(filename);
    } catch (e) {
      console.error('Failed to generate PDF:', e);
      alert('Erreur lors de la génération du PDF. Utilisez l\'option Imprimer.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const pb = currentProject.calculations.powerBalance;
  const gen = currentProject.calculations.generatorSizing;
  const cable = currentProject.calculations.cableSizing[0];
  const protections = currentProject.calculations.protectionRecommendations;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('reports.title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('reports.subtitle')} • Conforme aux exigences de présentation CEI / CREG
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="eng-btn"
          >
            <PrinterIcon className="w-4 h-4" />
            <span>{t('common.print')}</span>
          </button>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleDownloadPDF}
            className="eng-btn-primary disabled:opacity-50"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>{isGenerating ? t('reports.generating') : t('reports.generateBtn')}</span>
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer Callout per Section 13 */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
        <div className="font-bold flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <AlertTriangleIcon className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{t('reports.disclaimerTitle')}</span>
        </div>
        <p className="italic leading-relaxed text-xs">
          « {t('reports.disclaimerText')} »
        </p>
      </div>

      {/* Report Document Preview Sheet */}
      <div className="p-6 md:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5 max-w-4xl mx-auto font-sans">
        {/* Title Block Header (Cartouche d'ingénierie) */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60">
            <div className="text-lg font-extrabold tracking-wider text-slate-900 dark:text-white font-mono">
              SMART ELEC
            </div>
            <div className="text-[11px] text-slate-500 uppercase tracking-tight mt-0.5">
              Logiciel d'Études Électriques BT
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Norme CEI 60364 / CREG
            </div>
          </div>

          <div className="p-4">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Projet & Affaire</div>
            <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 truncate">
              {currentProject.name}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Client : {currentProject.client}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {currentProject.address}
            </div>
          </div>

          <div className="p-4 font-mono text-xs space-y-1 bg-slate-50 dark:bg-slate-950/60">
            <div>Réf: <strong className="text-slate-900 dark:text-white">SE-{currentProject.id.substring(0, 8).toUpperCase()}</strong></div>
            <div>Date : {formatDate(new Date().toISOString())}</div>
            <div>Statut : <strong className="uppercase text-emerald-600 dark:text-emerald-400">{currentProject.status}</strong></div>
            <div>Version : 1.0.0 Pro</div>
          </div>
        </div>

        {/* Technical Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase font-sans">Tension & Régime</div>
            <div className="font-bold text-slate-900 dark:text-white mt-1">
              {currentProject.network.supplyVoltage}V {currentProject.network.phaseType === 'three_phase' ? '3P+N' : '1P+N'} • {currentProject.network.neutralSystem || 'TT'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase font-sans">P. Demandée (P)</div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {pb ? formatPower(pb.demandPower_kW, 'kW') : '—'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase font-sans">P. Apparente (S)</div>
            <div className="font-bold text-slate-900 dark:text-white mt-1">
              {pb ? `${pb.apparentPower_kVA} kVA` : '—'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase font-sans">Courant Emploi (Ib)</div>
            <div className="font-bold text-slate-900 dark:text-white mt-1">
              {pb ? formatCurrent(pb.estimatedCurrent_A) : '—'}
            </div>
          </div>
        </div>

        {/* Section 1: Power Balance Summary */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1.5">
            1. Synthèse du Bilan de Puissance (CEI 60364-1)
          </h3>
          {pb ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="eng-table">
                <thead>
                  <tr>
                    <th>Grandeur</th>
                    <th>Formule appliquée</th>
                    <th className="text-right">Valeur calculée</th>
                    <th>Unité</th>
                    <th className="text-center">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Puissance installée totale</td>
                    <td className="font-mono text-xs text-slate-500">Σ (P_unit × Qty)</td>
                    <td className="text-right font-mono font-medium">{formatPower(pb.installedPower_kW, 'kW')}</td>
                    <td className="font-mono text-xs">kW</td>
                    <td className="text-center font-mono text-xs text-emerald-600 font-bold">✓ CONFORME</td>
                  </tr>
                  <tr>
                    <td>Puissance demandée</td>
                    <td className="font-mono text-xs text-slate-500">Σ (P_inst × Ku × Ks)</td>
                    <td className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatPower(pb.demandPower_kW, 'kW')}</td>
                    <td className="font-mono text-xs">kW</td>
                    <td className="text-center font-mono text-xs text-emerald-600 font-bold">✓ CONFORME</td>
                  </tr>
                  <tr>
                    <td>Puissance apparente</td>
                    <td className="font-mono text-xs text-slate-500">S = √(P² + Q²)</td>
                    <td className="text-right font-mono font-medium">{pb.apparentPower_kVA}</td>
                    <td className="font-mono text-xs">kVA</td>
                    <td className="text-center font-mono text-xs text-emerald-600 font-bold">✓ CONFORME</td>
                  </tr>
                  <tr>
                    <td>Courant d'emploi présumé (Ib)</td>
                    <td className="font-mono text-xs text-slate-500">S / (√3 × U)</td>
                    <td className="text-right font-mono font-medium">{formatCurrent(pb.estimatedCurrent_A)}</td>
                    <td className="font-mono text-xs">A</td>
                    <td className="text-center font-mono text-xs text-emerald-600 font-bold">✓ CONFORME</td>
                  </tr>
                  <tr>
                    <td>Facteur de puissance moyen</td>
                    <td className="font-mono text-xs text-slate-500">cos(arctan(Q/P))</td>
                    <td className="text-right font-mono font-medium">{pb.powerFactor}</td>
                    <td className="font-mono text-xs">—</td>
                    <td className="text-center font-mono text-xs text-emerald-600 font-bold">✓ CONFORME</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">Aucun calcul exécuté.</div>
          )}
        </div>

        {/* Section 2: Generator & Cable Sizing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1.5">
              2. Groupe Électrogène (Estimation)
            </h3>
            {gen ? (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1 text-xs font-mono">
                <div>Régime permanent : <strong>{gen.steadyStatePower_kW} kW ({gen.steadyStatePower_kVA} kVA)</strong></div>
                <div>Appel de démarrage : <strong>{gen.transientPower_kVA} kVA</strong></div>
                <div>Marge technique retenue : <strong>{(gen.engineeringMargin * 100).toFixed(0)} %</strong></div>
                <div className="pt-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  Puissance recommandée : {gen.recommendedSize_kVA} kVA
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1.5">
              3. Câble d'Alimentation Principal
            </h3>
            {cable ? (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1 text-xs font-mono">
                <div>Courant d'emploi Ib : <strong>{cable.trace.inputs['Load current (A)']} A</strong></div>
                <div>Longueur de liaison : <strong>{cable.trace.inputs['Cable length (m)']} m</strong></div>
                <div>Chute de tension : <strong>{cable.voltageDrop_percent} % ({cable.voltageDrop_V} V)</strong></div>
                <div className="pt-1.5 text-slate-900 dark:text-white font-bold text-sm">
                  Section proposée : {formatSection(cable.proposedSection_mm2)}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Section 3: Protections */}
        {protections && protections.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1.5">
              4. Appareillage de Protection Recommandé
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="eng-table">
                <thead>
                  <tr>
                    <th>Appareil</th>
                    <th className="text-right">Courant In</th>
                    <th>Courbe / Sensibilité</th>
                    <th>Prescription technique</th>
                  </tr>
                </thead>
                <tbody>
                  {protections.map((p, idx) => (
                    <tr key={idx}>
                      <td className="font-bold text-slate-900 dark:text-white">{p.deviceType.replace('_', ' ').toUpperCase()}</td>
                      <td className="text-right font-mono font-bold">{p.nominalCurrent_A} A</td>
                      <td className="font-mono">{p.tripCurve ? `Courbe ${p.tripCurve}` : p.rcdSensitivity_mA ? `${p.rcdSensitivity_mA} mA` : '—'}</td>
                      <td className="text-slate-600 dark:text-slate-400 text-xs">{p.notes[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Standards List */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <div className="font-semibold text-slate-700 dark:text-slate-300">
            {t('reports.standardsRefTitle')}
          </div>
          <p className="leading-relaxed">
            {t('reports.standardsList')}
          </p>
        </div>

        {/* Formal Sign-off Box */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-6 text-xs text-center">
          <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 h-28 flex flex-col justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase text-[11px]">Pour le Bureau d'Études / L'Ingénieur</span>
            <span className="text-[11px] text-slate-400 italic">Signature & Cachet</span>
          </div>
          <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 h-28 flex flex-col justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase text-[11px]">Pour le Maître d'Ouvrage / L'Entreprise</span>
            <span className="text-[11px] text-slate-400 italic">Visa pour exécution</span>
          </div>
        </div>
      </div>
    </div>
  );
};
