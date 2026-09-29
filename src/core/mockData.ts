import { HexSector, Incident, LedgerBlock, PublicEquityMetric, ResponderUnit } from './types';
import { calculateIncidentPriority } from './priorityEngine';
import { appendLedgerBlock, createGenesisBlock } from './cryptoLedger';

export const INITIAL_HEX_SECTORS: HexSector[] = [
  {
    id: 'SEC-H1',
    name: 'Indiranagar - Metro Core',
    code: 'H1-METRO',
    zoneType: 'METRO_CORE',
    center: { lat: 12.9784, lng: 77.6408 },
    gridPos: { q: 0, r: 0 },
    activeIncidentsCount: 2,
    primaryUnitIds: ['RES-108-01', 'RES-APOLLO-01'],
    backupSectorId: 'SEC-H2', // Koramangala is backup
    isBackupActive: true,      // Active backup demo!
    connectivityTier: 'FULL_NETWORK',
    signalMeshNodes: 12,
    status: 'ELEVATED'
  },
  {
    id: 'SEC-H2',
    name: 'Koramangala - Tech Hub',
    code: 'H2-TECH',
    zoneType: 'METRO_CORE',
    center: { lat: 12.9352, lng: 77.6245 },
    gridPos: { q: 1, r: -1 },
    activeIncidentsCount: 1,
    primaryUnitIds: ['RES-MANIPAL-01', 'RES-REDCROSS-01'],
    backupSectorId: 'SEC-H3',
    isBackupActive: false,
    connectivityTier: 'FULL_NETWORK',
    signalMeshNodes: 18,
    status: 'NORMAL'
  },
  {
    id: 'SEC-H3',
    name: 'Peenya - Industrial Belt',
    code: 'H3-IND',
    zoneType: 'INDUSTRIAL',
    center: { lat: 13.0285, lng: 77.5197 },
    gridPos: { q: -1, r: 1 },
    activeIncidentsCount: 1,
    primaryUnitIds: ['RES-108-02'],
    backupSectorId: 'SEC-H4',
    isBackupActive: false,
    connectivityTier: 'LORA_MESH',
    signalMeshNodes: 6,
    status: 'NORMAL'
  },
  {
    id: 'SEC-H4',
    name: 'Whitefield - Peri-Urban East',
    code: 'H4-EAST',
    zoneType: 'PERI_URBAN',
    center: { lat: 12.9698, lng: 77.7500 },
    gridPos: { q: 1, r: 0 },
    activeIncidentsCount: 1,
    primaryUnitIds: ['RES-GARUDA-01', 'RES-108-03'],
    backupSectorId: 'SEC-H1',
    isBackupActive: false,
    connectivityTier: 'FULL_NETWORK',
    signalMeshNodes: 9,
    status: 'NORMAL'
  },
  {
    id: 'SEC-H5',
    name: 'Anekal - Rural South Corridor',
    code: 'H5-RURAL',
    zoneType: 'RURAL_NORTH',
    center: { lat: 12.7107, lng: 77.6974 },
    gridPos: { q: 0, r: 1 },
    activeIncidentsCount: 1,
    primaryUnitIds: ['RES-COMM-01'],
    backupSectorId: 'SEC-H2',
    isBackupActive: true, // Backup active from urban center!
    connectivityTier: 'SNEAKERNET',
    signalMeshNodes: 3,
    status: 'ELEVATED'
  },
  {
    id: 'SEC-H6',
    name: 'Hesaraghatta - Lake & Farm Belt',
    code: 'H6-OUTER',
    zoneType: 'RURAL_NORTH',
    center: { lat: 13.1415, lng: 77.4890 },
    gridPos: { q: -1, r: 0 },
    activeIncidentsCount: 0,
    primaryUnitIds: ['RES-REDCROSS-02'],
    backupSectorId: 'SEC-H3',
    isBackupActive: false,
    connectivityTier: 'SATELLITE_PING',
    signalMeshNodes: 1,
    status: 'NORMAL'
  },
  {
    id: 'SEC-H7',
    name: 'Bannerghatta - Forest Fringe',
    code: 'H7-FOREST',
    zoneType: 'PERI_URBAN',
    center: { lat: 12.8009, lng: 77.5777 },
    gridPos: { q: 0, r: -1 },
    activeIncidentsCount: 0,
    primaryUnitIds: ['RES-GARUDA-02'],
    backupSectorId: 'SEC-H5',
    isBackupActive: false,
    connectivityTier: 'LORA_MESH',
    signalMeshNodes: 4,
    status: 'NORMAL'
  }
];

