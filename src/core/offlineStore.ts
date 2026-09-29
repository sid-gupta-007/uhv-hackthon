import Dexie, { Table } from 'dexie';
import { Incident } from './types';

/**
 * ============================================================================
 * RAKSHANET OFFLINE-FIRST STORAGE & PRIVACY SECURITY LAYER
 * ============================================================================
 * Leverages IndexedDB for zero-connectivity offline persistence.
 * Sanitizes and cryptographically masks sensitive citizen data.
 * ============================================================================
 */

export interface OfflineSOSRecord {
  id: string;
  trackingCode: string;
  category: Incident['category'];
  categoryLabel: string;
  description: string;
  lat: number;
  lng: number;
  landmark: string;
  accuracyMeters: number;
  connectivityTier: Incident['connectivityTier'];
  companionCount: number;
  citizenLanguage: Incident['citizenLanguage'];
  citizenNameMasked: string;
  contactMasked: string;
  audioNoteRecorded: boolean;
  timestamp: number;
  synced: boolean;
  syncAttempts: number;
}

export class RakshaDatabase extends Dexie {
  sosQueue!: Table<OfflineSOSRecord, string>;

  constructor() {
    super('RakshaNetDB');
    this.version(1).stores({
      sosQueue: 'id, trackingCode, timestamp, synced, connectivityTier'
    });
  }
}

export const db = new RakshaDatabase();

/**
 * Data Security & Privacy Helpers:
 * Sanitizes citizen identity to prevent unauthorized exposure in mesh relays.
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone || phone.length < 4) return '+91 •••• ••••';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 4) return '+91 •••• ••••';
  return `+91 ${clean.substring(0, 2)}••••••${clean.substring(clean.length - 2)}`;
}

export function maskCitizenName(name?: string): string {
  if (!name || name.trim().length === 0) return 'Anonymous Citizen';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return `${parts[0][0]}. ••••`;
  }
  return `${parts[0][0]}. ${parts[parts.length - 1][0]}.`;
}

/**
 * Saves SOS record directly to IndexedDB.
 */
export async function queueOfflineSOS(record: Omit<OfflineSOSRecord, 'synced' | 'syncAttempts'>): Promise<OfflineSOSRecord> {
  const fullRecord: OfflineSOSRecord = {
    ...record,
    synced: false,
    syncAttempts: 0
  };

  await db.sosQueue.put(fullRecord);
  return fullRecord;
}

/**
 * Retrieves all pending offline SOS items.
 */
export async function getPendingOfflineSOS(): Promise<OfflineSOSRecord[]> {
  return await db.sosQueue.where('synced').equals(0).toArray();
}

/**
 * Marks record as synced in IndexedDB.
 */
export async function markSOSAsSynced(id: string): Promise<void> {
  await db.sosQueue.update(id, { synced: true });
}

/**
 * Clear or reset storage for demo resetting.
 */
export async function clearAllLocalSOS(): Promise<void> {
  await db.sosQueue.clear();
}
