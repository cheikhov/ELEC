/**
 * SMART ELEC — Professional Technical PDF Report Generator
 *
 * Implements full 15-point engineering technical note per Section 13:
 * 1. SMART ELEC branding
 * 2. Project information
 * 3. Client information
 * 4. Electrical network characteristics
 * 5. Load inventory
 * 6. Power balance
 * 7. Generator sizing
 * 8. Cable sizing
 * 9. Protection recommendations
 * 10. Equipment list
 * 11. Assumptions
 * 12. Warnings
 * 13. References (IEC 60364, 60909, 61439, 60034)
 * 14. Calculation date
 * 15. Software / version information
 * + MANDATORY DISCLAIMER
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Project } from '../types';
import { formatPower, formatCurrent, formatVoltage, formatSection, formatDate } from '../utils/formatters';

export function generateTechnicalReportPDF(project: Project, language: 'fr' | 'ar' = 'fr'): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [26, 43, 76]; // #1a2b4c Deep Engineering Navy
  const secondaryColor: [number, number, number] = [217, 119, 6]; // #d97706 Technical Amber
  const grayColor: [number, number, number] = [100, 116, 139]; // Slate

  let currentY = 15;

  // ── Header & Branding ──
  doc.setFillColor(...primaryColor);
  doc.rect(14, currentY, 182, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SMART ELEC', 20, currentY + 10);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('LOGICIEL D\'INGÉNIERIE & ÉTUDES ÉLECTRIQUES PRÉLIMINAIRES', 20, currentY + 17);

  doc.setFontSize(9);
  doc.text(`Réf: SE-${project.id.substring(0, 8).toUpperCase()}`, 150, currentY + 10);
  doc.text(`Date: ${formatDate(new Date().toISOString())}`, 150, currentY + 17);

  currentY += 28;

  // ── Document Title ──
  doc.setTextColor(26, 43, 76);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('NOTE TECHNIQUE DE CALCUL ÉLECTRIQUE BASSE TENSION', 14, currentY);

  if (project.isDemo) {
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('*** DOCUMENT DE DÉMONSTRATION (DEMO DATA) ***', 14, currentY + 6);
    currentY += 6;
  }

  currentY += 6;

  // ── Section 1 & 2: Project & Client Info ──
  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: 30 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, fillColor: [248, 250, 252] },
      1: { cellWidth: 46 },
      2: { fontStyle: 'bold', cellWidth: 45, fillColor: [248, 250, 252] },
      3: { cellWidth: 46 },
    },
    body: [
      [
        'Projet / Ouvrage :', project.name,
        'Client / Maître d\'ouvrage :', project.client,
      ],
      [
        'Localisation :', project.address,
        'Typologie d\'ouvrage :', project.projectType.toUpperCase(),
      ],
      [
        'Statut de l\'étude :', project.status.toUpperCase(),
        'Date d\'actualisation :', formatDate(project.updatedAt),
      ],
    ],
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // ── Hospital Warning if applicable ──
  if (project.projectType === 'hospital') {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(239, 68, 68);
    doc.rect(14, currentY, 182, 16, 'FD');

    doc.setTextColor(185, 28, 28);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('AVERTISSEMENT SPÉCIAL — INSTALLATION MÉDICALE / HOSPITALIÈRE', 18, currentY + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Cette installation requiert une étude d\'ingénierie hospitalière spécialisée (CEI 60364-7-710).', 18, currentY + 10);
    doc.text('Le groupe électrogène préliminaire seul ne garantit pas la continuité requise pour les blocs opératoires et soins intensifs.', 18, currentY + 14);

    currentY += 20;
  }

  // ── Section 3: Caractéristiques Réseau ──
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Caractéristiques du Réseau d\'Alimentation', 14, currentY);
  currentY += 2;

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 7, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: 30 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, fillColor: [248, 250, 252] },
      1: { cellWidth: 46 },
      2: { fontStyle: 'bold', cellWidth: 45, fillColor: [248, 250, 252] },
      3: { cellWidth: 46 },
    },
    body: [
      [
        'Tension assignée (Un) :', formatVoltage(project.network.supplyVoltage),
        'Système de phases :', project.network.phaseType === 'three_phase' ? 'Triphasé 3P+N' : 'Monophasé 1P+N',
      ],
      [
        'Fréquence industrielle :', `${project.network.frequency} Hz`,
        'Régime de neutre (SLT) :', project.network.neutralSystem || 'Non spécifié (TT présumé)',
      ],
      [
        'Notes amont :', { content: project.network.notes || 'Aucune note spécifique', colSpan: 3 },
      ],
    ],
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // ── Section 4: Power Balance Results ──
  const pb = project.calculations.powerBalance;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Résultats du Bilan de Puissance (IEC 60364-1)', 14, currentY);
  currentY += 2;

  if (pb) {
    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: 30 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45, fillColor: [248, 250, 252] },
        1: { cellWidth: 46 },
        2: { fontStyle: 'bold', cellWidth: 45, fillColor: [248, 250, 252] },
        3: { cellWidth: 46 },
      },
      body: [
        [
          'Puissance installée (P_inst) :', formatPower(pb.installedPower_kW, 'kW'),
          'Puissance demandée (P_demand) :', formatPower(pb.demandPower_kW, 'kW'),
        ],
        [
          'Puissance active (P) :', formatPower(pb.activePower_kW, 'kW'),
          'Puissance réactive (Q) :', `${pb.reactivePower_kVAr} kVAr`,
        ],
        [
          'Puissance apparente (S) :', `${pb.apparentPower_kVA} kVA`,
          'Courant d\'emploi estimé (Ib) :', formatCurrent(pb.estimatedCurrent_A),
        ],
        [
          'Facteur de puissance (cos φ) :', pb.powerFactor.toString(),
          'Nombre total de charges :', project.loads.length.toString(),
        ],
      ],
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // ── Section 5: Generator Sizing ──
  const gen = project.calculations.generatorSizing;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Dimensionnement Préliminaire du Groupe Électrogène', 14, currentY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(217, 119, 6);
  doc.text(' [ PRELIMINARY ESTIMATE ]', 120, currentY);
  currentY += 2;

  if (gen) {
    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 7, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: 30 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45, fillColor: [248, 250, 252] },
        1: { cellWidth: 46 },
        2: { fontStyle: 'bold', cellWidth: 45, fillColor: [248, 250, 252] },
        3: { cellWidth: 46 },
      },
      body: [
        [
          'Puissance continue (kW) :', `${gen.steadyStatePower_kW} kW`,
          'Puissance continue (kVA) :', `${gen.steadyStatePower_kVA} kVA`,
        ],
        [
          'Puissance transitoire d\'appel :', `${gen.transientPower_kVA} kVA`,
          'Marge d\'ingénierie appliquée :', `${(gen.engineeringMargin * 100).toFixed(0)} %`,
        ],
        [
          'Taille recommandée (kVA) :', { content: `${gen.recommendedSize_kVA} kVA`, styles: { fontStyle: 'bold', textColor: [26, 43, 76] } },
          'Charges secourues (Ess.+Prio.) :', `${(gen.essentialLoads_kW + gen.priorityLoads_kW).toFixed(1)} kW`,
        ],
      ],
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // Check if we need a new page for Cable & Protection & Loads
  if (currentY > 210) {
    doc.addPage();
    currentY = 15;
  }

  // ── Section 6: Cable Sizing ──
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Dimensionnement de Câble (IEC 60364-5-52)', 14, currentY);
  currentY += 2;

  const cables = project.calculations.cableSizing;
  if (cables.length > 0) {
    const cable = cables[0];
    const inputs = cable.trace.inputs;

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 7, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: 30 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45, fillColor: [248, 250, 252] },
        1: { cellWidth: 46 },
        2: { fontStyle: 'bold', cellWidth: 45, fillColor: [248, 250, 252] },
        3: { cellWidth: 46 },
      },
      body: [
        [
          'Courant d\'emploi (Ib) :', `${inputs['Load current (A)']} A`,
          'Longueur liaison (L) :', `${inputs['Cable length (m)']} m`,
        ],
        [
          'Âme & Isolant :', `${inputs['Material']} / ${inputs['Insulation']}`,
          'Mode de pose & Temp. :', `Méthode ${inputs['Installation method']} / ${inputs['Ambient temperature (°C)']}°C`,
        ],
        [
          'Facteur de correction k :', cable.correctionFactors.combined.toString(),
          'Courant admissible Iz déclassé :', `${cable.derated_currentCapacity_A} A`,
        ],
        [
          'Chute de tension ΔU (%) :', `${cable.voltageDrop_percent} % (${cable.voltageDrop_V} V)`,
          'Section normalisée proposée :', { content: formatSection(cable.proposedSection_mm2), styles: { fontStyle: 'bold', textColor: [26, 43, 76] } },
        ],
      ],
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // Cable criteria pass/fail table
    autoTable(doc, {
      startY: currentY,
      theme: 'plain',
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fontStyle: 'bold', textColor: [71, 85, 105] },
      head: [['Critère technique', 'Valeur vérifiée', 'Statut']],
      body: cable.criteriaResults.map(c => [
        c.criterion,
        c.value,
        c.status.toUpperCase(),
      ]),
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // ── Section 7: Protection Assistance ──
  const protections = project.calculations.protectionRecommendations;
  if (protections.length > 0) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 15;
    }

    doc.setTextColor(...primaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('5. Assistance aux Protections (IEC 60364-4-43 & 4-41)', 14, currentY);
    currentY += 2;

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 7, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5, textColor: 30 },
      head: [['Type d\'Appareil', 'Courant In (A)', 'Pouvoir Icu', 'Courbe / Sensibilité', 'Prescription technique']],
      body: protections.map(p => [
        p.deviceType === 'circuit_breaker' ? 'Disjoncteur' : p.deviceType === 'rcd' ? 'Différentiel (DDR)' : p.deviceType,
        `${p.nominalCurrent_A} A`,
        p.breakingCapacity_kA ? `${p.breakingCapacity_kA} kA` : '—',
        p.tripCurve ? `Courbe ${p.tripCurve}` : p.rcdSensitivity_mA ? `${p.rcdSensitivity_mA} mA` : '—',
        p.notes.join(' ; '),
      ]),
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // New page for Load Inventory & Assumptions
  doc.addPage();
  currentY = 15;

  // ── Section 8: Load Inventory ──
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('6. Inventaire Détaillé des Charges Électriques', 14, currentY);
  currentY += 2;

  autoTable(doc, {
    startY: currentY,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 7, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: 30 },
    head: [['Désignation', 'Catégorie', 'Qté', 'P. Unit', 'P. Inst (kW)', 'Ku', 'Ks', 'P. Dem (kW)', 'cos φ', 'Priorité']],
    body: project.loads.map(l => [
      l.name,
      l.category,
      l.quantity.toString(),
      `${l.unitPower} ${l.powerUnit}`,
      formatPower(l.quantity * (l.unitPower / (l.powerUnit === 'W' ? 1000 : 1)), 'kW').replace(' kW', ''),
      l.utilizationFactor.toString(),
      l.simultaneityFactor.toString(),
      formatPower((l.quantity * (l.unitPower / (l.powerUnit === 'W' ? 1000 : 1))) * l.utilizationFactor * l.simultaneityFactor, 'kW').replace(' kW', ''),
      l.powerFactor.toString(),
      l.priority,
    ]),
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // ── Section 9: Engineering Assumptions ──
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('7. Hypothèses d\'Ingénierie Enregistrées', 14, currentY);
  currentY += 2;

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 7, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: 30 },
    head: [['ID', 'Description de l\'hypothèse', 'Origine']],
    body: project.assumptions.map(a => [
      a.id,
      a.description,
      a.source === 'user' ? 'Ingénieur' : 'Défaut système',
    ]),
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ── Standards & Versioning ──
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉFÉRENTIELS ET NORMES APPLIQUÉS :', 14, currentY);
  doc.setFont('helvetica', 'normal');
  currentY += 4;
  doc.text('• CEI 60364 : Installations électriques à basse tension (Parties 1, 4-41, 4-43, 5-52)', 14, currentY);
  currentY += 3.5;
  doc.text('• CEI 60909 : Calcul des courants de court-circuit dans les réseaux triphasés à courant alternatif', 14, currentY);
  currentY += 3.5;
  doc.text('• CEI 61439 : Ensembles d\'appareillage à basse tension', 14, currentY);
  currentY += 3.5;
  doc.text('• CEI 60034 : Machines électriques tournantes', 14, currentY);
  currentY += 3.5;
  doc.text('• Règlementation technique algérienne (Spécifications Sonelgaz / CREG)', 14, currentY);
  currentY += 6;

  // ── Mandatory Disclaimer ──
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, currentY, 182, 22, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('AVERTISSEMENT LÉGAL ET CLAUSE DE NON-RESPONSABILITÉ (MANDATORY DISCLAIMER) :', 18, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(
    '« Ce document est une étude technique d\'aide à la décision. Les calculs, hypothèses, sélections d\'équipements,',
    18,
    currentY + 10
  );
  doc.text(
    'et final design must be reviewed and validated by a qualified electrical professional before implementation. »',
    18,
    currentY + 14
  );
  doc.text(
    'SMART ELEC v1.0.0 — Généré le ' + formatDate(new Date().toISOString()) + ' par ' + (project.client || 'Bureau d\'études'),
    18,
    currentY + 18
  );

  return doc;
}

