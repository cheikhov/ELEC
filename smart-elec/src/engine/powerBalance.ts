/**
 * SMART ELEC — Power Balance Calculation Engine
 *
 * Deterministic calculation module for electrical power balance.
 * All formulas are documented, testable, and independent of UI.
 *
 * References:
 * - IEC 60364-1: Low-voltage electrical installations
 * - General electrical engineering principles
 *
 * IMPORTANT: This module performs preliminary calculations only.
 * All results must be reviewed by a qualified electrical professional.
 */

import type {
  ElectricalLoad,
  ElectricalNetwork,
  PowerBalanceResult,
  CategoryPowerSummary,
  PriorityPowerSummary,
  LoadCategory,
  LoadPriority,
  CalculationTrace,
} from '../types';

/**
 * Convert any power unit to kW.
 *
 * Conversions:
 *   W  → kW: P / 1000
 *   kW → kW: P (identity)
 *   VA → kW: P × pf / 1000  (approximation; requires power factor)
 *   kVA → kW: P × pf
 *   HP → kW: P × 0.7457
 */
export function toKW(value: number, unit: string, powerFactor: number = 1): number {
  switch (unit) {
    case 'W': return value / 1000;
    case 'kW': return value;
    case 'VA': return (value * powerFactor) / 1000;
    case 'kVA': return value * powerFactor;
    case 'HP': return value * 0.7457;
    default: return value;
  }
}

/**
 * Calculate installed power for a single load.
 *
 * Formula: P_installed = quantity × unitPower (converted to kW)
 */
export function calcInstalledPower(load: ElectricalLoad): number {
  const unitPower_kW = toKW(load.unitPower, load.powerUnit, load.powerFactor);
  return load.quantity * unitPower_kW;
}

/**
 * Calculate demand power for a single load.
 *
 * Formula: P_demand = P_installed × Ku × Ks
 *   where:
 *     Ku = utilization factor (0–1)
 *     Ks = simultaneity factor (0–1)
 *
 * If efficiency is provided and < 1:
 *   P_demand = (P_installed / η) × Ku × Ks
 *   where η = efficiency
 */
export function calcDemandPower(load: ElectricalLoad): number {
  const installed = calcInstalledPower(load);
  const efficiency = load.efficiency > 0 && load.efficiency <= 1 ? load.efficiency : 1;
  return (installed / efficiency) * load.utilizationFactor * load.simultaneityFactor;
}

/**
 * Calculate reactive power from active power and power factor.
 *
 * Formula: Q = P × tan(φ)
 *   where tan(φ) = √(1 - cos²φ) / cosφ
 *
 * Returns kVAr.
 */
export function calcReactivePower(activePower_kW: number, powerFactor: number): number {
  if (powerFactor <= 0 || powerFactor > 1) return 0;
  const tanPhi = Math.sqrt(1 - powerFactor * powerFactor) / powerFactor;
  return activePower_kW * tanPhi;
}

/**
 * Calculate apparent power from active and reactive power.
 *
 * Formula: S = √(P² + Q²)
 *
 * Returns kVA.
 */
export function calcApparentPower(activePower_kW: number, reactivePower_kVAr: number): number {
  return Math.sqrt(activePower_kW * activePower_kW + reactivePower_kVAr * reactivePower_kVAr);
}

/**
 * Calculate line current from apparent power and voltage.
 *
 * Three-phase: I = S / (√3 × V)
 * Single-phase: I = S / V
 *
 * where S is in VA and V is line voltage in Volts.
 * Returns Amperes.
 */
export function calcCurrent(apparentPower_kVA: number, voltage_V: number, phaseType: 'single_phase' | 'three_phase'): number {
  const S_VA = apparentPower_kVA * 1000;
  if (voltage_V <= 0) return 0;
  if (phaseType === 'three_phase') {
    return S_VA / (Math.sqrt(3) * voltage_V);
  }
  return S_VA / voltage_V;
}

/**
 * Aggregate power balance by load category.
 */
function aggregateByCategory(loads: ElectricalLoad[]): CategoryPowerSummary[] {
  const categories: LoadCategory[] = [
    'lighting', 'sockets', 'heating', 'air_conditioning', 'pumps',
    'motors', 'elevators', 'it_equipment', 'medical_equipment', 'other'
  ];

  return categories
    .map(category => {
      const categoryLoads = loads.filter(l => l.category === category);
      return {
        category,
        installedPower_kW: categoryLoads.reduce((sum, l) => sum + calcInstalledPower(l), 0),
        demandPower_kW: categoryLoads.reduce((sum, l) => sum + calcDemandPower(l), 0),
        loadCount: categoryLoads.length,
      };
    })
    .filter(c => c.loadCount > 0);
}

/**
 * Aggregate power balance by priority level.
 */
function aggregateByPriority(loads: ElectricalLoad[], network: ElectricalNetwork): PriorityPowerSummary[] {
  const priorities: LoadPriority[] = ['essential', 'priority', 'non_priority'];

  return priorities.map(priority => {
    const priorityLoads = loads.filter(l => l.priority === priority);
    const installed = priorityLoads.reduce((sum, l) => sum + calcInstalledPower(l), 0);
    const demand = priorityLoads.reduce((sum, l) => sum + calcDemandPower(l), 0);

    // Weighted average power factor for this priority group
    const totalDemand = demand || 1;
    const weightedPF = priorityLoads.reduce((sum, l) => {
      const lDemand = calcDemandPower(l);
      return sum + (l.powerFactor * lDemand);
    }, 0) / totalDemand;

    const pf = weightedPF > 0 && weightedPF <= 1 ? weightedPF : 0.85;
    const Q = calcReactivePower(demand, pf);
    const S = calcApparentPower(demand, Q);

    return {
      priority,
      installedPower_kW: installed,
      demandPower_kW: demand,
      apparentPower_kVA: S,
      loadCount: priorityLoads.length,
    };
  });
}

