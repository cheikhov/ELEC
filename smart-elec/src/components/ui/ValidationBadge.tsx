/**
 * SMART ELEC — ValidationBadge Component
 * Modern engineering compliance tag (PASS, FAIL, WARN, INCOMPLETE).
 */

import React from 'react';
import type { ValidationStatus } from '../../types';
import { getValidationBadgeStyle } from '../../utils/formatters';

interface ValidationBadgeProps {
  status: ValidationStatus;
  label?: string;
  className?: string;
}

export const ValidationBadge: React.FC<ValidationBadgeProps> = ({ status, label, className = '' }) => {
  const style = getValidationBadgeStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span>{style.icon}</span>
      <span>{label || status.toUpperCase()}</span>
    </span>
  );
};