export const INITIAL_RESPONDERS: ResponderUnit[] = [
  {
    id: 'RES-108-01',
    name: '108 Karnataka ALS-04',
    vehicleNumber: 'KA-01-G-1108',
    type: 'GOVT_108_ALS',
    organization: 'Government 108 Emergency Fleet',
    sectorId: 'SEC-H1',
    status: 'EN_ROUTE',
    equipment: ['Defibrillator (AED)', 'Portable Ventilator', 'Multi-param Monitor', 'Suction Unit'],
    crew: 'Dr. R. Sharma (EMO), Paramedic K. Gowda',
    contactMasked: '+91 98••••••12',
    etaToIncidentMinutes: 6,
    currentLat: 12.9750,
    currentLng: 77.6380
  },
  {
    id: 'RES-APOLLO-01',
    name: 'Apollo QuickResponse ALS-2',
    vehicleNumber: 'KA-05-AB-4421',
    type: 'PRIVATE_APOLLO_ALS',
    organization: 'Apollo Hospital Network (Pooled)',
    sectorId: 'SEC-H1',
    status: 'AVAILABLE',
    equipment: ['Advanced Cardiac Life Support', 'Transport Incubator', 'Trauma Kit'],
    crew: 'Paramedic Anand V., EMT Priya M.',
    contactMasked: '+91 94••••••88',
    etaToIncidentMinutes: 4,
    currentLat: 12.9810,
    currentLng: 77.6440
  },
  {
    id: 'RES-MANIPAL-01',
    name: 'Manipal Rapid Critical Care-1',
    vehicleNumber: 'KA-03-MC-9080',
    type: 'PRIVATE_APOLLO_ALS',
    organization: 'Manipal Health Network (Pooled)',
    sectorId: 'SEC-H2',
    status: 'AVAILABLE',
    equipment: ['Ventilator', 'Crash Cart', 'Oxygen Concentrator', 'ECG 12-lead'],
    crew: 'Dr. Sunita Pai, EMT George K.',
    contactMasked: '+91 99••••••33',
    etaToIncidentMinutes: 8,
    currentLat: 12.9380,
    currentLng: 77.6210
  },
  {
    id: 'RES-REDCROSS-01',
    name: 'Red Cross First Response Bike',
    vehicleNumber: 'KA-04-RC-1011',
    type: 'RED_CROSS_VOLUNTEER',
    organization: 'Indian Red Cross Society',
    sectorId: 'SEC-H2',
    status: 'AVAILABLE',
    equipment: ['Trauma Hemostatic Gauze', 'Automated External Defibrillator', 'EpiPen', 'Splints'],
    crew: 'Vol. Responder Rahul Sen',
    contactMasked: '+91 97••••••45',
    etaToIncidentMinutes: 3,
    currentLat: 12.9340,
    currentLng: 77.6280
  },
  {
    id: 'RES-108-02',
    name: '108 Industrial Heavy Trauma ALS',
    vehicleNumber: 'KA-02-G-7744',
    type: 'GOVT_108_ALS',
    organization: 'Government 108 Emergency Fleet',
    sectorId: 'SEC-H3',
    status: 'AVAILABLE',
    equipment: ['Burn Dressings Kit', 'Chemical Decontamination', 'Spine Board', 'Oxygen'],
    crew: 'Paramedic Chetan Kumar, Driver Somu',
    contactMasked: '+91 91••••••67',
    etaToIncidentMinutes: 7,
    currentLat: 13.0250,
    currentLng: 77.5210
  },
  {
    id: 'RES-GARUDA-01',
    name: 'Garuda MedicDrone Alpha',
    vehicleNumber: 'DRONE-GAR-01',
    type: 'DRONE_MEDIC',
    organization: 'Garuda Aerospace Rapid Medic Drone',
    sectorId: 'SEC-H4',
    status: 'AVAILABLE',
    equipment: ['AED Defibrillator Payload', 'Antivenom Unit', 'Blood Bag Carrier', '4K Recon Cam'],
    crew: 'Remote Pilot Divya N. (DGCA Certified)',
    contactMasked: '+91 80••••••90',
    etaToIncidentMinutes: 2,
    currentLat: 12.9710,
    currentLng: 77.7480
  },
  {
    id: 'RES-COMM-01',
    name: 'Gramin ASHA First Responder Van',
    vehicleNumber: 'KA-51-E-2309',
    type: 'COMMUNITY_FIRST_AID',
    organization: 'Gramin Community Health Auxiliary',
    sectorId: 'SEC-H5',
    status: 'AVAILABLE',
    equipment: ['Maternal Delivery Kit', 'Oxygen Canisters', 'BP Apparatus', 'Fetal Doppler'],
    crew: 'ASHA Leader Lakshmi Devi, EMT Ramesh',
    contactMasked: '+91 96••••••78',
    etaToIncidentMinutes: 11,
    currentLat: 12.7150,
    currentLng: 77.6920
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-001',
    trackingCode: 'RN-BLR-8921',
    category: 'CARDIAC',
    categoryLabel: 'Acute Chest Pain / Cardiac Distress',
    description: 'Elderly male collapsed on sidewalk near Metro Pillar 142. Conscious but labored breathing.',
    location: {
      lat: 12.9784,
      lng: 77.6408,
      sectorId: 'SEC-H1',
      sectorName: 'Indiranagar - Metro Core',
      landmark: 'Near 100ft Road BDA Complex & Metro Pillar 142',
      accuracyMeters: 8
    },
    reportedAt: Date.now() - 1000 * 60 * 7,
    connectivityTier: 'FULL_NETWORK',
    signals: [
      {
        id: 'SIG-01',
        source: 'CITIZEN_PWA',
        sourceLabel: 'Citizen PWA SOS (Direct 5G)',
        timestamp: Date.now() - 1000 * 60 * 7,
        confidenceWeight: 0.95,
        summary: 'One-tap SOS triggered with exact GPS fix and audio note',
        verified: true
      },
      {
        id: 'SIG-02',
        source: 'VOICE_112',
        sourceLabel: 'ERSS 112 Voice Telephony Dispatch',
        timestamp: Date.now() - 1000 * 60 * 6,
        confidenceWeight: 0.90,
        summary: 'Eyewitness shopkeeper corroborated collapse',
        verified: true
      }
    ],
    corroborationTier: 2,
    aiPriorityScore: 94,
    scoreBreakdown: {
      severityBase: 45,
      corroborationBonus: 22,
      proximitySpeedScore: 20,
      hardFloorGuaranteed: true,
      reasons: [
        'High acute cardiac risk profile (+45 base)',
        'Tier 2 Signal: Corroborated across Citizen PWA + 112 Voice (+22 pts)',
        'Primary unit 108 Karnataka ALS-04 in transit (~6 mins)',
        'UHV Life-Safety Floor Verified: Highest priority dispatch'
      ],
      vetoActive: true
    },
    status: 'DISPATCHED',
    recommendedUnitId: 'RES-108-01',
    assignedUnitId: 'RES-108-01',
    assignedUnitName: '108 Karnataka ALS-04 (Govt Fleet)',
    etaMinutes: 6,
    companionCount: 1,
    audioNoteRecorded: true,
    citizenLanguage: 'en',
    isSynced: true,
    citizenNameMasked: 'S. Sharma',
    ledgerBlockIndex: 1
  },
  {
    id: 'INC-2026-002',
    trackingCode: 'RN-BLR-9044',
    category: 'CRASH',
    categoryLabel: 'Vehicular Multi-Vehicle Collision',
    description: 'Flyover ramp collision between two-wheeler and delivery truck. Multiple injured.',
    location: {
      lat: 12.9352,
      lng: 77.6245,
      sectorId: 'SEC-H2',
      sectorName: 'Koramangala - Tech Hub',
      landmark: 'Sony World Signal Flyover Ramp',
      accuracyMeters: 12
    },
    reportedAt: Date.now() - 1000 * 60 * 3,
    connectivityTier: 'FULL_NETWORK',
    signals: [
      {
        id: 'SIG-03',
        source: 'CITIZEN_PWA',
        sourceLabel: 'Citizen PWA SOS',
        timestamp: Date.now() - 1000 * 60 * 3,
        confidenceWeight: 0.88,
        summary: 'Bystander SOS with companion count = 2',
        verified: true
      },
      {
        id: 'SIG-04',
        source: 'SMART_CITY_CCTV',
        sourceLabel: 'Smart City CCTV AI Incident Beacon',
        timestamp: Date.now() - 1000 * 60 * 2,
        confidenceWeight: 0.92,
        summary: 'Automated video crash anomaly detected at Sony World Jn',
        verified: true
      },
      {
        id: 'SIG-05',
        source: 'SMS_CROWD',
        sourceLabel: 'Crowdsourced SMS Geotag Burst',
        timestamp: Date.now() - 1000 * 60 * 2,
        confidenceWeight: 0.75,
        summary: '2 additional SMS alerts received within 300m radius',
        verified: true
      }
    ],
    corroborationTier: 3,
    aiPriorityScore: 92,
    scoreBreakdown: {
      severityBase: 42,
      corroborationBonus: 30,
      proximitySpeedScore: 20,
      hardFloorGuaranteed: true,
      reasons: [
        'Severe vehicular crash profile (+38 base) + multiple injured (+4)',
        'Tier 3 Signal: Mass corroboration across 3 independent feeds (PWA + CCTV + SMS) (+30 pts)',
        'Red Cross Rapid Bike (<3 mins) recommended for immediate triage + Manipal ALS (<8 mins)',
        'UHV Life-Safety Floor Verified: Guaranteed unconditional priority'
      ],
      vetoActive: true
    },
    status: 'RECOMMENDED',
    recommendedUnitId: 'RES-REDCROSS-01',
    etaMinutes: 3,
    companionCount: 2,
    audioNoteRecorded: false,
    citizenLanguage: 'hi',
    isSynced: true,
    citizenNameMasked: 'A. Patel',
    ledgerBlockIndex: 2
  },
  {
    id: 'INC-2026-003',
    trackingCode: 'RN-BLR-9102',
    category: 'MATERNAL',
    categoryLabel: 'Urgent Labor / Maternal Delivery in Transit',
    description: 'Expectant mother in active labor. Village road with intermittent connectivity.',
    location: {
      lat: 12.7107,
      lng: 77.6974,
      sectorId: 'SEC-H5',
      sectorName: 'Anekal - Rural South Corridor',
      landmark: 'Near Gram Panchayat Office & Primary Health Post',
      accuracyMeters: 25
    },
    reportedAt: Date.now() - 1000 * 60 * 12,
    connectivityTier: 'SNEAKERNET',
    signals: [
      {
        id: 'SIG-06',
        source: 'CITIZEN_PWA',
        sourceLabel: 'Citizen PWA (Relayed via Sneakernet Transit Bus)',
        timestamp: Date.now() - 1000 * 60 * 12,
        confidenceWeight: 0.85,
        summary: 'Encrypted SOS packet forwarded by BMTC Smart Bus #365 Node',
        verified: true
      }
    ],
    corroborationTier: 1,
    aiPriorityScore: 82,
    scoreBreakdown: {
      severityBase: 40,
      corroborationBonus: 8,
      proximitySpeedScore: 10,
      hardFloorGuaranteed: true,
      reasons: [
        'High-priority obstetric maternal delivery (+40 base)',
        'UHV Life-Safety Floor Active: Inviolable floor raised priority to 82 despite single rural sneakernet hop',
        'Anti-discrimination veto active: Zero penalty for remote rural road condition',
        'Cross-sector backup recommended: Dispatching Gramin ASHA van + Staging Koramangala ALS unit'
      ],
      vetoActive: true
    },
    status: 'RECOMMENDED',
    recommendedUnitId: 'RES-COMM-01',
    etaMinutes: 11,
    companionCount: 1,
    audioNoteRecorded: false,
    citizenLanguage: 'kn',
    isSynced: true,
    citizenNameMasked: 'R. Gowda',
    ledgerBlockIndex: 3
  }
];

