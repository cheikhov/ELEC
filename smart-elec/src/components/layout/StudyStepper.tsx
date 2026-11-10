/**
 * SMART ELEC — Study Workflow Stepper
 * Professional sequential breadcrumb / tab tracker for electrical calculations.
 * Allows instant jumping between calculation stages with live status indicators.
 */

import React from 'react';
import { useApp, type NavigationTab } from '../../stores/appStore';
import { useProjects } from '../../stores/projectStore';
import {
  BoxIcon,
  CalculatorIcon,
  CpuIcon,
  CableIcon,
  ShieldIcon,
  FileTextIcon,
} from '../ui/Icons';

interface Step {
  tab: NavigationTab;
  number: number;
  label: string;
  icon: React.ReactNode;
  getBadge?: (project: any) => string | null;
}

const STEPS: Step[] = [
  {
    tab: 'loads',
    number: 1,
    label: 'Charges',
    icon: <BoxIcon className="w-3.5 h-3.5" />,
    getBadge: p => `${p.loads?.length || 0}`,
  },
  {
    tab: 'power_balance',
    number: 2,
    label: 'Bilan de puissance',
    icon: <CalculatorIcon className="w-3.5 h-3.5" />,
    getBadge: p => {
      const pDem = p.calculations?.powerBalance?.demandPower_kW;
      return pDem !== undefined ? `${pDem.toFixed(1)} kW` : null;
    },
  },
  {
    tab: 'generator',
    number: 3,
    label: 'Groupe électrogène',
    icon: <CpuIcon className="w-3.5 h-3.5" />,
    getBadge: p => {
      const rec = p.calculations?.generatorSizing?.recommendedSize_kVA;
      return rec ? `${rec} kVA` : null;
    },
  },
  {
    tab: 'cable',
    number: 4,
    label: 'Câbles',
    icon: <CableIcon className="w-3.5 h-3.5" />,
    getBadge: p => {
      const c = p.calculations?.cableSizing?.[0]?.proposedSection_mm2;
      return c ? `${c} mm²` : null;
    },
  },
  {
    tab: 'protection',
    number: 5,
    label: 'Protections',
    icon: <ShieldIcon className="w-3.5 h-3.5" />,
    getBadge: p => {
      const prot = p.calculations?.protectionRecommendations?.[0];
      return prot ? `${prot.nominalCurrent_A} A` : null;
    },
  },
  {
    tab: 'reports',
    number: 6,
    label: 'Rapport PDF',
    icon: <FileTextIcon className="w-3.5 h-3.5" />,
  },
];

export const StudyStepper: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const { currentProject } = useProjects();

  // Show stepper only if a project is active and we are in one of the calculation/reporting tabs
  const isStudyTab = STEPS.some(s => s.tab === activeTab);
  if (!currentProject || !isStudyTab) return null;

  return (
    <div className="w-full bg-white dark:bg-[#0c1220] border border-slate-200/90 dark:border-[#1a2234] rounded-xl p-1.5 shadow-card dark:shadow-card-dark mb-6 overflow-x-auto select-none">
      <div className="flex items-center min-w-max gap-1">
        {STEPS.map((step, idx) => {
          const isActive = activeTab === step.tab;
          const badge = step.getBadge ? step.getBadge(currentProject) : null;

          return (
            <React.Fragment key={step.tab}>
              <button
                type="button"
                onClick={() => setActiveTab(step.tab)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/35 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-[#141d30] border border-transparent'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-[#162035] text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {step.number}
                </span>

                <span className="flex items-center gap-1.5">
                  <span className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                    {step.icon}
                  </span>
                  <span>{step.label}</span>
                </span>

                {badge && (
                  <span
                    className={`ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'bg-slate-100 dark:bg-[#162035] text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>

              {idx < STEPS.length - 1 && (
                <div className="w-3 h-px bg-slate-200 dark:border-[#1a2234] shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

