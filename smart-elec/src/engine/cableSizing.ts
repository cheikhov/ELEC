/**
 * SMART ELEC — Cable Sizing Calculation Engine
 *
 * Deterministic cable sizing based on:
 * 1. Current carrying capacity (IEC 60364-5-52)
 * 2. Correction factors (temperature, grouping)
 * 3. Voltage drop calculation
 * 4. Short-circuit thermal withstand (IEC 60364-4-43)
 *
 * References:
 * - IEC 60364-5-52: Selection and erection of electrical equipment — Wiring systems
 * - IEC 60364-4-43: Protection for safety — Protection against overcurrent
 *
 * IMPORTANT: This module provides preliminary cable sizing only.
 * Final selection must account for specific installation conditions
 * and be validated by a qualified electrical professional.
 */

import type {
  CableSizingInput,
  CableSizingResult,
  CorrectionFactors,
  ValidationItem,
  CalculationTrace,
} from '../types';

// ─── Standard Cable Sections (mm²) ──────────────────────────────────────────

export const STANDARD_SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630];

// ─── Current Carrying Capacity Tables (simplified) ──────────────────────────
// Based on IEC 60364-5-52, Table B.52.2 and similar
// Values in Amperes for copper conductors, 3 loaded conductors
// Installation method B1 (conduit in thermally insulated wall)

/**
 * Current carrying capacity for copper, PVC insulation, method B1
 * Reference: IEC 60364-5-52, Table B.52.4
 * Columns: [section_mm2, 2_loaded_conductors_A, 3_loaded_conductors_A]
 */
const COPPER_PVC_B1: [number, number, number][] = [
  [1.5,   17.5,  15.5],
  [2.5,   24,    21],
  [4,     32,    28],
  [6,     41,    36],
  [10,    57,    50],
  [16,    76,    68],
  [25,    101,   89],
  [35,    125,   110],
  [50,    151,   134],
  [70,    192,   171],
  [95,    232,   207],
  [120,   269,   239],
  [150,   309,   275],
  [185,   353,   314],
  [240,   415,   370],
  [300,   480,   427],
];

/**
 * Current carrying capacity for copper, XLPE insulation, method B1
 * Reference: IEC 60364-5-52, Table B.52.4
 */
const COPPER_XLPE_B1: [number, number, number][] = [
  [1.5,   23,    19.5],
  [2.5,   31,    27],
  [4,     42,    36],
  [6,     54,    46],
  [10,    75,    65],
  [16,    100,   87],
  [25,    133,   114],
  [35,    164,   141],
  [50,    198,   170],
  [70,    253,   217],
  [95,    306,   264],
  [120,   354,   304],
  [150,   407,   349],
  [185,   464,   399],
  [240,   546,   471],
  [300,   628,   541],
];

/**
 * Current carrying capacity for aluminium, PVC insulation, method B1
 */
const ALUMINIUM_PVC_B1: [number, number, number][] = [
  [2.5,   18.5,  16.5],
  [4,     25,    22],
  [6,     32,    28],
  [10,    44,    39],
  [16,    59,    53],
  [25,    78,    70],
  [35,    97,    86],
  [50,    118,   104],
  [70,    150,   133],
  [95,    181,   161],
  [120,   210,   186],
  [150,   241,   214],
  [185,   276,   245],
  [240,   324,   287],
  [300,   375,   333],
];

/**
 * Current carrying capacity for aluminium, XLPE insulation, method B1
 */
const ALUMINIUM_XLPE_B1: [number, number, number][] = [
  [2.5,   24,    21],
  [4,     32,    28],
  [6,     42,    36],
  [10,    58,    50],
  [16,    77,    67],
  [25,    103,   89],
  [35,    127,   110],
  [50,    154,   133],
  [70,    197,   170],
  [95,    239,   207],
  [120,   276,   239],
  [150,   318,   275],
  [185,   362,   314],
  [240,   426,   370],
  [300,   490,   427],
];

/**
 * Select the appropriate current capacity table based on material and insulation.
 */
function getCapacityTable(material: string, insulation: string): [number, number, number][] {
  if (material === 'copper') {
    return insulation === 'PVC' ? COPPER_PVC_B1 : COPPER_XLPE_B1;
  }
  return insulation === 'PVC' ? ALUMINIUM_PVC_B1 : ALUMINIUM_XLPE_B1;
}

