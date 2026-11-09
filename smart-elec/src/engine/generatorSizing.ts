/**
 * SMART ELEC — Generator Sizing Calculation Engine
 *
 * Preliminary generator sizing based on load analysis.
 * Considers steady-state and transient/starting requirements.
 *
 * References:
 * - IEC 60034: Rotating electrical machines
 * - General generator sizing methodology
 *
 * IMPORTANT: This is a PRELIMINARY ESTIMATE only.
 * Final generator selection must be validated by a qualified professional.
 */

import type {
  ElectricalLoad,
  ElectricalNetwork,
  GeneratorSizingResult,
  MotorStartingInfo,
  StartingMethod,
  CalculationTrace,
} from '../types';
import { calcInstalledPower, calcDemandPower, calcReactivePower, calcApparentPower } from './powerBalance';

/**
 * Starting current multipliers by starting method.
 *
 * These are typical values used for preliminary sizing:
 *   - Direct On Line (DOL): 6–8× rated current → use 7×
 *   - Star-Delta: ~2–3× rated current → use 2.5×
 *   - Soft Starter: ~2–4× rated current → use 3×
 *   - VFD: ~1–1.5× rated current → use 1.2×
 *   - Autotransformer: ~2–4× rated current → use 2.5×
 *
 * IMPORTANT: Actual starting currents depend on motor characteristics.
 * These multipliers are for preliminary estimation only.
 */
export function getStartingCurrentMultiplier(method: StartingMethod): number {
  switch (method) {
    case 'direct': return 7.0;
    case 'star_delta': return 2.5;
    case 'soft_starter': return 3.0;
    case 'vfd': return 1.2;
    case 'autotransformer': return 2.5;
    case 'not_applicable': return 1.0;
    default: return 1.0;
  }
}

/**
 * Identify motor loads and calculate their starting requirements.
 *
 * Motors and pumps are identified by category.
 * Starting power is estimated as:
 *   P_starting = P_rated × startingMultiplier / powerFactor
 */
function analyzeMotorStarting(loads: ElectricalLoad[]): MotorStartingInfo[] {
  const motorCategories = ['motors', 'pumps', 'elevators', 'air_conditioning'];

  return loads
    .filter(l => motorCategories.includes(l.category) || l.startingMethod !== 'not_applicable')
    .map(load => {
      const ratedPower_kW = calcInstalledPower(load);
      const multiplier = getStartingCurrentMultiplier(load.startingMethod);
      const pf = load.powerFactor > 0 ? load.powerFactor : 0.85;
      const startingPower_kVA = (ratedPower_kW * multiplier) / pf;

      return {
        loadName: load.name,
        ratedPower_kW,
        startingMethod: load.startingMethod,
        startingCurrentMultiplier: multiplier,
        startingPower_kVA: Math.round(startingPower_kVA * 100) / 100,
      };
    });
}

/**
 * Calculate preliminary generator sizing.
 *
 * Methodology:
 * 1. Calculate total steady-state demand power by priority group
 * 2. Calculate weighted average power factor
 * 3. Determine apparent power: S = P / cosφ
 * 4. Analyze motor starting transients
 * 5. Apply engineering margin
 * 6. Recommend generator size (preliminary)
 *
 * The generator must handle:
 *   - Continuous steady-state demand
 *   - Worst-case motor starting transient (largest single motor start)
 *
 * @param loads - Array of electrical loads
 * @param network - Electrical network parameters
 * @param engineeringMargin - Safety margin fraction (e.g., 0.15 for 15%)
 */
