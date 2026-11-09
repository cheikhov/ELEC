/**
 * SMART ELEC — Realistic Demo Project Data
 *
 * "Small Commercial Building" / "Petit Bâtiment Commercial" (Oran / Alger, Algérie)
 * Real-world electrical parameters and typical load profile.
 *
 * NOTE: Marked explicitly as DEMO PROJECT.
 */

import type { Project, ElectricalLoad } from '../types';
import { calculatePowerBalance } from '../engine/powerBalance';
import { calculateGeneratorSizing } from '../engine/generatorSizing';
import { calculateCableSizing } from '../engine/cableSizing';
import { calculateProtection } from '../engine/protectionSelection';

export function createDemoProject(): Project {
  const loads: ElectricalLoad[] = [
    // 1. Éclairage (Lighting)
    {
      id: 'demo-load-1',
      name: 'Éclairage Bureaux & Circulations (Dalles LED 600x600)',
      category: 'lighting',
      quantity: 48,
      unitPower: 40,
      powerUnit: 'W',
      loadType: 'single_phase',
      powerFactor: 0.95,
      efficiency: 0.95,
      startingMethod: 'not_applicable',
      utilizationFactor: 0.9,
      simultaneityFactor: 0.8,
      priority: 'priority',
      notes: 'Bureaux open-space étages 1 et 2',
    },
    {
      id: 'demo-load-2',
      name: 'Éclairage Sécurité & Balisage (BAES / Blocs autonomes)',
      category: 'lighting',
      quantity: 16,
      unitPower: 15,
      powerUnit: 'W',
      loadType: 'single_phase',
      powerFactor: 0.9,
      efficiency: 0.9,
      startingMethod: 'not_applicable',
      utilizationFactor: 1.0,
      simultaneityFactor: 1.0,
      priority: 'essential',
      notes: 'Issues de secours et couloirs d\'évacuation',
    },
    // 2. Prises de courant (Sockets)
    {
      id: 'demo-load-3',
      name: 'Prises de courant standard 16A 2P+T (Postes de travail)',
      category: 'sockets',
      quantity: 60,
      unitPower: 200,
      powerUnit: 'W',
      loadType: 'single_phase',
      powerFactor: 0.85,
      efficiency: 1.0,
      startingMethod: 'not_applicable',
      utilizationFactor: 0.6,
      simultaneityFactor: 0.5,
      priority: 'non_priority',
      notes: 'Bureaux et salles de réunion',
    },
    {
      id: 'demo-load-4',
      name: 'Prises dédiées Réfectoire & Cafétéria',
      category: 'sockets',
      quantity: 6,
      unitPower: 1500,
      powerUnit: 'W',
      loadType: 'single_phase',
      powerFactor: 0.95,
      efficiency: 1.0,
      startingMethod: 'not_applicable',
      utilizationFactor: 0.7,
      simultaneityFactor: 0.6,
      priority: 'non_priority',
      notes: 'Cafetière, micro-ondes, distributeurs',
    },
    // 3. Climatisation / HVAC
    {
      id: 'demo-load-5',
      name: 'Groupe Climatisation VRV / Pompe à chaleur Toiture',
      category: 'air_conditioning',
      quantity: 1,
      unitPower: 18.5,
      powerUnit: 'kW',
      loadType: 'three_phase',
      powerFactor: 0.88,
      efficiency: 0.91,
      startingMethod: 'vfd',
      utilizationFactor: 0.85,
      simultaneityFactor: 1.0,
      priority: 'priority',
      notes: 'Inverter modulation de puissance',
    },
    {
      id: 'demo-load-6',
      name: 'Split Units Salle Serveur / Baie informatique',
      category: 'air_conditioning',
      quantity: 2,
      unitPower: 3.5,
      powerUnit: 'kW',
      loadType: 'single_phase',
      powerFactor: 0.85,
      efficiency: 0.88,
      startingMethod: 'direct',
      utilizationFactor: 1.0,
      simultaneityFactor: 0.5,
      priority: 'essential',
      notes: 'Fonctionnement 24h/24 en alternance N+1',
    },
    // 4. Pompes (Pumps)
    {
      id: 'demo-load-7',
      name: 'Groupe Surpresseur Eau Potable & Sanitaire',
      category: 'pumps',
      quantity: 2,
      unitPower: 3.0,
      powerUnit: 'kW',
      loadType: 'three_phase',
      powerFactor: 0.82,
      efficiency: 0.85,
      startingMethod: 'direct',
      utilizationFactor: 0.7,
      simultaneityFactor: 0.6,
      priority: 'essential',
      notes: '1 en service + 1 secours',
    },
    // 5. Moteurs / Ascenseur (Elevators)
    {
      id: 'demo-load-8',
      name: 'Ascenseur Passagers 8 Personnes (630 kg)',
      category: 'elevators',
      quantity: 1,
      unitPower: 7.5,
      powerUnit: 'kW',
      loadType: 'three_phase',
      powerFactor: 0.82,
      efficiency: 0.86,
      startingMethod: 'vfd',
      utilizationFactor: 0.6,
      simultaneityFactor: 1.0,
      priority: 'essential',
      notes: 'Variateur régénératif avec retour au niveau 0 en cas de coupure',
    },
    // 6. Informatique (IT Equipment)
    {
      id: 'demo-load-9',
      name: 'Baie Serveurs & Switchs Réseau (Alimentation Ondulée)',
      category: 'it_equipment',
      quantity: 1,
      unitPower: 4.5,
      powerUnit: 'kW',
      loadType: 'single_phase',
      powerFactor: 0.92,
      efficiency: 0.93,
      startingMethod: 'not_applicable',
      utilizationFactor: 0.9,
      simultaneityFactor: 1.0,
      priority: 'essential',
      notes: 'Sous onduleur double conversion On-Line',
    },
  ];

  const network = {
    supplyVoltage: 400,
    phaseType: 'three_phase' as const,
    frequency: 50,
    neutralSystem: 'TN-S' as const,
    notes: 'Poste transformateur MT/BT SONELGAZ 160 kVA, distribution 400V triphasé + N',
  };

  const pb = calculatePowerBalance(loads, network);
  const gen = calculateGeneratorSizing(loads, network, 0.15);

  const mainCable = calculateCableSizing({
    loadCurrent_A: pb.estimatedCurrent_A,
    cableLength_m: 45,
    conductorMaterial: 'copper',
    insulationType: 'XLPE',
    installationMethod: 'B1',
    ambientTemperature_C: 40,
    cableGrouping: 2,
    numberOfLoadedConductors: 3,
    permittedVoltageDrop_percent: 3.0,
    shortCircuitCurrent_kA: 15,
    shortCircuitDuration_s: 0.1,
    networkVoltage_V: 400,
    phaseType: 'three_phase',
  });

  const protections = calculateProtection({
    designCurrent_A: pb.estimatedCurrent_A,
    cableCapacity_A: mainCable.derated_currentCapacity_A,
    shortCircuitCurrent_kA: 15,
    phaseType: 'three_phase',
    loadType: 'other',
    isMotor: false,
  });

  return {
    id: 'demo-project-commercial',
    name: 'Immeuble de Bureaux & Services El-Biar',
    client: 'Société Immobilière Maghrebine (SIM)',
    address: 'Boulevard Colonel Bougara, El-Biar, Alger',
    projectType: 'commercial',
    description: 'Étude électrique préliminaire pour un bâtiment R+3 comprenant des espaces de bureaux, accueil, salle informatique et locaux techniques.',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true,
    network,
    assumptions: [
      {
        id: 'asm-1',
        description: 'Température ambiante de dimensionnement fixée à 40°C conformément aux conditions estivales locales d\'Alger.',
        source: 'user',
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: 'asm-2',
        description: 'Chute de tension maximale admissible fixée à 3% entre TGBT et départs divisionnaires (limite stricte NFC 15-100 / IEC 60364).',
        source: 'user',
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: 'asm-3',
        description: 'Le groupe électrogène est configuré pour secourir 100% des charges essentielles et prioritaires avec une marge de 15%.',
        source: 'user',
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
    ],
    loads,
    calculations: {
      powerBalance: pb,
      generatorSizing: gen,
      cableSizing: [mainCable],
      protectionRecommendations: protections,
      lastCalculated: new Date().toISOString(),
    },
  };
}

