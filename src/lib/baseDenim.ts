import type { PublicClient, Hash, TransactionReceipt } from 'viem';
import { base } from 'viem/chains';

/**
 * Base Mainnet Denim Configuration (200ms Canonical Blocks)
 *
 * Flashblocks were retired when Denim activated on Base Mainnet (Nov 5, 2026 18:00 UTC).
 * All reads, subscriptions, and receipt checks target canonical 200ms blocks via standard
 * JSON-RPC (`latest` block tag, `newHeads`, `logs`, `eth_getTransactionReceipt`).
 */
export const BASE_MAINNET_CHAIN = base;
export const BASE_MAINNET_CHAIN_ID = base.id; // 8453
export const DENIM_BLOCK_TIME_MS = 200;
export const DEFAULT_BASE_MAINNET_RPC = 'https://mainnet.base.org';
export const BASESCAN_MAINNET_URL = 'https://basescan.org';

/**
 * Maximum BLOCKHASH opcode lookback is 256 blocks (~51.2s at 200ms/block)
 * and EIP-2935 history contract stores 8,191 blocks (~27.3m at 200ms/block).
 */
export const DENIM_BLOCKHASH_WINDOW_BLOCKS = 256;
export const DENIM_EIP2935_WINDOW_BLOCKS = 8191;

export function getBaseMainnetTxUrl(hash: Hash | string): string {
  return `${BASESCAN_MAINNET_URL}/tx/${hash}`;
}

export function getBaseMainnetBlockUrl(blockNumber: bigint | number): string {
  return `${BASESCAN_MAINNET_URL}/block/${blockNumber.toString()}`;
}

/**
 * Reads the latest canonical block number on Base Mainnet.
 * Uses canonical 'latest' state (never 'pending' or Flashblocks preconfirmations).
 */
export async function getCanonicalBlockNumber(client: PublicClient): Promise<bigint> {
  return client.getBlockNumber();
}

/**
 * Waits for a transaction to be included in a canonical 200ms Base Mainnet block
 * by polling eth_getTransactionReceipt at Denim's 200ms block cadence.
 */
export async function waitForCanonicalReceipt(
  client: PublicClient,
  hash: Hash
): Promise<TransactionReceipt> {
  return client.waitForTransactionReceipt({
    hash,
    pollingInterval: DENIM_BLOCK_TIME_MS,
    confirmations: 1,
  });
}

/**
 * Builds a post-Denim block-bounded validity constraint using block_number only
 * (flashblock_index predicates are rejected on Base Mainnet after Denim).
 */
export function buildBlockBoundedValidity(
  currentBlock: bigint,
  ttlSeconds = 10
): { minBlockNumber: bigint; maxBlockNumber: bigint } {
  const blocksAhead = BigInt(Math.max(1, Math.ceil((ttlSeconds * 1000) / DENIM_BLOCK_TIME_MS)));
  return {
    minBlockNumber: currentBlock,
    maxBlockNumber: currentBlock + blocksAhead,
  };
}
