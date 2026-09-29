export type ConnectivityTier = 'FULL_NETWORK' | 'LORA_MESH' | 'SNEAKERNET' | 'SATELLITE_PING';

export type EmergencyCategory = 
  | 'CARDIAC' 
  | 'TRAUMA' 
  | 'MATERNAL' 
  | 'CRASH' 
  | 'FIRE' 
  | 'DISASTER' 
  | 'OTHER';

export type EmergencySeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export type SignalSource = 
  | 'CITIZEN_PWA' 
  | 'VOICE_112' 
  | 'SMART_CITY_CCTV' 
  | 'SMS_CROWD' 
  | 'HOSPITAL_TRIAGE';

export interface CorroborationSignal {
  id: string;
  source: SignalSource;
  sourceLabel: string;
  timestamp: number;
  confidenceWeight: number; // 0.0 to 1.0
  summary: string;
  verified: boolean;
}

export interface ScoreBreakdown {
  severityBase: number;         // 0 - 45
  corroborationBonus: number;   // 0 - 30
  proximitySpeedScore: number;  // 0 - 25
  hardFloorGuaranteed: boolean; // Universal Human Value life-safety floor
  reasons: string[];
  vetoActive: boolean;          // Strictly prevents down-ranking based on cost, wealth, ID, efficiency
}

export interface Incident {
  id: string;
  trackingCode: string;
  category: EmergencyCategory;
  categoryLabel: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    sectorId: string;
    sectorName: string;
    landmark: string;
    accuracyMeters: number;
  };
  reportedAt: number;
  connectivityTier: ConnectivityTier;
  signals: CorroborationSignal[];
  corroborationTier: 1 | 2 | 3; // Tier 1: Single signal -> low cost check; Tier 2: 2+ signals -> Full dispatch; Tier 3: Mass casualty
  aiPriorityScore: number;      // 0 - 100
  scoreBreakdown: ScoreBreakdown;
  status: 'QUEUED_OFFLINE' | 'SYNCED_PENDING' | 'RECOMMENDED' | 'DISPATCHED' | 'RESOLVED';
  recommendedUnitId: string;
  assignedUnitId?: string;
  assignedUnitName?: string;
  isOverridden?: boolean;
  overrideReason?: string;
  overrideBadgeId?: string;
  etaMinutes: number;
  companionCount: number;
  audioNoteRecorded?: boolean;
  citizenLanguage: 'en' | 'hi' | 'kn' | 'bn';
  isSynced: boolean;
  ledgerBlockIndex?: number;
  citizenNameMasked?: string;
}

export interface HexSector {
  id: string;
  name: string;
  code: string;
  zoneType: 'METRO_CORE' | 'PERI_URBAN' | 'RURAL_NORTH' | 'INDUSTRIAL' | 'TRANSIT_CORRIDOR';
  center: { lat: number; lng: number };
  gridPos: { q: number; r: number }; // Axial hex coordinates for layout
  activeIncidentsCount: number;
  primaryUnitIds: string[];
  backupSectorId: string;
  isBackupActive: boolean;
  connectivityTier: ConnectivityTier;
  signalMeshNodes: number;
  status: 'NORMAL' | 'ELEVATED' | 'CRITICAL_SURGE';
}

export type ResponderType = 
  | 'GOVT_108_ALS' 
  | 'PRIVATE_APOLLO_ALS' 
  | 'RED_CROSS_VOLUNTEER' 
  | 'DRONE_MEDIC' 
  | 'COMMUNITY_FIRST_AID';

export interface ResponderUnit {
  id: string;
  name: string;
  vehicleNumber: string;
  type: ResponderType;
  organization: string;
  sectorId: string;
  status: 'AVAILABLE' | 'EN_ROUTE' | 'ON_SCENE' | 'MAINTENANCE';
  equipment: string[];
  crew: string;
  contactMasked: string;
  etaToIncidentMinutes?: number;
  currentLat: number;
  currentLng: number;
}

export interface LedgerBlock {
  index: number;
  timestamp: number;
  incidentId: string;
  trackingCode: string;
  action: 
    | 'GENESIS_INITIALIZATION'
    | 'AI_RECOMMENDATION' 
    | 'DISPATCH_APPROVED' 
    | 'DISPATCH_OVERRIDDEN' 
    | 'RESOURCE_BACKUP_TRIGGERED' 
    | 'OFFLINE_BURST_SYNCED';
  actor: string;
  details: string;
  overrideReason?: string;
  lifeSafetyVetoEnforced: boolean;
  dataIntegrityPayload: string;
  previousHash: string;
  hash: string;
  isValid?: boolean; // verified state
}

export interface PublicEquityMetric {
  sectorId: string;
  sectorName: string;
  zoneType: string;
  averageResponseMinutes: number;
  targetResponseMinutes: number;
  totalCallsToday: number;
  resourceDeficitAlert: boolean;
  pooledGovtShare: number;
  pooledPrivateShare: number;
  pooledVolunteerShare: number;
}