export const INITIAL_PUBLIC_METRICS: PublicEquityMetric[] = [
  {
    sectorId: 'SEC-H1',
    sectorName: 'Indiranagar (Metro Core)',
    zoneType: 'Metro Core',
    averageResponseMinutes: 6.2,
    targetResponseMinutes: 8.0,
    totalCallsToday: 14,
    resourceDeficitAlert: false,
    pooledGovtShare: 45,
    pooledPrivateShare: 40,
    pooledVolunteerShare: 15
  },
  {
    sectorId: 'SEC-H2',
    sectorName: 'Koramangala (Tech Hub)',
    zoneType: 'Metro Core',
    averageResponseMinutes: 5.8,
    targetResponseMinutes: 8.0,
    totalCallsToday: 11,
    resourceDeficitAlert: false,
    pooledGovtShare: 40,
    pooledPrivateShare: 45,
    pooledVolunteerShare: 15
  },
  {
    sectorId: 'SEC-H3',
    sectorName: 'Peenya (Industrial Belt)',
    zoneType: 'Industrial',
    averageResponseMinutes: 8.1,
    targetResponseMinutes: 10.0,
    totalCallsToday: 8,
    resourceDeficitAlert: false,
    pooledGovtShare: 65,
    pooledPrivateShare: 25,
    pooledVolunteerShare: 10
  },
  {
    sectorId: 'SEC-H4',
    sectorName: 'Whitefield (Peri-Urban East)',
    zoneType: 'Peri-Urban',
    averageResponseMinutes: 9.4,
    targetResponseMinutes: 10.0,
    totalCallsToday: 9,
    resourceDeficitAlert: false,
    pooledGovtShare: 50,
    pooledPrivateShare: 35,
    pooledVolunteerShare: 15
  },
  {
    sectorId: 'SEC-H5',
    sectorName: 'Anekal (Rural South Corridor)',
    zoneType: 'Rural Fringe',
    averageResponseMinutes: 12.8,
    targetResponseMinutes: 15.0,
    totalCallsToday: 5,
    resourceDeficitAlert: true, // Highlights under-resourced area constructively!
    pooledGovtShare: 55,
    pooledPrivateShare: 15,
    pooledVolunteerShare: 30
  },
  {
    sectorId: 'SEC-H6',
    sectorName: 'Hesaraghatta (Outer Farm Belt)',
    zoneType: 'Rural Fringe',
    averageResponseMinutes: 14.1,
    targetResponseMinutes: 15.0,
    totalCallsToday: 2,
    resourceDeficitAlert: true,
    pooledGovtShare: 60,
    pooledPrivateShare: 10,
    pooledVolunteerShare: 30
  },
  {
    sectorId: 'SEC-H7',
    sectorName: 'Bannerghatta (Forest Fringe)',
    zoneType: 'Peri-Urban',
    averageResponseMinutes: 10.5,
    targetResponseMinutes: 12.0,
    totalCallsToday: 3,
    resourceDeficitAlert: false,
    pooledGovtShare: 50,
    pooledPrivateShare: 20,
    pooledVolunteerShare: 30
  }
];

