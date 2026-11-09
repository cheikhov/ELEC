/**
 * SMART ELEC — Modern EmptyState Component
 * Clean, modern placeholder with clear actions and soft dashed border.
 */

import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 rounded-xl ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
          {icon}
        </div>
      )}

      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>

      {description && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
          {description}
        </p>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="eng-btn-primary"
            >
              {actionLabel}
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="eng-btn"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
