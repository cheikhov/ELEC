/**
 * SMART ELEC — Engineering Validation System
 *
 * Implements deterministic validation rules.
 * Never silently corrects inputs. Explicitly surfaces missing or invalid fields.
 */

import type { ElectricalLoad, ElectricalNetwork, CableSizingInput } from '../types';

export interface ValidationError {
  field: string;
  code: 'missing' | 'invalid' | 'incomplete' | 'out_of_range';
  messageFr: string;
  messageAr: string;
}

export function validateProjectInfo(name: string, client: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!name || !name.trim()) {
    errors.push({
      field: 'name',
      code: 'missing',
      messageFr: 'Nom du projet requis (Information requise manquante)',
      messageAr: 'اسم المشروع مطلوب (معلومات مطلوبة مفقودة)',
    });
  }
  if (!client || !client.trim()) {
    errors.push({
      field: 'client',
      code: 'missing',
      messageFr: 'Nom du client ou maître d\'ouvrage requis',
      messageAr: 'اسم العميل أو صاحب المشروع مطلوب',
    });
  }
  return errors;
}

export function validateNetwork(network: Partial<ElectricalNetwork>): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!network.supplyVoltage || network.supplyVoltage <= 0) {
    errors.push({
      field: 'supplyVoltage',
      code: 'missing',
      messageFr: 'Tension d\'alimentation requise (> 0 V)',
      messageAr: 'جهد التغذية مطلوب (> 0 فولت)',
    });
  } else if (network.supplyVoltage < 100 || network.supplyVoltage > 1000) {
    errors.push({
      field: 'supplyVoltage',
      code: 'out_of_range',
      messageFr: 'Tension basse tension hors plage standard (100V - 1000V)',
      messageAr: 'جهد منخفض خارج النطاق القياسي (100V - 1000V)',
    });
  }

  if (!network.frequency || (network.frequency !== 50 && network.frequency !== 60)) {
    errors.push({
      field: 'frequency',
      code: 'invalid',
      messageFr: 'Fréquence invalide : doit être 50 Hz ou 60 Hz (Algérie : 50 Hz)',
      messageAr: 'تردد غير صالح: يجب أن يكون 50 هرتز أو 60 هرتز (الجزائر: 50 هرتز)',
    });
  }

  if (!network.phaseType) {
    errors.push({
      field: 'phaseType',
      code: 'missing',
      messageFr: 'Type de distribution requis (Monophasé / Triphasé)',
      messageAr: 'نوع التوزيع مطلوب (أحادي الطور / ثلاثي الطور)',
    });
  }

  return errors;
}

export function validateLoad(load: Partial<ElectricalLoad>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!load.name || !load.name.trim()) {
    errors.push({
      field: 'name',
      code: 'missing',
      messageFr: 'Désignation de la charge requise',
      messageAr: 'تسمية الحمل مطلوبة',
    });
  }

  if (load.quantity === undefined || load.quantity === null || load.quantity <= 0 || !Number.isInteger(load.quantity)) {
    errors.push({
      field: 'quantity',
      code: 'invalid',
      messageFr: 'Quantité invalide (doit être un entier positif ≥ 1)',
      messageAr: 'كمية غير صالحة (يجب أن تكون عددًا صحيحًا موجبًا ≥ 1)',
    });
  }

  if (load.unitPower === undefined || load.unitPower === null || load.unitPower <= 0) {
    errors.push({
      field: 'unitPower',
      code: 'invalid',
      messageFr: 'Puissance unitaire invalide (doit être > 0)',
      messageAr: 'قدرة الوحدة غير صالحة (يجب أن تكون > 0)',
    });
  }

  if (load.powerFactor === undefined || load.powerFactor === null || load.powerFactor <= 0 || load.powerFactor > 1) {
    errors.push({
      field: 'powerFactor',
      code: 'out_of_range',
      messageFr: 'Facteur de puissance cos φ invalide (doit être compris entre 0.01 et 1.00)',
      messageAr: 'معامل القدرة cos φ غير صالح (يجب أن يكون بين 0.01 و 1.00)',
    });
  }

  if (load.efficiency !== undefined && (load.efficiency <= 0 || load.efficiency > 1)) {
    errors.push({
      field: 'efficiency',
      code: 'out_of_range',
      messageFr: 'Rendement η invalide (doit être compris entre 0.01 et 1.00)',
      messageAr: 'المردود η غير صالح (يجب أن يكون بين 0.01 و 1.00)',
    });
  }

  if (load.utilizationFactor === undefined || load.utilizationFactor <= 0 || load.utilizationFactor > 1) {
    errors.push({
      field: 'utilizationFactor',
      code: 'out_of_range',
      messageFr: 'Facteur d\'utilisation Ku invalide (doit être entre 0.01 et 1.00)',
      messageAr: 'معامل الاستخدام Ku غير صالح (يجب أن يكون بين 0.01 و 1.00)',
    });
  }

  if (load.simultaneityFactor === undefined || load.simultaneityFactor <= 0 || load.simultaneityFactor > 1) {
    errors.push({
      field: 'simultaneityFactor',
      code: 'out_of_range',
      messageFr: 'Facteur de simultanéité Ks invalide (doit être entre 0.01 et 1.00)',
      messageAr: 'معامل التزامن Ks غير صالح (يجب أن يكون بين 0.01 و 1.00)',
    });
  }

  return errors;
}

export function validateCableInput(input: Partial<CableSizingInput>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.loadCurrent_A || input.loadCurrent_A <= 0) {
    errors.push({
      field: 'loadCurrent_A',
      code: 'missing',
      messageFr: 'Courant d\'emploi Ib requis (> 0 A)',
      messageAr: 'تيار التشغيل Ib مطلوب (> 0 أمبير)',
    });
  }

  if (!input.cableLength_m || input.cableLength_m <= 0) {
    errors.push({
      field: 'cableLength_m',
      code: 'missing',
      messageFr: 'Longueur de liaison requise (> 0 m)',
      messageAr: 'طول الكابل مطلوب (> 0 متر)',
    });
  }

  if (!input.installationMethod) {
    errors.push({
      field: 'installationMethod',
      code: 'missing',
      messageFr: 'Mode de pose requis selon IEC 60364-5-52',
      messageAr: 'طريقة التثبيت مطلوبة وفق IEC 60364-5-52',
    });
  }

  if (input.ambientTemperature_C === undefined || input.ambientTemperature_C === null || input.ambientTemperature_C < -20 || input.ambientTemperature_C > 70) {
    errors.push({
      field: 'ambientTemperature_C',
      code: 'out_of_range',
      messageFr: 'Température ambiante invalide (-20°C à +70°C)',
      messageAr: 'درجة الحرارة المحيطة غير صالحة (-20 إلى +70 مئوية)',
    });
  }

  return errors;
}

