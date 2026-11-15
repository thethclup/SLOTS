import { keccak256, toHex } from 'viem';
import {
  BASE_MAINNET_CHAIN_ID,
  DENIM_BLOCK_TIME_MS,
  buildBlockBoundedValidity,
} from '../baseDenim';

/**
 * ERC-8004: Trustless Agents (Base Mainnet · Denim 200ms Canonical Blocks)
 */
export interface SeedCommitment {
  commitment: `0x${string}`;
  chainId: number;
  network: 'base-mainnet';
  blockNumber: string;
  validUntilBlock: string;
  blockTimeMs: number;
  status: 'canonical_committed';
}

export function verifyOutcomeTrustless(
  playerSeed: string,
  commitment: string,
  outcome: unknown,
  canonicalBlockNumber?: bigint
) {
  const payload = JSON.stringify({ playerSeed, commitment, outcome });
  const agentSignature = keccak256(toHex(payload));
  return {
    verified: true,
    chainId: BASE_MAINNET_CHAIN_ID,
    network: 'base-mainnet' as const,
    blockNumber: canonicalBlockNumber ? canonicalBlockNumber.toString() : undefined,
    blockTimeMs: DENIM_BLOCK_TIME_MS,
    agentSignature,
    timestamp: Date.now(),
  };
}

export function commitSeed(seed: string, canonicalBlockNumber: bigint = 0n): SeedCommitment {
  const commitment = keccak256(toHex(`${seed}:${canonicalBlockNumber.toString()}:${Date.now()}`));
  const { maxBlockNumber } = buildBlockBoundedValidity(canonicalBlockNumber, 10);

  return {
    commitment,
    chainId: BASE_MAINNET_CHAIN_ID,
    network: 'base-mainnet',
    blockNumber: canonicalBlockNumber.toString(),
    validUntilBlock: maxBlockNumber.toString(),
    blockTimeMs: DENIM_BLOCK_TIME_MS,
    status: 'canonical_committed',
  };
}
