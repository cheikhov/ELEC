/**
 * SMART ELEC — CalculationCard Component
 * Sleek, modern technical metric widget with tabular numbers, formula reference, and compliance tag.
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
  highlight = false,
  className = '',
}) => {
  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        highlight
          ? 'bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] border-emerald-500/40 dark:border-emerald-500/30'
          : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800/80'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
          {label}
        </span>
        {status && <ValidationBadge status={status} label={statusLabel} />}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className={`text-xl font-bold font-mono tracking-tight tabular-nums ${
          highlight ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
        }`}>
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">
            {unit}
          </span>
        )}
      </div>

      {secondaryInfo && (
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {secondaryInfo}
        </div>
      )}

      {formula && (
        <div
          className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate"
          title={formula}
        >
          {formula}
        </div>
      )}
    </div>
  );
};
