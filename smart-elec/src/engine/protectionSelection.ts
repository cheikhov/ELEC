/**
 * SMART ELEC — Protection Selection Assistance Engine
 *
 * Provides preliminary recommendations for protective devices:
 * - Circuit breakers (MCBs/MCCBs)
 * - Fuses
 * - Residual Current Devices (RCDs)
 * - Thermal relays (for motors)
 *
 * References:
 * - IEC 60364-4-43: Protection against overcurrent
 * - IEC 60364-4-41: Protection against electric shock
 * - IEC 60898: Circuit breakers for overcurrent protection
 *
 * IMPORTANT: This module provides assistance only.
 * Complete protection coordination requires detailed study
 * and must be validated by a qualified professional.
 */

import type {
  ProtectionInput,
  ProtectionRecommendation,
  ProtectionDeviceType,
  TripCurve,
  CalculationTrace,
  ValidationItem,
} from '../types';

// ─── Standard Nominal Current Ratings ────────────────────────────────────────

/** Standard MCB ratings (Amperes), per IEC 60898 */
export const STANDARD_MCB_RATINGS = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63];

/** Standard MCCB ratings (Amperes) */
export const STANDARD_MCCB_RATINGS = [16, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600];

/** Standard fuse ratings (Amperes) */
export const STANDARD_FUSE_RATINGS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630];

/** Standard RCD sensitivities (mA) */
export const STANDARD_RCD_SENSITIVITIES = [10, 30, 100, 300, 500];

/**
 * Select the next standard rating >= the design current.
 *
 * Rule: Ib ≤ In ≤ Iz
 *   Ib = design current
 *   In = nominal current of protective device
 *   Iz = current carrying capacity of cable
 *
 * @param designCurrent_A - The circuit design current
 * @param ratings - Array of standard ratings to choose from
 * @returns Selected rating, or the largest available if none sufficient
 */
export function selectNominalCurrent(designCurrent_A: number, ratings: number[]): number {
  const selected = ratings.find(r => r >= designCurrent_A);
  return selected ?? ratings[ratings.length - 1];
}

/**
 * Determine recommended trip curve.
 *
 * Trip curve selection guidelines:
 *   B: General purpose, resistive loads (lighting, sockets, heating)
 *       Trips at 3–5× In (magnetic)
 *   C: General purpose with moderate inrush (small motors, mixed loads)
 *       Trips at 5–10× In (magnetic)
 *   D: High inrush loads (motors, transformers, X-ray equipment)
 *       Trips at 10–20× In (magnetic)
 *   K: Very high inrush (motors with heavy starting)
 *       Trips at 10–14× In (magnetic)
 */
export function recommendTripCurve(isMotor: boolean, loadType: string): TripCurve {
  if (isMotor) return 'D';
  switch (loadType) {
    case 'lighting':
    case 'sockets':
    case 'heating':
      return 'B';
    case 'air_conditioning':
    case 'it_equipment':
      return 'C';
    case 'pumps':
    case 'motors':
    case 'elevators':
      return 'D';
    case 'medical_equipment':
      return 'C';
    default:
      return 'C';
  }
}

/**
 * Recommend RCD sensitivity based on application.
 *
 * Guidelines (IEC 60364-4-41):
 *   30 mA:  Protection against direct contact / additional protection
 *           Required for socket outlets ≤ 32 A, bathrooms, outdoor
 *   100 mA: Fire protection in some applications
 *   300 mA: Fire protection, equipment protection
 *   500 mA: Large installations, upstream discrimination
 */
export function recommendRCDSensitivity(loadType: string, designCurrent_A: number): number {
  // Socket outlets ≤ 32 A always need 30 mA
  if (loadType === 'sockets' && designCurrent_A <= 32) return 30;
  // Medical areas need high sensitivity
  if (loadType === 'medical_equipment') return 30;
  // Lighting in wet areas
  if (loadType === 'lighting') return 30;
  // General protection
  if (designCurrent_A <= 63) return 30;
  // Larger circuits
  return 300;
}

/**
 * Generate protection recommendations for a circuit.
 *
 * @param input - Protection input parameters
 * @returns Array of ProtectionRecommendation (may include multiple device types)
 */
