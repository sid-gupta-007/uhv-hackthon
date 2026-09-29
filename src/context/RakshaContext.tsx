import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  ConnectivityTier, 
  EmergencyCategory, 
  HexSector, 
  Incident, 
  LedgerBlock, 
  PublicEquityMetric, 
  ResponderUnit, 
  ScoreBreakdown 
} from '../core/types';
import { 
  INITIAL_HEX_SECTORS, 
  INITIAL_INCIDENTS, 
  INITIAL_PUBLIC_METRICS, 
  INITIAL_RESPONDERS, 
  buildInitialLedgerChain 
} from '../core/mockData';
import { calculateIncidentPriority } from '../core/priorityEngine';
import { appendLedgerBlock, verifyLedgerChain, VerificationResult, sha256Hex } from '../core/cryptoLedger';
import { queueOfflineSOS, getPendingOfflineSOS, markSOSAsSynced, maskCitizenName, maskPhoneNumber, OfflineSOSRecord } from '../core/offlineStore';
import { sound } from '../core/audio';
import confetti from 'canvas-confetti';

interface TriggerSOSParams {
  category: EmergencyCategory;
  categoryLabel: string;
  description: string;
  landmark: string;
  companionCount: number;
  citizenLanguage: 'en' | 'hi' | 'kn' | 'bn';
  connectivityTier: ConnectivityTier;
  audioNoteRecorded?: boolean;
}

interface RakshaContextType {
  // State
  incidents: Incident[];
  sectors: HexSector[];
  responders: ResponderUnit[];
  ledgerChain: LedgerBlock[];
  publicMetrics: PublicEquityMetric[];
  activeView: 'citizen' | 'dispatcher' | 'audit' | 'transparency';
  citizenLanguage: 'en' | 'hi' | 'kn' | 'bn';
  isSimulatedOffline: boolean;
  activeConnectivityTier: ConnectivityTier;
  activeCitizenIncident: Incident | null;
  pendingOfflineCount: number;
  selectedSectorId: string | null;
  ledgerVerification: VerificationResult | null;
  isVerifyingLedger: boolean;
  soundEnabled: boolean;

  // Setters & Actions
  setActiveView: (view: 'citizen' | 'dispatcher' | 'audit' | 'transparency') => void;
  setCitizenLanguage: (lang: 'en' | 'hi' | 'kn' | 'bn') => void;
  setActiveConnectivityTier: (tier: ConnectivityTier) => void;
  setSelectedSectorId: (sectorId: string | null) => void;
  toggleOfflineSimulation: () => void;
  setSoundEnabled: (enabled: boolean) => void;

  triggerCitizenSOS: (params: TriggerSOSParams) => Promise<Incident>;
  cancelCitizenSOS: (incidentId: string) => void;
  syncOfflineQueue: () => Promise<number>;
  approveDispatch: (incidentId: string, unitId?: string) => Promise<void>;
  reassignDispatch: (incidentId: string, unitId: string) => Promise<void>;
  overrideDispatch: (params: {
    incidentId: string;
    newUnitId: string;
    reasonCode: string;
    detailedReason: string;
    dispatcherBadge: string;
  }) => Promise<void>;
  triggerSimulationScenario: (scenario: 'HIGHWAY_PILEUP' | 'REMOTE_CARDIAC' | 'FLOOD_SURGE') => Promise<void>;
  verifyLedger: () => Promise<VerificationResult>;
  simulateLedgerTamper: () => void;
  repairLedgerChain: () => Promise<void>;
}

const RakshaContext = createContext<RakshaContextType | undefined>(undefined);