/**
 * Calculate the complete power balance for a project.
 *
 * This is the main entry point for power balance calculations.
 *
 * @param loads - Array of electrical loads
 * @param network - Electrical network parameters
 * @returns PowerBalanceResult with full traceability
 */
export function calculatePowerBalance(
  loads: ElectricalLoad[],
  network: ElectricalNetwork
): PowerBalanceResult {
  const warnings: string[] = [];

  if (loads.length === 0) {
    warnings.push('No loads entered. Add electrical loads to calculate power balance.');
  }

  // Validate loads
  loads.forEach(load => {
    if (load.powerFactor <= 0 || load.powerFactor > 1) {
      warnings.push(`${load.name}: Invalid power factor (${load.powerFactor}). Using 0.85 as default.`);
    }
    if (load.efficiency <= 0 || load.efficiency > 1) {
      warnings.push(`${load.name}: Invalid efficiency (${load.efficiency}). Using 1.0 as default.`);
    }
  });

  // Total installed power (sum of all loads)
  const installedPower_kW = loads.reduce((sum, l) => sum + calcInstalledPower(l), 0);

  // Total demand power (with utilization and simultaneity factors)
  const demandPower_kW = loads.reduce((sum, l) => sum + calcDemandPower(l), 0);

  // Weighted average power factor
  const totalDemand = demandPower_kW || 1;
  const weightedPF = loads.reduce((sum, l) => {
    const lDemand = calcDemandPower(l);
    const pf = (l.powerFactor > 0 && l.powerFactor <= 1) ? l.powerFactor : 0.85;
    return sum + (pf * lDemand);
  }, 0) / totalDemand;

  const powerFactor = weightedPF > 0 && weightedPF <= 1 ? weightedPF : 0.85;

  // Active power = demand power
  const activePower_kW = demandPower_kW;

  // Reactive power: Q = P × tan(φ)
  const reactivePower_kVAr = calcReactivePower(activePower_kW, powerFactor);

  // Apparent power: S = √(P² + Q²)
  const apparentPower_kVA = calcApparentPower(activePower_kW, reactivePower_kVAr);

  // Estimated current
  const estimatedCurrent_A = calcCurrent(
    apparentPower_kVA,
    network.supplyVoltage,
    network.phaseType
  );

  if (network.supplyVoltage <= 0) {
    warnings.push('Supply voltage not defined. Current calculation may be incorrect.');
  }

  const trace: CalculationTrace = {
    inputs: {
      'Number of loads': loads.length,
      'Supply voltage (V)': network.supplyVoltage,
      'Phase type': network.phaseType,
      'Frequency (Hz)': network.frequency,
    },
    assumptions: loads.length > 0
      ? [`Weighted average power factor: ${powerFactor.toFixed(3)}`]
      : ['No loads — no assumptions applied'],
    formulaRef: 'P_demand = Σ(P_installed / η × Ku × Ks); Q = P × tan(φ); S = √(P² + Q²); I = S / (√3 × V) [three-phase] or I = S / V [single-phase]',
    result: {
      'Installed Power (kW)': Math.round(installedPower_kW * 100) / 100,
      'Demand Power (kW)': Math.round(demandPower_kW * 100) / 100,
      'Active Power (kW)': Math.round(activePower_kW * 100) / 100,
      'Reactive Power (kVAr)': Math.round(reactivePower_kVAr * 100) / 100,
      'Apparent Power (kVA)': Math.round(apparentPower_kVA * 100) / 100,
      'Estimated Current (A)': Math.round(estimatedCurrent_A * 100) / 100,
      'Power Factor': Math.round(powerFactor * 1000) / 1000,
    },
    validations: [
      {
        criterion: 'Loads defined',
        value: `${loads.length} loads`,
        status: loads.length > 0 ? 'pass' : 'missing_data',
      },
      {
        criterion: 'Supply voltage',
        value: `${network.supplyVoltage} V`,
        status: network.supplyVoltage > 0 ? 'pass' : 'missing_data',
      },
      {
        criterion: 'Power factor range',
        value: powerFactor.toFixed(3),
        status: powerFactor >= 0.7 ? 'pass' : 'warning',
        message: powerFactor < 0.7 ? 'Low power factor — consider correction' : undefined,
      },
    ],
    warnings,
  };

  return {
    installedPower_kW: Math.round(installedPower_kW * 100) / 100,
    demandPower_kW: Math.round(demandPower_kW * 100) / 100,
    activePower_kW: Math.round(activePower_kW * 100) / 100,
    reactivePower_kVAr: Math.round(reactivePower_kVAr * 100) / 100,
    apparentPower_kVA: Math.round(apparentPower_kVA * 100) / 100,
    estimatedCurrent_A: Math.round(estimatedCurrent_A * 100) / 100,
    powerFactor: Math.round(powerFactor * 1000) / 1000,
    byCategory: aggregateByCategory(loads),
    byPriority: aggregateByPriority(loads, network),
    trace,
  };
}
