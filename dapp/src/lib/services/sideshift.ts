/**
 * SideShift Pay API integration
 */

const SIDESHIFT_API_URL = process.env.NEXT_PUBLIC_SIDESHIFT_API_URL || 'https://sideshift.ai/api/v2';
const SIDESHIFT_SECRET = process.env.SIDESHIFT_SECRET || '';
const SIDESHIFT_ACCOUNT_ID = process.env.SIDESHIFT_ACCOUNT_ID || '';

export interface SideShiftCheckoutRequest {
  settleCoin: string;
  settleNetwork: string;
  settleAmount: string;
  settleAddress: string;
  settleMemo?: string;
  affiliateId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface SideShiftCheckoutResponse {
  id: string;
  settleCoin: string;
  settleNetwork: string;
  settleAddress: string;
  settleAmount: string;
  updatedAt: string;
  createdAt: string;
  affiliateId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface SideShiftShift {
  id: string;
  status: 'pending' | 'settled' | 'failed';
  txid?: string;
}

/**
 * Map chain names to SideShift coin and network
 */
export function getSideShiftCoinAndNetwork(chain: string): { coin: string; network: string } {
  const chainMap: Record<string, { coin: string; network: string }> = {
    ethereum: { coin: 'ETH', network: 'mainnet' },
    polygon: { coin: 'MATIC', network: 'mainnet' },
    arbitrum: { coin: 'ETH', network: 'arbitrum' },
    optimism: { coin: 'ETH', network: 'optimism' },
    sepolia: { coin: 'ETH', network: 'sepolia' },
  };

  return chainMap[chain] || { coin: 'ETH', network: 'mainnet' };
}

/**
 * Create a SideShift checkout
 */
export async function createSideShiftCheckout(
  request: SideShiftCheckoutRequest,
  userIp: string
): Promise<SideShiftCheckoutResponse> {
  const response = await fetch(`${SIDESHIFT_API_URL}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-sideshift-secret': SIDESHIFT_SECRET,
      'x-user-ip': userIp,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `SideShift API error: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get checkout status
 */
export async function getSideShiftCheckout(checkoutId: string): Promise<any> {
  const response = await fetch(`${SIDESHIFT_API_URL}/checkout/${checkoutId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'x-sideshift-secret': SIDESHIFT_SECRET,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch checkout: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get shift status
 */
export async function getSideShiftShift(shiftId: string): Promise<SideShiftShift> {
  const response = await fetch(`${SIDESHIFT_API_URL}/shifts/${shiftId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'x-sideshift-secret': SIDESHIFT_SECRET,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch shift: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Find checkout ID from shift ID by querying recent checkouts
 * Note: This is not ideal but works as a fallback
 * In production, you might want to store a mapping or use a different approach
 */
export async function findCheckoutIdFromShiftId(shiftId: string): Promise<string | null> {
  // This is a simplified approach - in production you might want to:
  // 1. Store a mapping of shiftId to checkoutId
  // 2. Query SideShift API to get checkout details from shift
  // 3. Use a different webhook structure if available
  
  // For now, we'll return null and let the webhook handler use alternative methods
  return null;
}