export function calculateProtection(input: ProtectionInput): ProtectionRecommendation[] {
  const recommendations: ProtectionRecommendation[] = [];
  const warnings: string[] = [];
  const validations: ValidationItem[] = [];

  // ── Determine if MCB or MCCB ──
  const isMCBRange = input.designCurrent_A <= 63;
  const ratings = isMCBRange ? STANDARD_MCB_RATINGS : STANDARD_MCCB_RATINGS;
  const deviceType: ProtectionDeviceType = 'circuit_breaker';

  const nominalCurrent = selectNominalCurrent(input.designCurrent_A, ratings);
  const tripCurve = recommendTripCurve(input.isMotor, input.loadType);

  // Validate Ib ≤ In ≤ Iz condition
  const ibLeqIn = input.designCurrent_A <= nominalCurrent;
  const inLeqIz = input.cableCapacity_A > 0 ? nominalCurrent <= input.cableCapacity_A : true;

  validations.push({
    criterion: 'Ib ≤ In (design current ≤ nominal)',
    value: `${input.designCurrent_A} A ≤ ${nominalCurrent} A`,
    status: ibLeqIn ? 'pass' : 'fail',
  });

  if (input.cableCapacity_A > 0) {
    validations.push({
      criterion: 'In ≤ Iz (nominal ≤ cable capacity)',
      value: `${nominalCurrent} A ≤ ${input.cableCapacity_A} A`,
      status: inLeqIz ? 'pass' : 'fail',
      message: !inLeqIz ? 'Protection device rating exceeds cable capacity' : undefined,
    });
  } else {
    validations.push({
      criterion: 'In ≤ Iz (nominal ≤ cable capacity)',
      value: 'Cable capacity not provided',
      status: 'incomplete',
      message: 'Cannot verify In ≤ Iz without cable capacity',
    });
  }

  // Breaking capacity check
  if (input.shortCircuitCurrent_kA) {
    validations.push({
      criterion: 'Breaking capacity',
      value: `Icu ≥ ${input.shortCircuitCurrent_kA} kA required`,
      status: 'warning',
      message: 'Verify that selected device breaking capacity ≥ prospective fault current',
    });
  }

  const cbNotes: string[] = [];
  cbNotes.push(`${isMCBRange ? 'MCB' : 'MCCB'} recommended`);
  cbNotes.push(`Trip curve ${tripCurve}`);
  if (input.isMotor) {
    cbNotes.push('Motor circuit — consider motor-rated circuit breaker');
    cbNotes.push('Verify coordination with thermal relay / overload relay');
  }
  if (!ibLeqIn || !inLeqIz) {
    cbNotes.push('WARNING: Ib ≤ In ≤ Iz condition not satisfied — review cable/device selection');
  }

  const cbTrace: CalculationTrace = {
    inputs: {
      'Design current (A)': input.designCurrent_A,
      'Cable capacity (A)': input.cableCapacity_A || 'Not provided',
      'Short-circuit current (kA)': input.shortCircuitCurrent_kA || 'Not provided',
      'Load type': input.loadType,
      'Is motor': input.isMotor ? 'Yes' : 'No',
      'Phase type': input.phaseType,
    },
    assumptions: [
      'Standard nominal current ratings per IEC 60898 / IEC 60947',
      'Trip curve selection based on load type guidelines',
      'Breaking capacity must be verified against actual fault levels',
    ],
    formulaRef: 'IEC 60364-4-43: Ib ≤ In ≤ Iz; IEC 60898 (MCB); IEC 60947-2 (MCCB)',
    result: {
      'Nominal current (A)': nominalCurrent,
      'Trip curve': tripCurve,
      'Device type': isMCBRange ? 'MCB' : 'MCCB',
    },
    validations,
    warnings,
  };

  recommendations.push({
    deviceType,
    nominalCurrent_A: nominalCurrent,
    breakingCapacity_kA: input.shortCircuitCurrent_kA,
    tripCurve,
    notes: cbNotes,
    isComplete: input.designCurrent_A > 0,
    trace: cbTrace,
  });

  // ── RCD Recommendation ──
  const rcdSensitivity = recommendRCDSensitivity(input.loadType, input.designCurrent_A);
  const rcdNotes: string[] = [];
  rcdNotes.push(`${rcdSensitivity} mA sensitivity recommended`);
  if (rcdSensitivity === 30) {
    rcdNotes.push('Provides additional protection against direct contact');
  }
  if (input.loadType === 'sockets') {
    rcdNotes.push('Required for socket outlets ≤ 32 A per IEC 60364-4-41');
  }

  const rcdTrace: CalculationTrace = {
    inputs: { 'Load type': input.loadType, 'Design current (A)': input.designCurrent_A },
    assumptions: ['RCD sensitivity based on IEC 60364-4-41 guidelines'],
    formulaRef: 'IEC 60364-4-41: Additional protection',
    result: { 'RCD sensitivity (mA)': rcdSensitivity },
    validations: [],
    warnings: [],
  };

  recommendations.push({
    deviceType: 'rcd',
    nominalCurrent_A: nominalCurrent, // RCD rated ≥ CB rated
    rcdSensitivity_mA: rcdSensitivity,
    notes: rcdNotes,
    isComplete: true,
    trace: rcdTrace,
  });

  // ── Thermal Relay for Motors ──
  if (input.isMotor) {
    const thermalNotes = [
      'Thermal overload relay required for motor protection',
      `Set to motor full-load current: ${input.designCurrent_A} A`,
      'Class 10 for general applications, Class 20 for heavy-duty starting',
      'Verify trip class suits motor starting conditions',
    ];

    const thermalTrace: CalculationTrace = {
      inputs: { 'Motor full-load current (A)': input.designCurrent_A },
      assumptions: ['Thermal relay set to motor FLC', 'Class 10 assumed for general use'],
      formulaRef: 'IEC 60947-4-1: Motor starters and contactors',
      result: { 'Setting (A)': input.designCurrent_A },
      validations: [],
      warnings: ['Verify actual motor FLC from nameplate data'],
    };

    recommendations.push({
      deviceType: 'thermal_relay',
      nominalCurrent_A: input.designCurrent_A,
      notes: thermalNotes,
      isComplete: true,
      trace: thermalTrace,
    });
  }

  return recommendations;
}
