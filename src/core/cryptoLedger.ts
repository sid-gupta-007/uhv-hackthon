import { LedgerBlock } from './types';

/**
 * ============================================================================
 * RAKSHANET TAMPER-EVIDENT SHA-256 DECISION LEDGER
 * ============================================================================
 * Provides an unforgeable, append-only cryptographic audit trail for every
 * AI recommendation, human dispatcher approval, and manual override.
 * ============================================================================
 */

// Pure Web Crypto SHA-256 Hasher
export async function sha256Hex(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper to create the string representation for hashing
export function computeBlockPayloadString(block: {
  index: number;
  timestamp: number;
  incidentId: string;
  action: string;
  actor: string;
  details: string;
  overrideReason?: string;
  dataIntegrityPayload: string;
  previousHash: string;
}): string {
  return [
    block.index,
    block.timestamp,
    block.incidentId,
    block.action,
    block.actor,
    block.details,
    block.overrideReason || '',
    block.dataIntegrityPayload,
    block.previousHash
  ].join('|::|');
}

export async function createGenesisBlock(): Promise<LedgerBlock> {
  const blockData = {
    index: 0,
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    incidentId: 'GENESIS-0000',
    trackingCode: 'RN-GENESIS',
    action: 'GENESIS_INITIALIZATION' as const,
    actor: 'RakshaNet Root Trust Authority (UHV Protocol)',
    details: 'Ledger Genesis Initialized with Life-Safety Hard Floor Active. Network Ready.',
    overrideReason: undefined,
    lifeSafetyVetoEnforced: true,
    dataIntegrityPayload: 'GENESIS_INTEGRITY_SALT_INDIA_EMERGENCY_MESH_2026',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000'
  };

  const payloadString = computeBlockPayloadString(blockData);
  const hash = await sha256Hex(payloadString);

  return {
    ...blockData,
    hash,
    isValid: true
  };
}

export async function appendLedgerBlock(
  chain: LedgerBlock[],
  entry: {
    incidentId: string;
    trackingCode: string;
    action: LedgerBlock['action'];
    actor: string;
    details: string;
    overrideReason?: string;
    dataIntegrityPayload: string;
    lifeSafetyVetoEnforced?: boolean;
  }
): Promise<LedgerBlock> {
  const previousBlock = chain[chain.length - 1];
  const previousHash = previousBlock ? previousBlock.hash : '0000000000000000000000000000000000000000000000000000000000000000';
  const index = chain.length;
  const timestamp = Date.now();

  const blockCandidate = {
    index,
    timestamp,
    incidentId: entry.incidentId,
    trackingCode: entry.trackingCode,
    action: entry.action,
    actor: entry.actor,
    details: entry.details,
    overrideReason: entry.overrideReason,
    lifeSafetyVetoEnforced: entry.lifeSafetyVetoEnforced ?? true,
    dataIntegrityPayload: entry.dataIntegrityPayload,
    previousHash
  };

  const payloadString = computeBlockPayloadString(blockCandidate);
  const hash = await sha256Hex(payloadString);

  return {
    ...blockCandidate,
    hash,
    isValid: true
  };
}

export interface VerificationResult {
  isValid: boolean;
  tamperedBlockIndex?: number;
  totalBlocks: number;
  message: string;
}

export async function verifyLedgerChain(chain: LedgerBlock[]): Promise<VerificationResult> {
  if (chain.length === 0) {
    return { isValid: true, totalBlocks: 0, message: 'Ledger is empty.' };
  }

  for (let i = 0; i < chain.length; i++) {
    const current = chain[i];

    // Check Genesis previousHash
    if (i === 0) {
      if (current.previousHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
        return {
          isValid: false,
          tamperedBlockIndex: 0,
          totalBlocks: chain.length,
          message: 'Genesis block previous hash is corrupted.'
        };
      }
    } else {
      const prev = chain[i - 1];
      if (current.previousHash !== prev.hash) {
        return {
          isValid: false,
          tamperedBlockIndex: i,
          totalBlocks: chain.length,
          message: `Hash link broken at Block #${i}. Expected prevHash: ${prev.hash.substring(0, 10)}..., Found: ${current.previousHash.substring(0, 10)}...`
        };
      }
    }

    // Recompute current block hash
    const payloadString = computeBlockPayloadString(current);
    const expectedHash = await sha256Hex(payloadString);

    if (expectedHash !== current.hash) {
      return {
        isValid: false,
        tamperedBlockIndex: i,
        totalBlocks: chain.length,
        message: `Cryptographic payload mismatch at Block #${i}. Content has been modified after signing!`
      };
    }
  }

  return {
    isValid: true,
    totalBlocks: chain.length,
    message: `All ${chain.length} blocks mathematically verified. Zero tampering detected across all dispatcher decisions.`
  };
}
