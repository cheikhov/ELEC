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
  highlight = false,
  className = '',
}) => {
  return (
    <div
      className={`p-5 rounded-xl border transition-all ${
        highlight
          ? 'bg-emerald-500/[0.04] border-emerald-500/30 shadow-xs'
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
          {label}
        </span>
        {status && <ValidationBadge status={status} label={statusLabel} />}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className={`text-2xl font-semibold font-mono tracking-tight tabular-nums ${
          highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'
        }`}>
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
            {unit}
          </span>
        )}
      </div>

      {secondaryInfo && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {secondaryInfo}
        </div>
      )}

      {formula && (
        <div
          className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] font-mono text-zinc-400 dark:text-zinc-500 truncate"
          title={formula}
        >
          {formula}
        </div>
      )}
    </div>
  );
};