/**
 * Get current carrying capacity for a given section size.
 *
 * @param section_mm2 - Cable cross-section in mm²
 * @param conductors - Number of loaded conductors (2 or 3)
 * @param material - 'copper' or 'aluminium'
 * @param insulation - 'PVC', 'XLPE', or 'EPR' (EPR uses XLPE values)
 * @returns Current capacity in Amperes, or 0 if section not found
 */
export function getCurrentCapacity(
  section_mm2: number,
  conductors: number,
  material: string,
  insulation: string
): number {
  const effectiveInsulation = insulation === 'EPR' ? 'XLPE' : insulation;
  const table = getCapacityTable(material, effectiveInsulation);
  const row = table.find(r => r[0] === section_mm2);
  if (!row) return 0;
  return conductors <= 2 ? row[1] : row[2];
}

// ─── Correction Factors ──────────────────────────────────────────────────────

/**
 * Temperature correction factor.
 *
 * Based on IEC 60364-5-52, Table B.52.14/B.52.15
 * Reference temperature: 30°C for PVC, 40°C for XLPE/EPR (ambient)
 *
 * Formula (simplified):
 *   k_t = √((T_max - T_ambient) / (T_max - T_ref))
 *   where T_max = 70°C (PVC) or 90°C (XLPE/EPR)
 *         T_ref = 30°C
 */
export function getTemperatureCorrectionFactor(ambientTemp_C: number, insulation: string): number {
  const tMax = insulation === 'PVC' ? 70 : 90;
  const tRef = 30;

  if (ambientTemp_C >= tMax) return 0; // Cannot operate at or above max temp
  if (ambientTemp_C <= 0) return 1.0; // Below reference, use 1.0 conservatively

  const factor = Math.sqrt((tMax - ambientTemp_C) / (tMax - tRef));
  return Math.round(factor * 100) / 100;
}

/**
 * Grouping (proximity) correction factor.
 *
 * Based on IEC 60364-5-52, Table B.52.17
 * Simplified table for cables in a single layer.
 *
 * Number of grouped cables → correction factor
 */
export function getGroupingCorrectionFactor(numberOfCables: number): number {
  if (numberOfCables <= 1) return 1.0;
  if (numberOfCables === 2) return 0.80;
  if (numberOfCables === 3) return 0.70;
  if (numberOfCables === 4) return 0.65;
  if (numberOfCables === 5) return 0.60;
  if (numberOfCables === 6) return 0.57;
  if (numberOfCables <= 8) return 0.52;
  if (numberOfCables <= 12) return 0.48;
  if (numberOfCables <= 16) return 0.44;
  if (numberOfCables <= 20) return 0.41;
  return 0.38;
}

// ─── Voltage Drop Calculation ────────────────────────────────────────────────

/**
 * Resistivity of conductor materials at 20°C (Ω·mm²/m).
 *   Copper:    0.0225
 *   Aluminium: 0.036
 */
function getResistivity(material: string): number {
  return material === 'copper' ? 0.0225 : 0.036;
}

/**
 * Calculate voltage drop.
 *
 * Formula (simplified, resistive component only):
 *   Single-phase: ΔV = 2 × ρ × L × I / S
 *   Three-phase:  ΔV = √3 × ρ × L × I / S
 *
 * where:
 *   ρ = resistivity (Ω·mm²/m)
 *   L = cable length (m)
 *   I = load current (A)
 *   S = cable section (mm²)
 *
 * Returns voltage drop in Volts.
 */
export function calculateVoltageDrop(
  current_A: number,
  length_m: number,
  section_mm2: number,
  material: string,
  phaseType: string
): number {
  const rho = getResistivity(material);
  const multiplier = phaseType === 'three_phase' ? Math.sqrt(3) : 2;
  return multiplier * rho * length_m * current_A / section_mm2;
}

/**
 * Calculate voltage drop as percentage.
 */
export function calculateVoltageDropPercent(
  voltageDrop_V: number,
  networkVoltage_V: number
): number {
  if (networkVoltage_V <= 0) return 0;
  return (voltageDrop_V / networkVoltage_V) * 100;
}

// ─── Short-Circuit Thermal Withstand ─────────────────────────────────────────

/**
 * Check short-circuit thermal withstand of cable.
 *
 * Formula (IEC 60364-4-43, adiabatic equation):
 *   S_min = I_sc × √t / k
 *
 * where:
 *   I_sc = short-circuit current (A)
 *   t = fault duration (s)
 *   k = constant depending on conductor material and insulation:
 *     Copper/PVC: 115
 *     Copper/XLPE: 143
 *     Aluminium/PVC: 76
 *     Aluminium/XLPE: 94
 *
 * @returns minimum required section in mm², or null if data is insufficient
 */
