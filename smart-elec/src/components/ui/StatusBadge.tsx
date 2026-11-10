/**
 * SMART ELEC — StatusBadge Component
 * Modern engineering status pill with subtle dot indicator and clean contrast.
 */

import React from 'react';
import type { ProjectStatus } from '../../types';
import { getStatusBadgeStyle } from '../../utils/formatters';
import { useI18n } from '../../i18n';

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const { t } = useI18n();
  const style = getStatusBadgeStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap select-none ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span>{t(`projects.status.${status}`)}</span>
    </span>
  );
};
