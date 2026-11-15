import { BASE_MAINNET_CHAIN_ID } from '../baseDenim';

/**
 * ERC-8021: Transaction Attribution (Base Mainnet)
 */

export const BUILDER_CODE = 'baseapp';
export const APP_ID = '692279382ba3bc50c6d0cd9f';
export const ATTRIBUTION_CODE = 'slots-snowy';

export function getAttributionPayload(builderCode = BUILDER_CODE, campaignCode = '') {
  return {
    meta: {
      chainId: BASE_MAINNET_CHAIN_ID,
      builder: builderCode,
      campaign: campaignCode,
      appId: APP_ID,
    },
  };
}

export function getDataSuffix(): `0x${string}` {
  return '0x07626173656170700080218021802180218021802180218021';
}

export function buildAttributedTransaction<T extends { data?: `0x${string}`; chainId?: number }>(
  baseTx: T
): T & { data: `0x${string}`; chainId: number } {
  const suffix = getDataSuffix().slice(2);
  const existingData = baseTx.data && baseTx.data !== '0x' ? baseTx.data : '0x';
  return {
    ...baseTx,
    chainId: BASE_MAINNET_CHAIN_ID,
    data: `${existingData}${suffix}` as `0x${string}`,
  };
}
