/**
 * SMART ELEC — Deterministic Calculation Engine Test Suite
 * Section 27: "Unit tests for calculations"
 *
 * Verifies standard electrical formulas against verified reference cases.
 */

import {
  toKW,
  calcInstalledPower,
  calcDemandPower,
  calcReactivePower,
  calcApparentPower,
  calcCurrent,
  calculatePowerBalance,
} from '../powerBalance';

import {
  getStartingCurrentMultiplier,
  calculateGeneratorSizing,
} from '../generatorSizing';

import {
  calculateCableSizing,
  getTemperatureCorrectionFactor,
  getGroupingCorrectionFactor,
  calculateVoltageDrop,
  calculateVoltageDropPercent,
  checkShortCircuitWithstand,
} from '../cableSizing';

import {
  selectNominalCurrent,
  recommendTripCurve,
  calculateProtection,
  STANDARD_MCB_RATINGS,
} from '../protectionSelection';

import type { ElectricalLoad, ElectricalNetwork, CableSizingInput } from '../../types';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✕ FAIL: ${testName}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

function assertCloseTo(val: number, expected: number, tolerance: number = 0.05, testName: string) {
  assert(Math.abs(val - expected) <= tolerance, `${testName} [Expected: ${expected}, Got: ${val}]`);
}

console.log('\n======================================================');
console.log('SMART ELEC — DETERMINISTIC CALCULATION ENGINE TESTS');
console.log('======================================================\n');

// ── 1. Power Balance Engine Tests ──
console.log('--- 1. Power Balance Engine (IEC 60364-1) ---');

assertCloseTo(toKW(1000, 'W'), 1.0, 0.001, 'Unit conversion: 1000 W = 1 kW');
assertCloseTo(toKW(10, 'HP'), 7.457, 0.01, 'Unit conversion: 10 HP = 7.457 kW');
assertCloseTo(toKW(10, 'kVA', 0.8), 8.0, 0.01, 'Unit conversion: 10 kVA @ 0.8 pf = 8 kW');

const testLoad1: ElectricalLoad = {
  id: 'test-1',
  name: 'Moteur Pompe 11 kW',
  category: 'pumps',
  quantity: 2,
  unitPower: 11,
  powerUnit: 'kW',
  loadType: 'three_phase',
  powerFactor: 0.85,
  efficiency: 0.9,
  startingMethod: 'direct',
  utilizationFactor: 0.8,
  simultaneityFactor: 0.7,
  priority: 'priority',
  notes: '',
};

const pInst = calcInstalledPower(testLoad1);
assertCloseTo(pInst, 22.0, 0.01, 'Installed power: 2 × 11 kW = 22 kW');

const pDemand = calcDemandPower(testLoad1);
// (22 / 0.9) * 0.8 * 0.7 = 24.444 * 0.56 = 13.689 kW
assertCloseTo(pDemand, 13.69, 0.05, 'Demand power with efficiency and factors (Ku × Ks / η)');

const Q = calcReactivePower(100, 0.8);
// tan(acos(0.8)) = 0.75 -> Q = 75 kVAr
assertCloseTo(Q, 75.0, 0.01, 'Reactive power: Q = 100 kW @ 0.8 pf = 75 kVAr');

const S = calcApparentPower(100, 75);
// sqrt(100^2 + 75^2) = 125 kVA
assertCloseTo(S, 125.0, 0.01, 'Apparent power: S = √(100² + 75²) = 125 kVA');

const I_3ph = calcCurrent(125, 400, 'three_phase');
// 125000 / (sqrt(3) * 400) = 180.42 A
assertCloseTo(I_3ph, 180.42, 0.1, 'Three-phase current: I = 125 kVA / (√3 × 400 V) = 180.4 A');

const I_1ph = calcCurrent(10, 230, 'single_phase');
// 10000 / 230 = 43.48 A
assertCloseTo(I_1ph, 43.48, 0.1, 'Single-phase current: I = 10 kVA / 230 V = 43.5 A');

// ── 2. Generator Sizing Tests ──
console.log('\n--- 2. Generator Sizing Engine (IEC 60034) ---');

assert(getStartingCurrentMultiplier('direct') === 7.0, 'Starting multiplier for DOL is 7×');
assert(getStartingCurrentMultiplier('star_delta') === 2.5, 'Starting multiplier for Star-Delta is 2.5×');
assert(getStartingCurrentMultiplier('vfd') === 1.2, 'Starting multiplier for VFD is 1.2×');

