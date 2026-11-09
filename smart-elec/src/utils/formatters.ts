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
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-500',
      };
    case 'in_progress':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-500/20',
        dot: 'bg-blue-500',
      };
    case 'archived':
      return {
        bg: 'bg-slate-500/10',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-500/20',
        dot: 'bg-slate-400',
      };
    case 'draft':
    default:
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-500/20',
        dot: 'bg-amber-500',
      };
  }
}

export function getValidationBadgeStyle(status: ValidationStatus): { bg: string; text: string; border: string; icon: string } {
  switch (status) {
    case 'pass':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-500/20',
        icon: '✓',
      };
    case 'fail':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-500/20',
        icon: '✕',
      };
    case 'warning':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-500/20',
        icon: '⚠',
      };
    case 'incomplete':
      return {
        bg: 'bg-slate-500/10',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-500/20',
        icon: '○',
      };
    case 'missing_data':
    default:
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-500/20',
        icon: '?',
      };
  }
}
