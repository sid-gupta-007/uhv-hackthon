import { CorroborationSignal, EmergencyCategory, Incident, ScoreBreakdown } from './types';

/**
 * ============================================================================
 * RAKSHANET PRIORITY SCORING & MULTI-CHANNEL DATA FUSION ENGINE
 * ============================================================================
 * Universal Human Value (UHV) Design Principle:
 * "Every human life possesses inviolable intrinsic worth. Response systems must
 * never calculate the value of intervention based on socioeconomic status, citizenship,
 * identity credentials, or cold sector routing 'efficiency'."
 * ============================================================================
 */

export interface ScoringInput {
  category: EmergencyCategory;
  signals: CorroborationSignal[];
  estimatedEtaMinutes: number;
  companionCount: number;
}

export function calculateIncidentPriority(input: ScoringInput): {
  aiPriorityScore: number;
  corroborationTier: 1 | 2 | 3;
  scoreBreakdown: ScoreBreakdown;
  recommendedAction: string;
} {
  const reasons: string[] = [];

  // 1. BASE SEVERITY WEIGHT (0 - 45 pts)
  let severityBase = 20;
  switch (input.category) {
    case 'CARDIAC':
      severityBase = 45;
      reasons.push('High acute cardiac / respiratory risk factor (+45 base)');
      break;
    case 'TRAUMA':
      severityBase = 42;
      reasons.push('Severe trauma / hemorrhagic emergency profile (+42 base)');
      break;
    case 'MATERNAL':
      severityBase = 40;
      reasons.push('High-priority obstetric / maternal delivery emergency (+40 base)');
      break;
    case 'CRASH':
      severityBase = 38;
      reasons.push('High-impact vehicular collision reported (+38 base)');
      break;
    case 'FIRE':
      severityBase = 36;
      reasons.push('Active thermal / structural hazard trap (+36 base)');
      break;
    case 'DISASTER':
      severityBase = 44;
      reasons.push('Mass environmental / flood / structural surge (+44 base)');
      break;
    default:
      severityBase = 25;
      reasons.push('General medical distress (+25 base)');
      break;
  }

  // Extra weight if multiple victims / companions reported
  if (input.companionCount > 1) {
    const companionBonus = Math.min(input.companionCount * 2, 6);
    severityBase = Math.min(severityBase + companionBonus, 50);
    reasons.push(`Multiple individuals affected (${input.companionCount} count, +${companionBonus})`);
  }

  // 2. MULTI-CHANNEL CORROBORATION FUSION (0 - 30 pts)
  // We fuse disparate signals (Citizen PWA SOS, 112 Voice Call, Traffic CCTV IoT, SMS Crowd)
  let corroborationBonus = 0;
  const signalCount = input.signals.length;

  let totalSignalConfidence = 0;
  input.signals.forEach(sig => {
    totalSignalConfidence += sig.confidenceWeight;
  });

  let corroborationTier: 1 | 2 | 3 = 1;

  if (signalCount === 0 || signalCount === 1) {
    // Single uncorroborated report -> Tier 1 (Low-cost verification / First Responder Alert)
    corroborationTier = 1;
    corroborationBonus = 8;
    reasons.push('Tier 1 Signal: Single-channel report. Proportional verify + nearest volunteer alert.');
  } else if (signalCount === 2) {
    // Corroborated by 2 independent channels -> Tier 2 (Full Ambulance Dispatch)
    corroborationTier = 2;
    corroborationBonus = 22;
    reasons.push(`Tier 2 Signal: Multi-channel corroboration (${input.signals.map(s => s.sourceLabel).join(' + ')}). High confidence dispatch.`);
  } else {
    // 3+ Multi-channel signals -> Tier 3 (High-Confidence Surge / Mass Casualty Protocol)
    corroborationTier = 3;
    corroborationBonus = 30;
    reasons.push(`Tier 3 Signal: Mass corroboration across ${signalCount} independent feeds (+30 pts). Immediate multi-agency alert.`);
  }

  // 3. PROXIMITY & TIME CRITICALITY (0 - 20 pts)
  // Closer units increase feasibility score, but FAR UNITS DO NOT DISQUALIFY CRITICAL PATIENTS
  let proximitySpeedScore = 15;
  if (input.estimatedEtaMinutes <= 5) {
    proximitySpeedScore = 20;
    reasons.push(`Optimal immediate response unit within ${input.estimatedEtaMinutes} mins (+20 pts)`);
  } else if (input.estimatedEtaMinutes <= 12) {
    proximitySpeedScore = 14;
    reasons.push(`Standard proximity unit available (~${input.estimatedEtaMinutes} mins) (+14 pts)`);
  } else {
    proximitySpeedScore = 10;
    reasons.push(`Extended transit distance (~${input.estimatedEtaMinutes} mins); backup sector assist queued (+10 pts)`);
  }

  // 4. THE NON-NEGOTIABLE LIFE-SAFETY EQUITY FLOOR & HARD VETO CONSTRAINT
  /**
   * CRITICAL ETHICAL CONSTRAINT (Universal Human Values / UHV):
   * An algorithm must NEVER discount or downrank priority based on:
   * - Patient ID / Aadhaar verification status
   * - Economic status of location / informal settlement / slum
   * - Ability to pay private hospital fees
   * - "Sector efficiency metrics" (e.g., avoiding hard-to-reach unpaved roads)
   *
   * Below is the hardcoded minimum floor: If a condition is clinically severe (Cardiac, Maternal, Trauma, Crash),
   * the score CANNOT fall below 75 points, regardless of how isolated the sector is or lack of corroboration.
   */
  const hardFloorCategories: EmergencyCategory[] = ['CARDIAC', 'TRAUMA', 'MATERNAL', 'CRASH', 'DISASTER'];
  let hardFloorGuaranteed = false;

  let rawTotal = severityBase + corroborationBonus + proximitySpeedScore;

  if (hardFloorCategories.includes(input.category)) {
    hardFloorGuaranteed = true;
    if (rawTotal < 75) {
      rawTotal = 75; // Enforce hard floor minimum
      reasons.push('UHV Life-Safety Floor Active: Inviolable equity floor raised score to 75 (anti-deprioritization veto)');
    } else {
      reasons.push('UHV Life-Safety Floor Verified: Response guaranteed regardless of ID or sector wealth');
    }
  }

  // Cap between 0 and 100
  const finalScore = Math.min(Math.max(Math.round(rawTotal), 10), 100);

  // Recommended Action summary
  let recommendedAction = 'Dispatch Nearest Pooled Unit';
  if (corroborationTier === 1 && finalScore < 60) {
    recommendedAction = 'Dispatch Bike Volunteer / IVR Callback & Stage Nearest Ambulance';
  } else if (finalScore >= 85) {
    recommendedAction = 'Immediate Priority ALS Ambulance + Green Corridor Route Alert';
  } else if (finalScore >= 70) {
    recommendedAction = 'Authorize Nearest Available 108 / Pooled Private ALS Unit';
  }

  return {
    aiPriorityScore: finalScore,
    corroborationTier,
    scoreBreakdown: {
      severityBase,
      corroborationBonus,
      proximitySpeedScore,
      hardFloorGuaranteed,
      reasons,
      vetoActive: true
    },
    recommendedAction
  };
}