// Multilingual Translations Dictionary
export const I18N = {
  en: {
    appName: 'RakshaNet',
    tagline: 'Emergency Trust & Resource Coordination Network',
    oneTapSOS: 'PRESS FOR EMERGENCY HELP',
    holdingCancel: 'Hold or tap to trigger SOS',
    emergencyTriggered: 'EMERGENCY TRIGGERED',
    cancelCountdown: 'Cancel (3s)',
    reassureTitle: 'Help is on the way',
    reassureSub: 'We are locating and routing the nearest available team to your coordinates.',
    findingTeam: 'Coordinating with Government 108, Hospital & Volunteer Teams...',
    statusDispatched: 'Paramedic Team En Route',
    statusQueuedOffline: 'Saved securely on device — will auto-relay instantly upon signal',
    statusSynced: 'Request verified and registered with Central Command',
    tier4g: 'Tier 1: Full 4G/5G Network (Direct Cloud API)',
    tierLora: 'Tier 2: LoRa Mesh 868MHz (Relaying via 2 Local Nodes)',
    tierSneaker: 'Tier 3: Vehicle Sneakernet (Relaying via Transit Bus Beacon)',
    tierSat: 'Tier 4: Satellite Direct Ping (ISRO NavIC Byte Burst)',
    eta: 'Estimated Arrival',
    firstAidTip: 'First Aid Advice While Waiting',
    firstAidCardiac: 'Keep patient calm in seated position. Loosen tight collar. Do not give solid food.',
    firstAidCrash: 'Do not move neck unless fire danger. Apply direct pressure to bleeding with clean cloth.',
    firstAidMaternal: 'Help mother lie on left side. Maintain warmth. Have clean blankets ready.',
    categoryPrompt: 'Select Emergency Nature (Optional)',
    companionPrompt: 'How many people need assistance?',
    recordVoice: 'Record Voice Note (Optional)',
    recordVoiceDone: 'Voice Note Saved (4s)',
    landmarkPrompt: 'Nearby Landmark / Street Name',
    simulateOffline: 'Simulate Airplane Mode / Zero Signal',
    simulateOnline: 'Reconnect Network (Auto-Sync)',
    viewAudit: 'Audit & Accountability Ledger',
    viewDispatcher: 'Dispatcher HQ',
    viewCitizen: 'Citizen SOS View',
    viewTransparency: 'Public Equity Portal',
    cardiac: 'Heart / Chest Pain',
    trauma: 'Severe Bleeding / Trauma',
    maternal: 'Maternal / Delivery',
    crash: 'Road / Vehicle Crash',
    fire: 'Fire / Thermal Hazard',
    disaster: 'Flood / Disaster / Collapse',
    other: 'Other Medical Emergency'
  },
  hi: {
    appName: 'रक्षामित्र (RakshaNet)',
    tagline: 'आपातकालीन भरोसा एवं संसाधन समन्वय प्रणाली',
    oneTapSOS: 'आपातकालीन सहायता के लिए दबाएं',
    holdingCancel: 'मदद के लिए बड़ा बटन दबाएं',
    emergencyTriggered: 'आपातकालीन सूचना दर्ज हुई',
    cancelCountdown: 'रद्द करें (3s)',
    reassureTitle: 'मदद रास्ते में है',
    reassureSub: 'हम आपकी लोकेशन पर सबसे करीबी उपलब्ध एम्बुलेंस और टीम भेज रहे हैं।',
    findingTeam: 'सरकारी 108, अस्पताल और स्वयंसेवक टीमों से समन्वय...',
    statusDispatched: 'पैरामेडिक टीम रवाना हो चुकी है',
    statusQueuedOffline: 'डिवाइस पर सुरक्षित सेव — नेटवर्क मिलते ही तुरंत अपने-आप भेजा जाएगा',
    statusSynced: 'कंट्रोल रूम में सूचना दर्ज हो चुकी है',
    tier4g: 'टियर 1: 4G/5G मोबाइल नेटवर्क (सीधा क्लाउड लिंक)',
    tierLora: 'टियर 2: LoRa मेश 868MHz (स्थानीय नोड्स के जरिए रिले)',
    tierSneaker: 'टियर 3: वाहन स्नीकरनेट (बस/ऑटो रिले द्वारा प्रेषित)',
    tierSat: 'टियर 4: सैटेलाइट डायरेक्ट पिंग (NavIC आपातकालीन सिग्नल)',
    eta: 'पहुंचने का अनुमानित समय',
    firstAidTip: 'मदद आने तक प्राथमिक उपचार सलाह',
    firstAidCardiac: 'रोगी को शांत बैठाएं। तंग कपड़े ढीले करें। पानी या खाना न दें।',
    firstAidCrash: 'गर्दन न हिलाएं। घाव पर साफ कपड़े से दबाव बनाएं।',
    firstAidMaternal: 'माता को बाईं करवट लिटाएं। शरीर को गर्म और शांत रखें।',
    categoryPrompt: 'समस्या का प्रकार चुनें (वैकल्पिक)',
    companionPrompt: 'कितने लोगों को सहायता चाहिए?',
    recordVoice: 'वॉइस संदेश रिकॉर्ड करें',
    recordVoiceDone: 'वॉइस संदेश सुरक्षित (4s)',
    landmarkPrompt: 'नजदीकी लैंडमार्क या सड़क का नाम',
    simulateOffline: 'सिम्युलेट करें: बिना नेटवर्क (एयरप्लेन मोड)',
    simulateOnline: 'नेटवर्क पुनः कनेक्ट करें (ऑटो-सिंक)',
    viewAudit: 'निरीक्षण व लेजर',
    viewDispatcher: 'डिस्पैचर कंट्रोल रूम',
    viewCitizen: 'नागरिक SOS ऐप',
    viewTransparency: 'पारदर्शिता पोर्टल',
    cardiac: 'हार्ट अटैक / सीने में दर्द',
    trauma: 'गंभीर चोट / रक्तस्राव',
    maternal: 'प्रसव / गर्भवती सहायता',
    crash: 'सड़क दुर्घटना / टक्कर',
    fire: 'आग / आगजनी',
    disaster: 'बाढ़ / आपदा / भवन क्षति',
    other: 'अन्य आपातकालीन स्थिति'
  },
  kn: {
    appName: 'ರಕ್ಷಾನೆಟ್ (RakshaNet)',
    tagline: 'ತುರ್ತು ಸಂಪನ್ಮೂಲ ಮತ್ತು ನಂಬಿಕೆ ಸಮನ್ವಯ ಜಾಲ',
    oneTapSOS: 'ತುರ್ತು ಸಹಾಯಕ್ಕಾಗಿ ಒತ್ತಿರಿ',
    holdingCancel: 'ಸಹಾಯಕ್ಕಾಗಿ ಒತ್ತಿರಿ',
    emergencyTriggered: 'ತುರ್ತು ವಿನಂತಿ ದಾಖಲಾಗಿದೆ',
    cancelCountdown: 'ರದ್ದುಮಾಡಿ (3s)',
    reassureTitle: 'ಸಹಾಯವು ದಾರಿಯಲ್ಲಿದೆ',
    reassureSub: 'ನಿಮ್ಮ ಸ್ಥಳಕ್ಕೆ ಹತ್ತಿರದ ಆಂಬ್ಯುಲೆನ್ಸ್ ಮತ್ತು ತಂಡವನ್ನು ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ.',
    findingTeam: 'ಸರ್ಕಾರಿ 108 ಮತ್ತು ಆಸ್ಪತ್ರೆ ತಂಡಗಳೊಂದಿಗೆ ಸಮನ್ವಯ...',
    statusDispatched: 'ಪ್ಯಾರಾಮೆಡಿಕ್ ತಂಡ ಹೊರಟಿದೆ',
    statusQueuedOffline: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ — ಸಿಗ್ನಲ್ ಬಂದ ತಕ್ಷಣ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಕಳುಹಿಸಲಾಗುತ್ತದೆ',
    statusSynced: 'ನಿಯಂತ್ರಣ ಕೊಠಡಿಯಲ್ಲಿ ದಾಖಲಾಗಿದೆ',
    tier4g: 'ಶ್ರೇಣಿ 1: 4G/5G ನೆಟ್‌ವರ್ಕ್ (ನೇರ ಸಂಪರ್ಕ)',
    tierLora: 'ಶ್ರೇಣಿ 2: ಲೋರಾ ಮೆಶ್ (ಸ್ಥಳೀಯ ನೋಡ್‌ಗಳ ಮೂಲಕ)',
    tierSneaker: 'ಶ್ರೇಣಿ 3: ವಾಹನ ಸ್ನೇಕರ್ನೆಟ್ (ಬಸ್ ರಿಲೇ ಮೂಲಕ)',
    tierSat: 'ಶ್ರೇಣಿ 4: ಉಪಗ್ರಹ ನೇರ ಪಿಂಗ್ (NavIC ತುರ್ತು ಸಿಗ್ನಲ್)',
    eta: 'ಅಂದಾಜು ಆಗಮನ ಸಮಯ',
    firstAidTip: 'ಪ್ರಥಮ ಚಿಕಿತ್ಸಾ ಸಲಹೆ',
    firstAidCardiac: 'ರೋಗಿಯನ್ನು ಶಾಂತವಾಗಿ ಕುಳ್ಳಿರಿಸಿ. ಬಿಗಿಯಾದ ಬಟ್ಟೆ ಸಡಿಲಗೊಳಿಸಿ.',
    firstAidCrash: 'ಕುತ್ತಿಗೆಯನ್ನು ಅಲುಗಾಡಿಸಬೇಡಿ. ಸ್ವಚ್ಛ ಬಟ್ಟೆಯಿಂದ ರಕ್ತಸ್ರಾವ ತಡೆಯಿರಿ.',
    firstAidMaternal: 'ತಾಯಿಯನ್ನು ಎಡಭಾಗಕ್ಕೆ ಮಲಗಿಸಿ. ಬೆಚ್ಚಗೆ ಇರಿಸಿ.',
    categoryPrompt: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿಯ ವಿಧ (ಐಚ್ಛಿಕ)',
    companionPrompt: 'ಎಷ್ಟು ಜನರಿಗೆ ಸಹಾಯ ಬೇಕು?',
    recordVoice: 'ಧ್ವನಿ ಸಂದೇಶ ರೆಕಾರ್ಡ್ ಮಾಡಿ',
    recordVoiceDone: 'ಧ್ವನಿ ಉಳಿಸಲಾಗಿದೆ (4s)',
    landmarkPrompt: 'ಹತ್ತಿರದ ಹೆಗ್ಗುರುತು',
    simulateOffline: 'ನೆಟ್‌ವರ್ಕ್ ರಹಿತ ಮೋಡ್ (ಆಫ್‌ಲೈನ್)',
    simulateOnline: 'ನೆಟ್‌ವರ್ಕ್ ಮರುಸಂಪರ್ಕ (ಸ್ವಯಂ ಸಿಂಕ್)',
    viewAudit: 'ಲೆಡ್ಜರ್ ಪರಿಶೀಲನೆ',
    viewDispatcher: 'ಡಿಸ್ಪ್ಯಾಚರ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    viewCitizen: 'ನಾಗರಿಕ SOS',
    viewTransparency: 'ಸಾರ್ವಜನಿಕ ಪಾರದರ್ಶಕತೆ',
    cardiac: 'ಹೃದಯಾಘಾತ / ಎದೆನೋವು',
    trauma: 'ತೀವ್ರ ಗಾಯ / ರಕ್ತಸ್ರಾವ',
    maternal: 'ಹೆರಿಗೆ / ಗರ್ಭಿಣಿ ನೆರವು',
    crash: 'ರಸ್ತೆ ಅಪಘಾತ',
    fire: 'ಬೆಂಕಿ ಅವಘಡ',
    disaster: 'ಪ್ರವಾಹ / ವಿಪತ್ತು',
    other: 'ಇತರ ವೈದ್ಯಕೀಯ ತುರ್ತು'
  },
  bn: {
    appName: 'রক্ষানেট (RakshaNet)',
    tagline: 'জরুরি বিশ্বাস ও সম্পদ সমন্বয় নেটওয়ার্ক',
    oneTapSOS: 'জরুরি সাহায্যের জন্য চাপুন',
    holdingCancel: 'সহায়তার জন্য বোতামটি চাপুন',
    emergencyTriggered: 'জরুরি অনুরোধ নথিভুক্ত হয়েছে',
    cancelCountdown: 'বাতিল করুন (3s)',
    reassureTitle: 'সাহায্য আসছে',
    reassureSub: 'নিকটতম উপলব্ধ অ্যাম্বুলেন্স এবং দল আপনার লোকেশনের দিকে রওনা হচ্ছে।',
    findingTeam: 'সরকারি ১০৮ এবং হাসপাতাল দলের সাথে সমন্বয় চলছে...',
    statusDispatched: 'প্যারামেডিক দল রওনা হয়েছে',
    statusQueuedOffline: 'ডিভাইসে সংরক্ষিত — নেটওয়ার্ক পাওয়ামাত্র স্বয়ংক্রিয়ভাবে পাঠানো হবে',
    statusSynced: 'কন্ট্রোল রুমে গৃহীত হয়েছে',
    tier4g: 'স্তর ১: 4G/5G মোবাইল নেটওয়ার্ক (সরাসরি লিঙ্ক)',
    tierLora: 'স্তর ২: লোরা মেশ (স্থানীয় নোডের মাধ্যমে রিলে)',
    tierSneaker: 'স্তর ৩: যানবাহন স্নিকারনেট (বাস রিলে দ্বারা প্রেরিত)',
    tierSat: 'স্তর ৪: স্যাটেলাইট সরাসরি পিং (NavIC জরুরি সিগন্যাল)',
    eta: 'পৌঁছানোর আনুমানিক সময়',
    firstAidTip: 'প্রাথমিক চিকিৎসা পরামর্শ',
    firstAidCardiac: 'রোগীকে শান্তভাবে বসিয়ে রাখুন। আঁটসাঁট জামাকাপড় ঢিলে করুন।',
    firstAidCrash: 'ঘাড় নাড়াবেন না। পরিষ্কার কাপড় দিয়ে রক্তপাত বন্ধের চেষ্টা করুন।',
    firstAidMaternal: 'মাতাকে বাম কাত করে শোওয়ান। উষ্ণ রাখুন।',
    categoryPrompt: 'সমস্যার ধরন নির্বাচন করুন (ঐচ্ছিক)',
    companionPrompt: 'কতজনের সাহায্য প্রয়োজন?',
    recordVoice: 'ভয়েস নোট রেকর্ড করুন',
    recordVoiceDone: 'ভয়েস সংরক্ষিত (4s)',
    landmarkPrompt: 'নিকটবর্তী ল্যান্ডমার্ক বা রাস্তার নাম',
    simulateOffline: 'নেটওয়ার্কবিহীন মোড সিমুলেট করুন',
    simulateOnline: 'নেটওয়ার্ক পুনরায় যুক্ত করুন (স্বয়ংক্রিয় সিঙ্ক)',
    viewAudit: 'অডিট ও লেজার',
    viewDispatcher: 'ডিসপ্যাচার ড্যাশবোর্ড',
    viewCitizen: 'নাগরিক SOS অ্যাপ',
    viewTransparency: 'স্বচ্ছতা পোর্টাল',
    cardiac: 'হার্ট অ্যাটাক / বুকে ব্যথা',
    trauma: 'মারাত্মক আঘাত / রক্তক্ষরণ',
    maternal: 'প্রসব / প্রসূতি সহায়তা',
    crash: 'সড়ক দুর্ঘটনা',
    fire: 'অগ্নিকাণ্ড',
    disaster: 'বন্যা / দুর্যোগ',
    other: 'অন্যান্য চিকিৎসা জরুরি'
  }
};

