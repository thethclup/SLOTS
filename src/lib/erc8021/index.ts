/**
 * ERC-8021: Transaction Attribution
 */

export const BUILDER_CODE = 'bc_q380nd83';
export const APP_ID = '692279382ba3bc50c6d0cd9f';

export function getAttributionPayload(builderCode = BUILDER_CODE, campaignCode = '') {
  return {
    meta: {
      builder: builderCode,
      campaign: campaignCode,
      appId: APP_ID
    }
  };
}

export function buildAttributedTransaction(baseTx: any, attributionCode: string = '') {
  const payload = getAttributionPayload(BUILDER_CODE, attributionCode);
  return {
    ...baseTx,
    // simulated attribution appending
  };
}
