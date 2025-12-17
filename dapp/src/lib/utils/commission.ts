/**
 * Commission calculation utilities
 * Platform commission: 7%
 * Seller receives: 93%
 */

const PLATFORM_COMMISSION_RATE = 0.07; // 7%

/**
 * Calculate commission and seller amount from total price
 * @param totalPrice - The total price of the idea
 * @returns Object with commission and sellerAmount
 */
export function calculateCommission(totalPrice: number): {
  commission: number;
  sellerAmount: number;
} {
  const commission = totalPrice * PLATFORM_COMMISSION_RATE;
  const sellerAmount = totalPrice - commission;
  
  return {
    commission: Math.round(commission * 100) / 100, // Round to 2 decimal places
    sellerAmount: Math.round(sellerAmount * 100) / 100,
  };
}

/**
 * Get the platform commission rate
 */
export function getCommissionRate(): number {
  return PLATFORM_COMMISSION_RATE;
}

