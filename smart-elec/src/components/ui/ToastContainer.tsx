/**
 * SMART ELEC — Modern Toast Notification Container
 * Minimal, accessible, floating notification stack.
 * Inspired by shadcn/ui toast system.
 */

import React from 'react';
import { useApp } from '../../stores/appStore';
import { CheckIcon, AlertTriangleIcon, InfoIcon, XIcon } from './Icons';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-lg dark:shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 select-none"
          >
            {/* Icon Pill */}
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                isSuccess
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : isWarning
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : isError
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
              }`}
            >
              {isSuccess && <CheckIcon className="w-4 h-4" />}
              {isWarning && <AlertTriangleIcon className="w-4 h-4" />}
              {isError && <AlertTriangleIcon className="w-4 h-4" />}
              {isInfo && <InfoIcon className="w-4 h-4" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              {toast.title && (
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {toast.title}
                </div>
              )}
              <div className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5 leading-snug">
                {toast.message}
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Fermer"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

