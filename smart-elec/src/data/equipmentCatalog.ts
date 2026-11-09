/**
 * SMART ELEC — Equipment Catalogue Database
 *
 * Real references and technical specs from standard electrical manufacturers
 * (Schneider Electric, Legrand, ABB, SDMO / Kohler).
 *
 * NOTE: Prices are strictly indicative and explicitly marked DEMO DATA.
 */

import type { Equipment } from '../types';

export const EQUIPMENT_CATALOG: Equipment[] = [
  // ── 1. Circuit Breakers (Disjoncteurs) ──
  {
    id: 'eq-cb-1',
    category: 'circuit_breakers',
    manufacturer: 'Schneider Electric',
    reference: 'Acti9 iC60N 3P+N C 16A (A9F74416)',
    technicalCharacteristics: {
      poles: '3P+N',
      nominalCurrent: '16 A',
      curve: 'C',
      breakingCapacityIcu: '10 kA (IEC 60947-2) / 6000 A (IEC 60898-1)',
      voltage: '400V AC',
      standards: 'IEC 60947-2, IEC 60898-1',
    },
    datasheetUrl: 'https://www.se.com',
    price: 4500,
    currency: 'DZD',
    source: 'Catalogue Distribution BT Algérie (DEMO DATA)',
    dateUpdated: '2026-01-15',
    isDemo: true,
  },
  {
    id: 'eq-cb-2',
    category: 'circuit_breakers',
    manufacturer: 'Schneider Electric',
    reference: 'Acti9 iC60N 3P+N C 32A (A9F74432)',
    technicalCharacteristics: {
      poles: '3P+N',
      nominalCurrent: '32 A',
      curve: 'C',
      breakingCapacityIcu: '10 kA (IEC 60947-2)',
      voltage: '400V AC',
      standards: 'IEC 60947-2',
    },
    price: 5800,
    currency: 'DZD',
    source: 'Tarif indicatif installateur (DEMO DATA)',
    dateUpdated: '2026-01-15',
    isDemo: true,
  },
  {
    id: 'eq-cb-3',
    category: 'circuit_breakers',
    manufacturer: 'Schneider Electric',
    reference: 'Compact NSX100F Micrologic 2.2 100A (LV429630)',
    technicalCharacteristics: {
      poles: '4P 4d',
      nominalCurrent: '100 A (réglable 40-100A)',
      breakingCapacityIcu: '36 kA sous 415V',
      tripUnit: 'Électronique Micrologic 2.2',
      standards: 'IEC 60947-2',
    },
    price: 42000,
    currency: 'DZD',
    source: 'Fournisseur Matériel Électrique Alger (DEMO DATA)',
    dateUpdated: '2026-01-20',
    isDemo: true,
  },
  {
    id: 'eq-cb-4',
    category: 'circuit_breakers',
    manufacturer: 'Legrand',
    reference: 'DX³ 6000 Uni+Neutre C16 10mA (407784)',
    technicalCharacteristics: {
      poles: '1P+N',
      nominalCurrent: '16 A',
      curve: 'C',
      rcdSensitivity: '30 mA Type AC',
      breakingCapacity: '6000 A',
    },
    price: 6200,
    currency: 'DZD',
    source: 'Tarif distributeur agréé (DEMO DATA)',
    dateUpdated: '2026-01-10',
    isDemo: true,
  },

  // ── 2. Cables (Câbles) ──
  {
    id: 'eq-cab-1',
    category: 'cables',
    manufacturer: 'ENICAB (Algérie)',
    reference: 'U-1000 R2V (RVFV) Cuivre 4x16 mm²',
    technicalCharacteristics: {
      conductors: '4G16 mm²',
      conductorMaterial: 'Cuivre classe 2',
      insulation: 'XLPE (PR)',
      sheath: 'PVC noir sans plomb',
      nominalVoltage: '0.6/1 kV',
      standards: 'NF C 32-321 / IEC 60502-1',
    },
    price: 1850,
    currency: 'DZD / m',
    source: 'Tarif usine ENICAB Biskra (DEMO DATA)',
    dateUpdated: '2026-02-01',
    isDemo: true,
  },
  {
    id: 'eq-cab-2',
    category: 'cables',
    manufacturer: 'ENICAB (Algérie)',
    reference: 'U-1000 R2V Cuivre 4x25 mm²',
    technicalCharacteristics: {
      conductors: '4G25 mm²',
      conductorMaterial: 'Cuivre classe 2',
      insulation: 'XLPE',
      nominalVoltage: '0.6/1 kV',
      standards: 'IEC 60502-1',
    },
    price: 2900,
    currency: 'DZD / m',
    source: 'Tarif usine ENICAB (DEMO DATA)',
    dateUpdated: '2026-02-01',
    isDemo: true,
  },
  {
    id: 'eq-cab-3',
    category: 'cables',
    manufacturer: 'CABEL (Algérie)',
    reference: 'H07V-U / H07V-R Filaire Cuivre 2.5 mm²',
    technicalCharacteristics: {
      conductors: '1x2.5 mm²',
      conductorMaterial: 'Cuivre rigide',
      insulation: 'PVC',
      nominalVoltage: '450/750 V',
      standards: 'NF C 32-201',
    },
    price: 48,
    currency: 'DZD / m',
    source: 'Grossiste Oued Smar (DEMO DATA)',
    dateUpdated: '2026-01-25',
    isDemo: true,
  },

  // ── 3. Generators (Groupes électrogènes) ──
  {
    id: 'eq-gen-1',
    category: 'generators',
    manufacturer: 'Kohler-SDMO',
    reference: 'J44K (Moteur John Deere)',
    technicalCharacteristics: {
      powerPRP: '40 kVA / 32 kW',
      powerESP: '44 kVA / 35.2 kW',
      voltage: '400/230 V 50 Hz',
      engine: 'John Deere 3029DF128',
      cooling: 'Radiateur eau',
      governor: 'Mécanique',
    },
    price: 2850000,
    currency: 'DZD',
    source: 'Importateur officiel Kohler Algérie (DEMO DATA)',
    dateUpdated: '2026-01-18',
    isDemo: true,
  },
  {
    id: 'eq-gen-2',
    category: 'generators',
    manufacturer: 'Kohler-SDMO',
    reference: 'J66K (Moteur John Deere)',
    technicalCharacteristics: {
      powerPRP: '60 kVA / 48 kW',
      powerESP: '66 kVA / 52.8 kW',
      voltage: '400/230 V 50 Hz',
      engine: 'John Deere 4045TF120',
      cooling: 'Radiateur eau',
    },
    price: 3600000,
    currency: 'DZD',
    source: 'Distributeur machinerie industrielle Alger (DEMO DATA)',
    dateUpdated: '2026-01-18',
    isDemo: true,
  },

  // ── 4. Electrical Panels (Tableaux électriques) ──
  {
    id: 'eq-pan-1',
    category: 'panels',
    manufacturer: 'Schneider Electric',
    reference: 'PrismaSeT G Armoire murale IP30 8 modules (LVSG400)',
    technicalCharacteristics: {
      type: 'Armoire de distribution tertiaire',
      inMax: 'Jusqu\'à 630 A',
      ipRating: 'IP30 / IK08',
      standards: 'IEC 61439-1 & 2',
    },
    price: 185000,
    currency: 'DZD',
    source: 'Tableautier certifié Schneider Alger (DEMO DATA)',
    dateUpdated: '2026-01-12',
    isDemo: true,
  },

  // ── 5. UPS / Onduleurs ──
  {
    id: 'eq-ups-1',
    category: 'ups',
    manufacturer: 'APC by Schneider',
    reference: 'Smart-UPS On-Line 6kVA 230V/400V (SRT6KXLI)',
    technicalCharacteristics: {
      apparentPower: '6000 VA / 6000 W',
      technology: 'Double conversion On-Line',
      autonomy: '8 min à pleine charge',
      bypass: 'Bypass interne automatique et manuel',
    },
    price: 890000,
    currency: 'DZD',
    source: 'Revendeur informatique agréé Alger (DEMO DATA)',
    dateUpdated: '2026-01-22',
    isDemo: true,
  },

  // ── 6. Transformers (Transformateurs MT/BT) ──
  {
    id: 'eq-trans-1',
    category: 'transformers',
    manufacturer: 'Electro-Industries (Azazga, Algérie)',
    reference: 'Transformateur triphasé immergé huile 160 kVA 10-30kV/400V',
    technicalCharacteristics: {
      power: '160 kVA',
      primaryVoltage: '10 kV ou 30 kV',
      secondaryVoltage: '400 V / 231 V',
      losses: 'Éco-conception Pertes Réduites Tier 2',
      standards: 'IEC 60076, Spécifications SONELGAZ',
    },
    price: 1750000,
    currency: 'DZD',
    source: 'Tarif usine Electro-Industries Azazga (DEMO DATA)',
    dateUpdated: '2026-01-05',
    isDemo: true,
  },
];