export function checkShortCircuitWithstand(
  shortCircuitCurrent_kA: number | undefined,
  duration_s: number | undefined,
  material: string,
  insulation: string,
  proposedSection_mm2: number
): { passes: boolean; minimumSection_mm2: number } | null {
  if (!shortCircuitCurrent_kA || !duration_s) return null;

  let k: number;
  if (material === 'copper') {
    k = insulation === 'PVC' ? 115 : 143;
  } else {
    k = insulation === 'PVC' ? 76 : 94;
  }

  const Isc_A = shortCircuitCurrent_kA * 1000;
  const minSection = (Isc_A * Math.sqrt(duration_s)) / k;
  const roundedMin = Math.ceil(minSection * 10) / 10;

  return {
    passes: proposedSection_mm2 >= roundedMin,
    minimumSection_mm2: roundedMin,
  };
}

// ─── Main Cable Sizing Function ──────────────────────────────────────────────

/**
 * Perform complete cable sizing calculation.
 *
 * Methodology:
 * 1. Determine correction factors (temperature + grouping)
 * 2. Calculate derated capacity requirement: I_required = I_load / (k_temp × k_group)
 * 3. Select smallest standard section meeting capacity
 * 4. Check voltage drop against permitted limit
 * 5. If voltage drop fails, increase section
 * 6. Check short-circuit withstand if data available
 * 7. Return proposed section with full traceability
 *
 * @param input - Cable sizing input parameters
 * @returns CableSizingResult with proposed section and validation
 */