export function calculateGeneratorSizing(
  loads: ElectricalLoad[],
  network: ElectricalNetwork,
  engineeringMargin: number = 0.15
): GeneratorSizingResult {
  const warnings: string[] = [];

  if (loads.length === 0) {
    warnings.push('No loads defined. Cannot size generator.');
  }

  // Group loads by priority
  const essential = loads.filter(l => l.priority === 'essential');
  const priority = loads.filter(l => l.priority === 'priority');
  const nonPriority = loads.filter(l => l.priority === 'non_priority');

  const essentialPower = essential.reduce((s, l) => s + calcDemandPower(l), 0);
  const priorityPower = priority.reduce((s, l) => s + calcDemandPower(l), 0);
  const nonPriorityPower = nonPriority.reduce((s, l) => s + calcDemandPower(l), 0);

  // Steady-state: essential + priority loads (generator typically covers these)
  const steadyStatePower_kW = essentialPower + priorityPower;

  // Weighted power factor for generator-backed loads
  const genLoads = [...essential, ...priority];
  const totalGenDemand = steadyStatePower_kW || 1;
  const weightedPF = genLoads.reduce((sum, l) => {
    const d = calcDemandPower(l);
    const pf = (l.powerFactor > 0 && l.powerFactor <= 1) ? l.powerFactor : 0.85;
    return sum + pf * d;
  }, 0) / totalGenDemand;

  const pf = weightedPF > 0 && weightedPF <= 1 ? weightedPF : 0.8;
  const Q = calcReactivePower(steadyStatePower_kW, pf);
  const steadyStatePower_kVA = calcApparentPower(steadyStatePower_kW, Q);

  // Analyze motor starting
  const motorInfo = analyzeMotorStarting(genLoads);
  const largestMotorStart = motorInfo.length > 0
    ? Math.max(...motorInfo.map(m => m.startingPower_kVA))
    : 0;

  // Transient requirement: steady-state + largest motor starting
  const transientPower_kVA = steadyStatePower_kVA + largestMotorStart;

  // Apply engineering margin to the larger of steady-state or transient
  const basePower = Math.max(steadyStatePower_kVA, transientPower_kVA);
  const recommendedSize_kVA = Math.ceil(basePower * (1 + engineeringMargin));

  if (motorInfo.length > 0) {
    warnings.push('Motor starting analysis is based on typical multipliers. Verify with actual motor datasheets.');
  }

  if (essential.length === 0 && priority.length === 0) {
    warnings.push('No essential or priority loads defined. Generator sizing based on all loads.');
  }

  if (engineeringMargin < 0.1) {
    warnings.push('Engineering margin below 10%. Consider increasing for adequate reserve.');
  }

  const isComplete = loads.length > 0 && network.supplyVoltage > 0;

  const trace: CalculationTrace = {
    inputs: {
      'Essential loads': essential.length,
      'Priority loads': priority.length,
      'Non-priority loads': nonPriority.length,
      'Engineering margin': `${(engineeringMargin * 100).toFixed(0)}%`,
    },
    assumptions: [
      `Weighted power factor: ${pf.toFixed(3)}`,
      'Generator sized for essential + priority loads',
      motorInfo.length > 0 ? 'Motor starting multipliers are typical values' : 'No motor loads identified',
      `Engineering margin: ${(engineeringMargin * 100).toFixed(0)}%`,
    ],
    formulaRef: 'S = P / cosφ; S_transient = S_steady + S_motor_start; S_gen = max(S_steady, S_transient) × (1 + margin)',
    result: {
      'Steady-state Power (kW)': Math.round(steadyStatePower_kW * 100) / 100,
      'Steady-state Power (kVA)': Math.round(steadyStatePower_kVA * 100) / 100,
      'Transient Power (kVA)': Math.round(transientPower_kVA * 100) / 100,
      'Recommended Size (kVA)': recommendedSize_kVA,
    },
    validations: [
      {
        criterion: 'Loads defined',
        value: `${loads.length} loads`,
        status: loads.length > 0 ? 'pass' : 'missing_data',
      },
      {
        criterion: 'Priority classification',
        value: `${essential.length}E + ${priority.length}P + ${nonPriority.length}NP`,
        status: (essential.length + priority.length) > 0 ? 'pass' : 'warning',
        message: (essential.length + priority.length) === 0 ? 'No priority classification — using all loads' : undefined,
      },
      {
        criterion: 'Motor starting analysis',
        value: `${motorInfo.length} motors`,
        status: motorInfo.length > 0 ? 'pass' : 'warning',
        message: motorInfo.length === 0 ? 'No motors identified for starting analysis' : undefined,
      },
    ],
    warnings,
  };

  return {
    steadyStatePower_kW: Math.round(steadyStatePower_kW * 100) / 100,
    steadyStatePower_kVA: Math.round(steadyStatePower_kVA * 100) / 100,
    transientPower_kVA: Math.round(transientPower_kVA * 100) / 100,
    recommendedSize_kVA,
    engineeringMargin,
    essentialLoads_kW: Math.round(essentialPower * 100) / 100,
    priorityLoads_kW: Math.round(priorityPower * 100) / 100,
    nonPriorityLoads_kW: Math.round(nonPriorityPower * 100) / 100,
    motorStartingConsiderations: motorInfo,
    trace,
    isComplete,
  };
}