const testNetwork: ElectricalNetwork = {
  supplyVoltage: 400,
  phaseType: 'three_phase',
  frequency: 50,
  neutralSystem: 'TN-S',
  notes: '',
};

const genResult = calculateGeneratorSizing([testLoad1], testNetwork, 0.15);
assert(genResult.recommendedSize_kVA > 0, 'Generator sizing returns non-zero size');
assert(genResult.isComplete, 'Generator sizing reports complete');
assert(genResult.engineeringMargin === 0.15, 'Generator sizing applies 15% margin');

// ── 3. Cable Sizing Tests ──
console.log('\n--- 3. Cable Sizing Engine (IEC 60364-5-52) ---');

// Temperature correction: 40°C in PVC (Tmax 70°C, Tref 30°C) -> sqrt((70-40)/(70-30)) = sqrt(30/40) = 0.866
const kTemp = getTemperatureCorrectionFactor(40, 'PVC');
assertCloseTo(kTemp, 0.87, 0.02, 'Temperature correction factor: PVC @ 40°C = 0.87');

// Grouping correction: 3 circuits = 0.70
const kGroup = getGroupingCorrectionFactor(3);
assertCloseTo(kGroup, 0.70, 0.01, 'Grouping correction factor: 3 circuits = 0.70');

// Voltage drop: 50A, 50m, 16mm2 copper, 3-phase -> sqrt(3) * 0.0225 * 50 * 50 / 16 = 6.089 V
const vDrop = calculateVoltageDrop(50, 50, 16, 'copper', 'three_phase');
assertCloseTo(vDrop, 6.09, 0.05, 'Voltage drop: 50A, 50m, 16mm² Cu = 6.09 V');

const vDropPct = calculateVoltageDropPercent(vDrop, 400);
assertCloseTo(vDropPct, 1.52, 0.05, 'Voltage drop percentage: 6.09 V / 400 V = 1.52% (within 3% limit)');

// Short-circuit withstand: 15 kA, 0.1 s, copper/XLPE (k=143) -> 15000 * sqrt(0.1) / 143 = 33.16 mm2
const scCheck = checkShortCircuitWithstand(15, 0.1, 'copper', 'XLPE', 35);
assert(scCheck !== null && scCheck.passes === true, 'Short-circuit check: 35 mm² withstands 15 kA / 0.1s');

const cableInput: CableSizingInput = {
  loadCurrent_A: 45,
  cableLength_m: 40,
  conductorMaterial: 'copper',
  insulationType: 'XLPE',
  installationMethod: 'B1',
  ambientTemperature_C: 40,
  cableGrouping: 2,
  numberOfLoadedConductors: 3,
  permittedVoltageDrop_percent: 3.0,
  shortCircuitCurrent_kA: 10,
  shortCircuitDuration_s: 0.1,
  networkVoltage_V: 400,
  phaseType: 'three_phase',
};

const cableResult = calculateCableSizing(cableInput);
assert(cableResult.proposedSection_mm2 >= 10, 'Proposed section >= 10 mm²');
assert(cableResult.voltageDrop_percent <= 3.0, 'Proposed section satisfies voltage drop <= 3.0%');
assert(cableResult.criteriaResults.length >= 4, 'Multi-criteria evaluation table has all criteria');

// ── 4. Protection Selection Tests ──
console.log('\n--- 4. Protection Selection Engine (IEC 60364-4-43) ---');

const inRating = selectNominalCurrent(28, STANDARD_MCB_RATINGS);
assert(inRating === 32, 'Select nominal current: 28A load -> 32A MCB');

const motorCurve = recommendTripCurve(true, 'motors');
assert(motorCurve === 'D', 'Motor loads recommend Trip Curve D');

const lightingCurve = recommendTripCurve(false, 'lighting');
assert(lightingCurve === 'B', 'Lighting resistive loads recommend Trip Curve B');

const protResult = calculateProtection({
  designCurrent_A: 45,
  cableCapacity_A: 70,
  shortCircuitCurrent_kA: 15,
  phaseType: 'three_phase',
  loadType: 'other',
  isMotor: false,
});

assert(protResult.length >= 2, 'Returns circuit breaker and RCD recommendations');
assert(protResult[0].nominalCurrent_A >= 45, 'Breaker nominal current satisfies Ib <= In');
assert(protResult[0].nominalCurrent_A <= 70, 'Breaker nominal current satisfies In <= Iz');

console.log('\n======================================================');
console.log(`ALL TESTS PASSED: ${passedTests} / ${totalTests} (100%)`);
console.log('======================================================\n');
