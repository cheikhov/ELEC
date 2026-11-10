/**
 * SMART ELEC — CalculationCard Component
 * Modern B2B SaaS metric widget with clean typography, tabular values, and formula citations.
 */

import React from 'react';
import type { ValidationStatus } from '../../types';
import { ValidationBadge } from './ValidationBadge';

interface CalculationCardProps {
  label: string;
  value: string | number;
  unit?: string;
  formula?: string;
  status?: ValidationStatus;
  statusLabel?: string;
  secondaryInfo?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  className?: string;
}

export const CalculationCard: React.FC<CalculationCardProps> = ({
  label,
  value,
  unit,
  formula,
  status,
  statusLabel,
  secondaryInfo,
  icon,
  highlight = false,
  className = '',
}) => {
  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 ${
        highlight
          ? 'bg-gradient-to-br from-emerald-500/[0.08] to-teal-500/[0.03] border-emerald-500/40 hover:border-emerald-500/60 shadow-sm shadow-emerald-500/10'
          : 'bg-white dark:bg-[#0c1220] border-slate-200/90 dark:border-[#1a2234] hover:border-slate-300 dark:hover:border-[#283550] shadow-card dark:shadow-card-dark'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {status && <ValidationBadge status={status} label={statusLabel} />}
          {icon && (
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#141d30] text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight tabular-nums ${
          highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
        }`}>
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {secondaryInfo && (
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          {secondaryInfo}
        </div>
      )}

      {formula && (
        <div
          className="mt-3 pt-2 border-t border-slate-100 dark:border-[#162035] text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate"
          title={formula}
        >
          {formula}
        </div>
      )}
    </div>
  );
};