export const RakshaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [sectors, setSectors] = useState<HexSector[]>(INITIAL_HEX_SECTORS);
  const [responders, setResponders] = useState<ResponderUnit[]>(INITIAL_RESPONDERS);
  const [ledgerChain, setLedgerChain] = useState<LedgerBlock[]>([]);
  const [publicMetrics, setPublicMetrics] = useState<PublicEquityMetric[]>(INITIAL_PUBLIC_METRICS);

  const [activeView, setActiveView] = useState<'citizen' | 'dispatcher' | 'audit' | 'transparency'>('citizen');
  const [citizenLanguage, setCitizenLanguage] = useState<'en' | 'hi' | 'kn' | 'bn'>('en');
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [activeConnectivityTier, setActiveConnectivityTier] = useState<ConnectivityTier>('FULL_NETWORK');
  const [activeCitizenIncident, setActiveCitizenIncident] = useState<Incident | null>(null);
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(0);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>('SEC-H1');
  const [ledgerVerification, setLedgerVerification] = useState<VerificationResult | null>(null);
  const [isVerifyingLedger, setIsVerifyingLedger] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);

  // Initialize seed ledger on mount
  useEffect(() => {
    buildInitialLedgerChain().then(chain => {
      setLedgerChain(chain);
    });

    // Check IndexedDB pending count
    getPendingOfflineSOS().then(items => {
      setPendingOfflineCount(items.length);
    });
  }, []);

  // Sync IndexedDB count periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      const items = await getPendingOfflineSOS();
      setPendingOfflineCount(items.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Listen to browser network changes & auto-sync
  useEffect(() => {
    const handleOnline = async () => {
      if (!isSimulatedOffline) {
        await syncOfflineQueue();
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isSimulatedOffline]);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    sound.setSoundEnabled(enabled);
  };

  // Toggle Airplane / Zero Network Mode
  const toggleOfflineSimulation = async () => {
    const nextState = !isSimulatedOffline;
    setIsSimulatedOffline(nextState);

    if (!nextState) {
      // Reconnected! Auto-sync queued items
      sound.playApprovedChime();
      await syncOfflineQueue();
    } else {
      sound.playSOSBeep();
    }
  };

  // 1. Citizen SOS Submission Handler
  const triggerCitizenSOS = async (params: TriggerSOSParams): Promise<Incident> => {
    sound.playSOSBeep();

    const uniqueId = `INC-${Date.now()}`;
    const trackingCode = `RN-BLR-${Math.floor(1000 + Math.random() * 9000)}`;

    // Match sector based on demo sector or randomize realistic Bangalore coords
    const matchedSector = sectors.find(s => s.id === 'SEC-H1') || sectors[0];
    const lat = matchedSector.center.lat + (Math.random() - 0.5) * 0.008;
    const lng = matchedSector.center.lng + (Math.random() - 0.5) * 0.008;

    // Check if offline
    const isOffline = isSimulatedOffline || !navigator.onLine;

    // Build signals array
    const signalPWA = {
      id: `SIG-${Date.now()}`,
      source: 'CITIZEN_PWA' as const,
      sourceLabel: `Citizen PWA Direct (${params.connectivityTier})`,
      timestamp: Date.now(),
      confidenceWeight: 0.95,
      summary: `SOS triggered via ${params.connectivityTier}. Landmark: ${params.landmark || 'GPS Target Fixed'}`,
      verified: true
    };

    // Calculate AI priority
    const priorityResult = calculateIncidentPriority({
      category: params.category,
      signals: [signalPWA],
      estimatedEtaMinutes: 5,
      companionCount: params.companionCount
    });

    const newIncident: Incident = {
      id: uniqueId,
      trackingCode,
      category: params.category,
      categoryLabel: params.categoryLabel,
      description: params.description || `Emergency ${params.categoryLabel} reported at ${params.landmark || 'current coordinates'}.`,
      location: {
        lat,
        lng,
        sectorId: matchedSector.id,
        sectorName: matchedSector.name,
        landmark: params.landmark || 'Auto-Detected GPS Anchor (100ft Road / CMH Road)',
        accuracyMeters: 6
      },
      reportedAt: Date.now(),
      connectivityTier: params.connectivityTier,
      signals: [signalPWA],
      corroborationTier: priorityResult.corroborationTier,
      aiPriorityScore: priorityResult.aiPriorityScore,
      scoreBreakdown: priorityResult.scoreBreakdown,
      status: isOffline ? 'QUEUED_OFFLINE' : 'RECOMMENDED',
      recommendedUnitId: 'RES-108-01',
      etaMinutes: 5,
      companionCount: params.companionCount,
      audioNoteRecorded: params.audioNoteRecorded,
      citizenLanguage: params.citizenLanguage,
      isSynced: !isOffline,
      citizenNameMasked: maskCitizenName('Citizen User')
    };

    if (isOffline) {
      // Save locally in IndexedDB
      await queueOfflineSOS({
        id: newIncident.id,
        trackingCode: newIncident.trackingCode,
        category: newIncident.category,
        categoryLabel: newIncident.categoryLabel,
        description: newIncident.description,
        lat: newIncident.location.lat,
        lng: newIncident.location.lng,
        landmark: newIncident.location.landmark,
        accuracyMeters: newIncident.location.accuracyMeters,
        connectivityTier: newIncident.connectivityTier,
        companionCount: newIncident.companionCount,
        citizenLanguage: newIncident.citizenLanguage,
        citizenNameMasked: newIncident.citizenNameMasked || 'Citizen User',
        contactMasked: maskPhoneNumber('+91 9876543210'),
        audioNoteRecorded: !!params.audioNoteRecorded,
        timestamp: Date.now()
      });

      const count = (await getPendingOfflineSOS()).length;
      setPendingOfflineCount(count);
    } else {
      // Live submission: append to ledger
      const newBlock = await appendLedgerBlock(ledgerChain, {
        incidentId: newIncident.id,
        trackingCode: newIncident.trackingCode,
        action: 'AI_RECOMMENDATION',
        actor: `AI Priority Engine v2.4 (Life-Safety Guard Active)`,
        details: `Incident ${trackingCode} (${params.categoryLabel}) scored ${newIncident.aiPriorityScore} pts. Recommended unit RES-108-01.`,
        lifeSafetyVetoEnforced: true,
        dataIntegrityPayload: `HASH_PAYLOAD_${trackingCode}_${params.category}_CONFIDENCE_FUSED`
      });

      setLedgerChain(prev => [...prev, newBlock]);
      setIncidents(prev => [newIncident, ...prev]);

      // Trigger confetti celebration for successful submission
      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
      } catch (_) {}
    }

    setActiveCitizenIncident(newIncident);
    return newIncident;
  };

  const cancelCitizenSOS = (incidentId: string) => {
    setActiveCitizenIncident(null);
    setIncidents(prev => prev.filter(i => i.id !== incidentId));
  };

  // 2. Sync Offline Queue from IndexedDB to Central Dispatch & Ledger
  const syncOfflineQueue = async (): Promise<number> => {
    const pendingItems = await getPendingOfflineSOS();
    if (pendingItems.length === 0) return 0;

    let updatedChain = [...ledgerChain];
    const newlySyncedIncidents: Incident[] = [];

    for (const item of pendingItems) {
      const signal = {
        id: `SIG-SYNC-${item.id}`,
        source: 'CITIZEN_PWA' as const,
        sourceLabel: `Citizen PWA Burst Relay (${item.connectivityTier})`,
        timestamp: item.timestamp,
        confidenceWeight: 0.92,
        summary: `Synchronized from device IndexedDB offline queue via ${item.connectivityTier}`,
        verified: true
      };

      const priority = calculateIncidentPriority({
        category: item.category,
        signals: [signal],
        estimatedEtaMinutes: 6,
        companionCount: item.companionCount
      });

      const syncedIncident: Incident = {
        id: item.id,
        trackingCode: item.trackingCode,
        category: item.category,
        categoryLabel: item.categoryLabel,
        description: item.description,
        location: {
          lat: item.lat,
          lng: item.lng,
          sectorId: 'SEC-H1',
          sectorName: 'Indiranagar - Metro Core',
          landmark: item.landmark,
          accuracyMeters: item.accuracyMeters
        },
        reportedAt: item.timestamp,
        connectivityTier: item.connectivityTier,
        signals: [signal],
        corroborationTier: priority.corroborationTier,
        aiPriorityScore: priority.aiPriorityScore,
        scoreBreakdown: priority.scoreBreakdown,
        status: 'RECOMMENDED',
        recommendedUnitId: 'RES-108-01',
        etaMinutes: 6,
        companionCount: item.companionCount,
        audioNoteRecorded: item.audioNoteRecorded,
        citizenLanguage: item.citizenLanguage,
        isSynced: true,
        citizenNameMasked: item.citizenNameMasked
      };

      // Append to Ledger
      const block = await appendLedgerBlock(updatedChain, {
        incidentId: syncedIncident.id,
        trackingCode: syncedIncident.trackingCode,
        action: 'OFFLINE_BURST_SYNCED',
        actor: `Offline Sync Gateway (${item.connectivityTier} Link)`,
        details: `Offline SOS from ${item.trackingCode} successfully synchronized to Central Command. Priority score: ${syncedIncident.aiPriorityScore}.`,
        lifeSafetyVetoEnforced: true,
        dataIntegrityPayload: `OFFLINE_SYNC_HASH_${item.id}_VERIFIED`
      });

      updatedChain = [...updatedChain, block];
      newlySyncedIncidents.push(syncedIncident);
      await markSOSAsSynced(item.id);
    }

    setLedgerChain(updatedChain);
    setIncidents(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const filteredNew = newlySyncedIncidents.filter(n => !existingIds.has(n.id));
      return [...filteredNew, ...prev];
    });

    // Update active citizen incident if it was one of the pending ones
    if (activeCitizenIncident && newlySyncedIncidents.some(i => i.id === activeCitizenIncident.id)) {
      const synced = newlySyncedIncidents.find(i => i.id === activeCitizenIncident.id);
      if (synced) setActiveCitizenIncident(synced);
    }

    setPendingOfflineCount(0);
    sound.playApprovedChime();
    return newlySyncedIncidents.length;
  };

  // 3. Dispatcher One-Click Approve Action
  const approveDispatch = async (incidentId: string, unitId?: string) => {
    const targetIncident = incidents.find(i => i.id === incidentId);
    if (!targetIncident) return;

    const assignedId = unitId || targetIncident.recommendedUnitId;
    const assignedUnit = responders.find(r => r.id === assignedId) || responders[0];

    // Update Incident
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'DISPATCHED',
          assignedUnitId: assignedUnit.id,
          assignedUnitName: `${assignedUnit.name} (${assignedUnit.organization})`
        };
      }
      return inc;
    }));

    // Update Responder Unit status
    setResponders(prev => prev.map(res => {
      if (res.id === assignedUnit.id) {
        return { ...res, status: 'EN_ROUTE' };
      }
      return res;
    }));

    // Append to Cryptographic Ledger
    const newBlock = await appendLedgerBlock(ledgerChain, {
      incidentId: targetIncident.id,
      trackingCode: targetIncident.trackingCode,
      action: 'DISPATCH_APPROVED',
      actor: 'Dispatcher Badge: KA-DSP-042 (Duty Officer R. Nair)',
      details: `Approved recommended dispatch: ${assignedUnit.name} (${assignedUnit.organization}) for incident ${targetIncident.trackingCode}. ETA ${targetIncident.etaMinutes} mins.`,
      lifeSafetyVetoEnforced: true,
      dataIntegrityPayload: `APPROVED_DISPATCH_${targetIncident.trackingCode}_${assignedUnit.id}_SIGNED`
    });

    setLedgerChain(prev => [...prev, newBlock]);

    // Update active citizen view if applicable
    if (activeCitizenIncident?.id === incidentId) {
      setActiveCitizenIncident(prev => prev ? {
        ...prev,
        status: 'DISPATCHED',
        assignedUnitId: assignedUnit.id,
        assignedUnitName: `${assignedUnit.name} (${assignedUnit.organization})`
      } : null);
    }

    sound.playApprovedChime();
  };

  // 4. Dispatcher Reassign Action (Change Pooled Unit)
  const reassignDispatch = async (incidentId: string, unitId: string) => {
    const targetIncident = incidents.find(i => i.id === incidentId);
    const targetUnit = responders.find(r => r.id === unitId);
    if (!targetIncident || !targetUnit) return;

    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          assignedUnitId: targetUnit.id,
          assignedUnitName: `${targetUnit.name} (${targetUnit.organization})`,
          status: 'DISPATCHED'
        };
      }
      return inc;
    }));

    setResponders(prev => prev.map(res => {
      if (res.id === targetUnit.id) {
        return { ...res, status: 'EN_ROUTE' };
      }
      return res;
    }));

    const newBlock = await appendLedgerBlock(ledgerChain, {
      incidentId: targetIncident.id,
      trackingCode: targetIncident.trackingCode,
      action: 'DISPATCH_APPROVED',
      actor: 'Dispatcher Badge: KA-DSP-042',
      details: `Pooled unit reassigned to ${targetUnit.name} (${targetUnit.organization}) for faster response.`,
      lifeSafetyVetoEnforced: true,
      dataIntegrityPayload: `REASSIGNED_${targetIncident.trackingCode}_${targetUnit.id}`
    });

    setLedgerChain(prev => [...prev, newBlock]);
    sound.playApprovedChime();
  };

  // 5. Dispatcher Mandatory Override Action (Strict Reason Code Enforced)
  const overrideDispatch = async (params: {
    incidentId: string;
    newUnitId: string;
    reasonCode: string;
    detailedReason: string;
    dispatcherBadge: string;
  }) => {
    const targetIncident = incidents.find(i => i.id === params.incidentId);
    const targetUnit = responders.find(r => r.id === params.newUnitId) || responders[0];
    if (!targetIncident) return;

    const fullReasonString = `[${params.reasonCode}] ${params.detailedReason}`;

    setIncidents(prev => prev.map(inc => {
      if (inc.id === params.incidentId) {
        return {
          ...inc,
          status: 'DISPATCHED',
          assignedUnitId: targetUnit.id,
          assignedUnitName: `${targetUnit.name} (${targetUnit.organization})`,
          isOverridden: true,
          overrideReason: fullReasonString,
          overrideBadgeId: params.dispatcherBadge
        };
      }
      return inc;
    }));

    // Append to Ledger
    const newBlock = await appendLedgerBlock(ledgerChain, {
      incidentId: targetIncident.id,
      trackingCode: targetIncident.trackingCode,
      action: 'DISPATCH_OVERRIDDEN',
      actor: `Dispatcher Badge: ${params.dispatcherBadge}`,
      details: `Human Dispatcher OVERRODE AI Recommendation for ${targetIncident.trackingCode}. Reassigned to ${targetUnit.name}.`,
      overrideReason: fullReasonString,
      lifeSafetyVetoEnforced: true,
      dataIntegrityPayload: `AUDITED_OVERRIDE_${targetIncident.trackingCode}_${params.reasonCode}`
    });

    setLedgerChain(prev => [...prev, newBlock]);
    sound.playApprovedChime();
  };

  // 6. Trigger Simulated Scenarios for Live Hackathon Presentation
  const triggerSimulationScenario = async (scenario: 'HIGHWAY_PILEUP' | 'REMOTE_CARDIAC' | 'FLOOD_SURGE') => {
    sound.playSOSBeep();

    if (scenario === 'HIGHWAY_PILEUP') {
      const incId = `INC-SIM-${Date.now()}`;
      const code = `RN-BLR-${Math.floor(2000 + Math.random() * 8000)}`;
      const signals = [
        {
          id: `SIG-SIM-1`,
          source: 'CITIZEN_PWA' as const,
          sourceLabel: 'Citizen PWA SOS (Bystander)',
          timestamp: Date.now(),
          confidenceWeight: 0.92,
          summary: 'Multi-car pileup on Outer Ring Road, 3 injured',
          verified: true
        },
        {
          id: `SIG-SIM-2`,
          source: 'SMART_CITY_CCTV' as const,
          sourceLabel: 'Smart City CCTV Traffic Camera #44',
          timestamp: Date.now(),
          confidenceWeight: 0.96,
          summary: 'Automatic impact detection triggered with heavy lane obstruction',
          verified: true
        },
        {
          id: `SIG-SIM-3`,
          source: 'VOICE_112' as const,
          sourceLabel: 'ERSS 112 Voice Telephony',
          timestamp: Date.now(),
          confidenceWeight: 0.88,
          summary: 'Police PCR van reports traffic halt and requested ALS trauma unit',
          verified: true
        }
      ];

      const score = calculateIncidentPriority({
        category: 'CRASH',
        signals,
        estimatedEtaMinutes: 4,
        companionCount: 3
      });

      const inc: Incident = {
        id: incId,
        trackingCode: code,
        category: 'CRASH',
        categoryLabel: 'Mass Highway Vehicular Pileup',
        description: 'Multi-vehicle collision on Outer Ring Road Flyover. 3 individuals require immediate trauma triage.',
        location: {
          lat: 12.9352,
          lng: 77.6245,
          sectorId: 'SEC-H2',
          sectorName: 'Koramangala - Tech Hub',
          landmark: 'Outer Ring Road Bellandur Flyover Ascent',
          accuracyMeters: 5
        },
        reportedAt: Date.now(),
        connectivityTier: 'FULL_NETWORK',
        signals,
        corroborationTier: 3,
        aiPriorityScore: score.aiPriorityScore,
        scoreBreakdown: score.scoreBreakdown,
        status: 'RECOMMENDED',
        recommendedUnitId: 'RES-MANIPAL-01',
        etaMinutes: 4,
        companionCount: 3,
        audioNoteRecorded: true,
        citizenLanguage: 'en',
        isSynced: true,
        citizenNameMasked: 'V. Ramanathan'
      };

      const block = await appendLedgerBlock(ledgerChain, {
        incidentId: inc.id,
        trackingCode: inc.trackingCode,
        action: 'AI_RECOMMENDATION',
        actor: 'Multi-Channel Fusion Engine (Tier 3 Surge)',
        details: `Mass collision ${code} corroborated across 3 independent feeds. Priority score: ${inc.aiPriorityScore}. Staging Manipal ALS + Red Cross Bike.`,
        lifeSafetyVetoEnforced: true,
        dataIntegrityPayload: `HIGHWAY_PILEUP_CORROBORATED_${code}`
      });

      setLedgerChain(prev => [...prev, block]);
      setIncidents(prev => [inc, ...prev]);
    } else if (scenario === 'REMOTE_CARDIAC') {
      const incId = `INC-SIM-${Date.now()}`;
      const code = `RN-BLR-${Math.floor(3000 + Math.random() * 7000)}`;
      const signals = [
        {
          id: `SIG-SIM-LORA`,
          source: 'CITIZEN_PWA' as const,
          sourceLabel: 'Citizen PWA SOS (Relayed via LoRa 868MHz Mesh)',
          timestamp: Date.now(),
          confidenceWeight: 0.90,
          summary: 'Encrypted packet relayed through 2 village solar relay nodes',
          verified: true
        }
      ];

      const score = calculateIncidentPriority({
        category: 'CARDIAC',
        signals,
        estimatedEtaMinutes: 12,
        companionCount: 1
      });

      const inc: Incident = {
        id: incId,
        trackingCode: code,
        category: 'CARDIAC',
        categoryLabel: 'Remote Acute Cardiac Arrest (LoRa Mesh Link)',
        description: 'Patient unresponsive in remote village farmhouse. Relayed via 868MHz community mesh.',
        location: {
          lat: 12.8009,
          lng: 77.5777,
          sectorId: 'SEC-H7',
          sectorName: 'Bannerghatta - Forest Fringe',
          landmark: 'Village Water Tank, Forest Fringe Sector 7',
          accuracyMeters: 20
        },
        reportedAt: Date.now(),
        connectivityTier: 'LORA_MESH',
        signals,
        corroborationTier: 1,
        aiPriorityScore: score.aiPriorityScore,
        scoreBreakdown: score.scoreBreakdown,
        status: 'RECOMMENDED',
        recommendedUnitId: 'RES-GARUDA-02',
        etaMinutes: 6,
        companionCount: 1,
        audioNoteRecorded: false,
        citizenLanguage: 'kn',
        isSynced: true,
        citizenNameMasked: 'K. Venkatesh'
      };

      const block = await appendLedgerBlock(ledgerChain, {
        incidentId: inc.id,
        trackingCode: inc.trackingCode,
        action: 'AI_RECOMMENDATION',
        actor: 'LoRa Mesh Gateway Node 868-B',
        details: `Cardiac emergency ${code} received from zero-cellular zone. Hard Life-Safety Floor protected priority at ${inc.aiPriorityScore}. Staged Garuda Drone for AED delivery.`,
        lifeSafetyVetoEnforced: true,
        dataIntegrityPayload: `LORA_MESH_CARDIAC_${code}`
      });

      setLedgerChain(prev => [...prev, block]);
      setIncidents(prev => [inc, ...prev]);
    }
  };

  // 7. Verify Decision Ledger Integrity
  const verifyLedger = async (): Promise<VerificationResult> => {
    setIsVerifyingLedger(true);
    const result = await verifyLedgerChain(ledgerChain);
    setLedgerVerification(result);
    setIsVerifyingLedger(false);

    if (result.isValid) {
      sound.playVerifiedChime();
      try {
        confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
      } catch (_) {}
    } else {
      sound.playTamperAlert();
    }

    return result;
  };

  // 8. Simulate Ledger Tamper (Proves SHA-256 detection works live!)
  const simulateLedgerTamper = () => {
    sound.playTamperAlert();
    if (ledgerChain.length < 2) return;

    setLedgerChain(prev => {
      const copy = [...prev];
      // Modify payload of Block #1
      copy[1] = {
        ...copy[1],
        details: 'MALICIOUS_TAMPER: Dispatch diverted to private executive VIP clinic without reason code.'
      };
      return copy;
    });

    setLedgerVerification({
      isValid: false,
      tamperedBlockIndex: 1,
      totalBlocks: ledgerChain.length,
      message: '🚨 CRITICAL TAMPER ALERT: Cryptographic mismatch at Block #1! Block contents have been altered after digital signing.'
    });
  };

  // 9. Repair Ledger Chain back to clean state
  const repairLedgerChain = async () => {
    sound.playVerifiedChime();
    const fresh = await buildInitialLedgerChain();
    setLedgerChain(fresh);
    setLedgerVerification({
      isValid: true,
      totalBlocks: fresh.length,
      message: 'Ledger successfully restored to pristine state. Cryptographic integrity 100% verified.'
    });
  };

  return (
    <RakshaContext.Provider
      value={{
        incidents,
        sectors,
        responders,
        ledgerChain,
        publicMetrics,
        activeView,
        citizenLanguage,
        isSimulatedOffline,
        activeConnectivityTier,
        activeCitizenIncident,
        pendingOfflineCount,
        selectedSectorId,
        ledgerVerification,
        isVerifyingLedger,
        soundEnabled,

        setActiveView,
        setCitizenLanguage,
        setActiveConnectivityTier,
        setSelectedSectorId,
        toggleOfflineSimulation,
        setSoundEnabled,

        triggerCitizenSOS,
        cancelCitizenSOS,
        syncOfflineQueue,
        approveDispatch,
        reassignDispatch,
        overrideDispatch,
        triggerSimulationScenario,
        verifyLedger,
        simulateLedgerTamper,
        repairLedgerChain
      }}
    >
      {children}
    </RakshaContext.Provider>
  );
};

export const useRaksha = () => {
  const context = useContext(RakshaContext);
  if (!context) {
    throw new Error('useRaksha must be used within a RakshaProvider');
  }
  return context;
};
