/**
 * SMART ELEC — Engineering Value Formatters
 * Consistent formatting for electrical values, units, and timestamps.
 * Preserves technical units (kW, kVA, kVAr, A, V, Hz, mm²).
 */

import type { ValidationStatus, ProjectStatus } from '../types';

export function formatPower(val: number | undefined | null, unit: string = 'kW'): string {
  if (val === undefined || val === null || isNaN(val)) return '—';
  return `${Number(val.toFixed(2)).toLocaleString()} ${unit}`;
}

export function formatCurrent(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '—';
  return `${Number(val.toFixed(2)).toLocaleString()} A`;
}

export function formatVoltage(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '—';
  return `${Number(val.toFixed(1)).toLocaleString()} V`;
}

export function formatPercentage(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '—';
  return `${Number(val.toFixed(2)).toLocaleString()} %`;
}

export function formatSection(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '—';
  return `${val} mm²`;
}

export function formatDate(dateStr: string | undefined | null, locale: string = 'fr'): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function getStatusBadgeStyle(status: ProjectStatus): { bg: string; text: string; border: string; dot: string } {
  switch (status) {
    case 'completed':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]',
      };
    case 'in_progress':
      return {
        bg: 'bg-sky-500/10 dark:bg-sky-500/15',
        text: 'text-sky-700 dark:text-sky-300',
        border: 'border-sky-500/30',
        dot: 'bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.5)]',
      };
    case 'archived':
      return {
        bg: 'bg-slate-100 dark:bg-slate-800/80',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-700',
        dot: 'bg-slate-400',
      };
    case 'draft':
    default:
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-500/30',
        dot: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]',
      };
  }
}

export function getValidationBadgeStyle(status: ValidationStatus): { bg: string; text: string; border: string; icon: string } {
  switch (status) {
    case 'pass':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-500/30',
        icon: '✓',
      };
    case 'fail':
      return {
        bg: 'bg-rose-500/10 dark:bg-rose-500/15',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-500/30',
        icon: '✕',
      };
    case 'warning':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-500/30',
        icon: '⚠',
      };
    case 'incomplete':
      return {
        bg: 'bg-slate-100 dark:bg-slate-800/80',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-700',
        icon: '○',
      };
    case 'missing_data':
    default:
      return {
        bg: 'bg-rose-500/10 dark:bg-rose-500/15',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-500/30',
        icon: '!',
      };
  }
}
