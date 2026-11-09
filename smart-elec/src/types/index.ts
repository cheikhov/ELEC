// SMART ELEC — Core Type Definitions
// All types for the electrical engineering application

// ─── Project Types ───────────────────────────────────────────────────────────

export type ProjectType = 'residential' | 'commercial' | 'tertiary' | 'industrial' | 'agricultural' | 'hospital';

export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export type PhaseType = 'single_phase' | 'three_phase';

export type NeutralSystem = 'TT' | 'TN-S' | 'TN-C' | 'TN-C-S' | 'IT';

export interface Project {
  id: string;
  name: string;
  client: string;
  address: string;
  projectType: ProjectType;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
  network: ElectricalNetwork;
  assumptions: Assumption[];
  loads: ElectricalLoad[];
  calculations: CalculationResults;
}

export interface ElectricalNetwork {
  supplyVoltage: number; // Volts
  phaseType: PhaseType;
  frequency: number; // Hz (50 or 60)
  neutralSystem?: NeutralSystem;
  notes: string;
}

export interface Assumption {
  id: string;
  description: string;
  source: 'user' | 'default';
  createdAt: string;
}

// ─── Load Types ──────────────────────────────────────────────────────────────

export type LoadCategory =
  | 'lighting'
  | 'sockets'
  | 'heating'
  | 'air_conditioning'
  | 'pumps'
  | 'motors'
  | 'elevators'
  | 'it_equipment'
  | 'medical_equipment'
  | 'other';

export type LoadPriority = 'essential' | 'priority' | 'non_priority';

export type PowerUnit = 'W' | 'kW' | 'VA' | 'kVA' | 'HP';

export type StartingMethod = 'direct' | 'star_delta' | 'soft_starter' | 'vfd' | 'autotransformer' | 'not_applicable';

export interface ElectricalLoad {
  id: string;
  name: string;
  category: LoadCategory;
  quantity: number;
  unitPower: number;
  powerUnit: PowerUnit;
  loadType: PhaseType;
  powerFactor: number; // cos φ (0 to 1)
  efficiency: number; // η (0 to 1)
  startingMethod: StartingMethod;
  utilizationFactor: number; // Ku (0 to 1)
  simultaneityFactor: number; // Ks (0 to 1)
  priority: LoadPriority;
  notes: string;
}

// ─── Calculation Result Types ────────────────────────────────────────────────

export type ValidationStatus = 'pass' | 'fail' | 'warning' | 'incomplete' | 'missing_data';

export interface ValidationItem {
  criterion: string;
  value: string;
  status: ValidationStatus;
  message?: string;
}

export interface CalculationTrace {
  inputs: Record<string, string | number>;
  assumptions: string[];
  formulaRef: string;
  result: Record<string, string | number>;
  validations: ValidationItem[];
  warnings: string[];
}

export interface PowerBalanceResult {
  installedPower_kW: number;
  demandPower_kW: number;
  activePower_kW: number;
  reactivePower_kVAr: number;
  apparentPower_kVA: number;
  estimatedCurrent_A: number;
  powerFactor: number;
  byCategory: CategoryPowerSummary[];
  byPriority: PriorityPowerSummary[];
  trace: CalculationTrace;
}

export interface CategoryPowerSummary {
  category: LoadCategory;
  installedPower_kW: number;
  demandPower_kW: number;
  loadCount: number;
}

export interface PriorityPowerSummary {
  priority: LoadPriority;
  installedPower_kW: number;
  demandPower_kW: number;
  apparentPower_kVA: number;
  loadCount: number;
}

export interface GeneratorSizingResult {
  steadyStatePower_kW: number;
  steadyStatePower_kVA: number;
  transientPower_kVA: number;
  recommendedSize_kVA: number;
  engineeringMargin: number; // fraction
  essentialLoads_kW: number;
  priorityLoads_kW: number;
  nonPriorityLoads_kW: number;
  motorStartingConsiderations: MotorStartingInfo[];
  trace: CalculationTrace;
  isComplete: boolean;
}

