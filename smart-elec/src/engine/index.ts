/**
 * SMART ELEC — Calculation Engine Index
 *
 * Central export for all deterministic calculation modules.
 * These modules are completely independent of the UI layer.
 */

export { calculatePowerBalance, toKW, calcInstalledPower, calcDemandPower, calcReactivePower, calcApparentPower, calcCurrent } from './powerBalance';
export { calculateGeneratorSizing, getStartingCurrentMultiplier } from './generatorSizing';
export { calculateCableSizing, getCurrentCapacity, getTemperatureCorrectionFactor, getGroupingCorrectionFactor, calculateVoltageDrop, calculateVoltageDropPercent, checkShortCircuitWithstand, STANDARD_SECTIONS } from './cableSizing';
export { calculateProtection, selectNominalCurrent, recommendTripCurve, recommendRCDSensitivity, STANDARD_MCB_RATINGS, STANDARD_MCCB_RATINGS, STANDARD_FUSE_RATINGS, STANDARD_RCD_SENSITIVITIES } from './protectionSelection';