// Seed initial ledger history with real SHA-256 hashes
export async function buildInitialLedgerChain(): Promise<LedgerBlock[]> {
  const genesis = await createGenesisBlock();
  let chain = [genesis];

  // Block 1: Incident RN-BLR-8921 Recommended & Dispatched
  const block1 = await appendLedgerBlock(chain, {
    incidentId: 'INC-2026-001',
    trackingCode: 'RN-BLR-8921',
    action: 'DISPATCH_APPROVED',
    actor: 'Dispatcher Badge: KA-DSP-042 (Senior Controller R. Nair)',
    details: 'Approved AI recommendation for 108 Karnataka ALS-04. Severity 94 pts, 2-signal corroboration.',
    lifeSafetyVetoEnforced: true,
    dataIntegrityPayload: 'PAYLOAD_SIGNATURE_BLR_8921_CARDIAC_ALS_APPROVED'
  });
  chain.push(block1);

  // Block 2: Incident RN-BLR-9044 Multi-Channel AI Recommendation
  const block2 = await appendLedgerBlock(chain, {
    incidentId: 'INC-2026-002',
    trackingCode: 'RN-BLR-9044',
    action: 'AI_RECOMMENDATION',
    actor: 'AI Priority Engine v2.4 (Confidence Fusion Module)',
    details: 'Multi-channel fusion (PWA + CCTV + SMS). Recommended Red Cross Rapid Bike (ETA 3m) for immediate arterial triage.',
    lifeSafetyVetoEnforced: true,
    dataIntegrityPayload: 'PAYLOAD_SIGNATURE_BLR_9044_CRASH_FUSED_RECOMMEND'
  });
  chain.push(block2);

  // Block 3: Sneakernet Burst Sync for Rural Sector H5
  const block3 = await appendLedgerBlock(chain, {
    incidentId: 'INC-2026-003',
    trackingCode: 'RN-BLR-9102',
    action: 'OFFLINE_BURST_SYNCED',
    actor: 'Transit Sneakernet Gateway Node (BMTC Bus #365)',
    details: 'Delayed-burst SOS packet ingested from Anekal rural sector. Hard Life-Safety Floor enforced (Score 82).',
    lifeSafetyVetoEnforced: true,
    dataIntegrityPayload: 'PAYLOAD_SIGNATURE_BLR_9102_MATERNAL_SNEAKERNET_INGEST'
  });
  chain.push(block3);

  return chain;
}