export interface MotorStartingInfo {
  loadName: string;
  ratedPower_kW: number;
  startingMethod: StartingMethod;
  startingCurrentMultiplier: number;
  startingPower_kVA: number;
}

// ─── Cable Sizing Types ──────────────────────────────────────────────────────

export type ConductorMaterial = 'copper' | 'aluminium';

export type InsulationType = 'PVC' | 'XLPE' | 'EPR';

export type InstallationMethod = 'A1' | 'A2' | 'B1' | 'B2' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface CableSizingInput {
  loadCurrent_A: number;
  cableLength_m: number;
  conductorMaterial: ConductorMaterial;
  insulationType: InsulationType;
  installationMethod: InstallationMethod;
  ambientTemperature_C: number;
  cableGrouping: number;
  numberOfLoadedConductors: number;
  permittedVoltageDrop_percent: number;
  shortCircuitCurrent_kA?: number;
  shortCircuitDuration_s?: number;
  networkVoltage_V: number;
  phaseType: PhaseType;
}

export interface CableSizingResult {
  proposedSection_mm2: number;
  currentCapacity_A: number;
  voltageDrop_percent: number;
  voltageDrop_V: number;
  shortCircuitWithstand: boolean | null; // null if not evaluated
  correctionFactors: CorrectionFactors;
  derated_currentCapacity_A: number;
  criteriaResults: ValidationItem[];
  trace: CalculationTrace;
  isComplete: boolean;
}

export interface CorrectionFactors {
  temperature: number;
  grouping: number;
  combined: number;
}

// ─── Protection Types ────────────────────────────────────────────────────────

export type ProtectionDeviceType = 'circuit_breaker' | 'fuse' | 'rcd' | 'thermal_relay';

export type TripCurve = 'B' | 'C' | 'D' | 'K';

export interface ProtectionInput {
  designCurrent_A: number;
  cableCapacity_A: number;
  shortCircuitCurrent_kA?: number;
  phaseType: PhaseType;
  loadType: LoadCategory;
  isMotor: boolean;
}

export interface ProtectionRecommendation {
  deviceType: ProtectionDeviceType;
  nominalCurrent_A: number;
  breakingCapacity_kA?: number;
  tripCurve?: TripCurve;
  rcdSensitivity_mA?: number;
  notes: string[];
  isComplete: boolean;
  trace: CalculationTrace;
}

// ─── Combined Calculation Results ────────────────────────────────────────────

export interface CalculationResults {
  powerBalance?: PowerBalanceResult;
  generatorSizing?: GeneratorSizingResult;
  cableSizing: CableSizingResult[];
  protectionRecommendations: ProtectionRecommendation[];
  lastCalculated?: string;
}

// ─── Equipment Database Types ────────────────────────────────────────────────

export type EquipmentCategory = 'cables' | 'circuit_breakers' | 'fuses' | 'contactors' | 'relays' | 'panels' | 'generators' | 'transformers' | 'ups' | 'accessories';

export interface Equipment {
  id: string;
  category: EquipmentCategory;
  manufacturer: string;
  reference: string;
  technicalCharacteristics: Record<string, string | number>;
  datasheetUrl?: string;
  price?: number;
  currency?: string;
  source?: string;
  dateUpdated: string;
  isDemo: boolean;
}

// ─── User / Auth Types ───────────────────────────────────────────────────────

export type UserRole = 'admin' | 'engineer' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization?: string;
  createdAt: string;
  lastLogin: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  language: 'fr' | 'ar' | 'en';
  theme: 'light' | 'dark' | 'system';
}

// ─── Report Types ────────────────────────────────────────────────────────────

export interface ReportMetadata {
  id: string;
  projectId: string;
  generatedAt: string;
  version: string;
  language: 'fr' | 'ar' | 'en';
}