export function calculateCableSizing(input: CableSizingInput): CableSizingResult {
  const warnings: string[] = [];
  const validations: ValidationItem[] = [];

  // Step 1: Correction factors
  const kTemp = getTemperatureCorrectionFactor(input.ambientTemperature_C, input.insulationType);
  const kGroup = getGroupingCorrectionFactor(input.cableGrouping);
  const kCombined = Math.round(kTemp * kGroup * 100) / 100;

  const correctionFactors: CorrectionFactors = {
    temperature: kTemp,
    grouping: kGroup,
    combined: kCombined,
  };

  // Step 2: Required capacity (before correction)
  const requiredCapacity = kCombined > 0 ? input.loadCurrent_A / kCombined : input.loadCurrent_A;

  // Step 3: Find smallest section meeting current capacity
  const effectiveInsulation = input.insulationType === 'EPR' ? 'XLPE' : input.insulationType;
  const table = getCapacityTable(input.conductorMaterial, effectiveInsulation);

  let selectedSection = 0;
  let tabularCapacity = 0;

  for (const [section, cap2, cap3] of table) {
    const cap = input.numberOfLoadedConductors <= 2 ? cap2 : cap3;
    if (cap >= requiredCapacity) {
      selectedSection = section;
      tabularCapacity = cap;
      break;
    }
  }

  if (selectedSection === 0) {
    // No single cable sufficient — take largest available
    const lastRow = table[table.length - 1];
    selectedSection = lastRow[0];
    tabularCapacity = input.numberOfLoadedConductors <= 2 ? lastRow[1] : lastRow[2];
    warnings.push('Required current exceeds single cable capacity. Consider parallel cables or busbar.');
  }

  const deratedCapacity = Math.round(tabularCapacity * kCombined * 100) / 100;

  // Validate current capacity
  validations.push({
    criterion: 'Current carrying capacity',
    value: `${deratedCapacity} A ≥ ${input.loadCurrent_A} A`,
    status: deratedCapacity >= input.loadCurrent_A ? 'pass' : 'fail',
    message: deratedCapacity < input.loadCurrent_A ? 'Derated capacity insufficient for load current' : undefined,
  });

  // Step 4: Check voltage drop
  let vDrop_V = calculateVoltageDrop(
    input.loadCurrent_A,
    input.cableLength_m,
    selectedSection,
    input.conductorMaterial,
    input.phaseType
  );
  let vDrop_pct = calculateVoltageDropPercent(vDrop_V, input.networkVoltage_V);

  // Step 5: If voltage drop exceeds limit, increase section
  let sectionIdx = STANDARD_SECTIONS.indexOf(selectedSection);
  while (vDrop_pct > input.permittedVoltageDrop_percent && sectionIdx < STANDARD_SECTIONS.length - 1) {
    sectionIdx++;
    selectedSection = STANDARD_SECTIONS[sectionIdx];
    vDrop_V = calculateVoltageDrop(
      input.loadCurrent_A,
      input.cableLength_m,
      selectedSection,
      input.conductorMaterial,
      input.phaseType
    );
    vDrop_pct = calculateVoltageDropPercent(vDrop_V, input.networkVoltage_V);

    // Update capacity for new section
    const newCap = getCurrentCapacity(
      selectedSection,
      input.numberOfLoadedConductors,
      input.conductorMaterial,
      input.insulationType
    );
    if (newCap > 0) {
      // tabularCapacity = newCap; // Not used further
    }
  }

  vDrop_V = Math.round(vDrop_V * 100) / 100;
  vDrop_pct = Math.round(vDrop_pct * 100) / 100;

  validations.push({
    criterion: 'Voltage drop',
    value: `${vDrop_pct}% (${vDrop_V} V)`,
    status: vDrop_pct <= input.permittedVoltageDrop_percent ? 'pass' : 'fail',
    message: vDrop_pct > input.permittedVoltageDrop_percent
      ? `Exceeds ${input.permittedVoltageDrop_percent}% limit`
      : undefined,
  });

  // Step 6: Short-circuit check
  let scWithstand: boolean | null = null;
  const scResult = checkShortCircuitWithstand(
    input.shortCircuitCurrent_kA,
    input.shortCircuitDuration_s,
    input.conductorMaterial,
    input.insulationType,
    selectedSection
  );

  if (scResult) {
    scWithstand = scResult.passes;
    validations.push({
      criterion: 'Short-circuit withstand',
      value: `${selectedSection} mm² ≥ ${scResult.minimumSection_mm2} mm²`,
      status: scResult.passes ? 'pass' : 'fail',
      message: !scResult.passes
        ? `Minimum section for short-circuit: ${scResult.minimumSection_mm2} mm²`
        : undefined,
    });
    if (!scResult.passes) {
      warnings.push(`Cable section ${selectedSection} mm² does not meet short-circuit withstand requirement.`);
    }
  } else {
    validations.push({
      criterion: 'Short-circuit withstand',
      value: 'Not evaluated',
      status: 'incomplete',
      message: 'Short-circuit current or duration not provided',
    });
  }

  // Protection compatibility (simplified check)
  validations.push({
    criterion: 'Protection compatibility',
    value: 'Verify Ib ≤ In ≤ Iz',
    status: 'warning',
    message: 'Verify that protection device nominal current satisfies Ib ≤ In ≤ Iz (derated cable capacity)',
  });

  const isComplete = input.loadCurrent_A > 0 && input.cableLength_m > 0 && input.networkVoltage_V > 0;

  const trace: CalculationTrace = {
    inputs: {
      'Load current (A)': input.loadCurrent_A,
      'Cable length (m)': input.cableLength_m,
      'Material': input.conductorMaterial,
      'Insulation': input.insulationType,
      'Installation method': input.installationMethod,
      'Ambient temperature (°C)': input.ambientTemperature_C,
      'Cable grouping': input.cableGrouping,
      'Loaded conductors': input.numberOfLoadedConductors,
      'Permitted voltage drop (%)': input.permittedVoltageDrop_percent,
      'Network voltage (V)': input.networkVoltage_V,
      'Phase type': input.phaseType,
    },
    assumptions: [
      `Temperature correction factor: ${kTemp}`,
      `Grouping correction factor: ${kGroup}`,
      `Combined correction factor: ${kCombined}`,
      'Current capacity values from IEC 60364-5-52 tables (method B1)',
      'Voltage drop calculated using resistive component only (simplified)',
    ],
    formulaRef: 'IEC 60364-5-52 (current capacity), ΔV = k × ρ × L × I / S (voltage drop), S_min = I_sc × √t / k (short-circuit)',
    result: {
      'Proposed section (mm²)': selectedSection,
      'Voltage drop (%)': vDrop_pct,
      'Voltage drop (V)': vDrop_V,
      'Derated capacity (A)': deratedCapacity,
    },
    validations,
    warnings,
  };

  return {
    proposedSection_mm2: selectedSection,
    currentCapacity_A: tabularCapacity,
    voltageDrop_percent: vDrop_pct,
    voltageDrop_V: vDrop_V,
    shortCircuitWithstand: scWithstand,
    correctionFactors,
    derated_currentCapacity_A: deratedCapacity,
    criteriaResults: validations,
    trace,
    isComplete,
  };
}
