/**
 * Calculate idea price based on AI scores
 * Pricing rules:
 * - If originality > 6: add $5, else use scale: 7-10 = $5, 4-6 = $3, 1-3 = $1
 * - If use case value > 6: add $5, else use scale: 7-10 = $5, 4-6 = $3, 1-3 = $1
 * - Total = originality price + use case value price
 * - Max: $10, Min: $2
 */
export function calculateIdeaPrice(
  originality: number,
  useCaseValue: number
): number {
  // Calculate originality price
  let originalityPrice: number;
  if (originality > 6) {
    originalityPrice = 5;
  } else if (originality >= 7 && originality <= 10) {
    originalityPrice = 5;
  } else if (originality >= 4 && originality <= 6) {
    originalityPrice = 3;
  } else {
    originalityPrice = 1;
  }

  // Calculate use case value price
  let useCasePrice: number;
  if (useCaseValue > 6) {
    useCasePrice = 5;
  } else if (useCaseValue >= 7 && useCaseValue <= 10) {
    useCasePrice = 5;
  } else if (useCaseValue >= 4 && useCaseValue <= 6) {
    useCasePrice = 3;
  } else {
    useCasePrice = 1;
  }

  // Total price
  let totalPrice = originalityPrice + useCasePrice;

  // Apply min/max constraints
  totalPrice = Math.max(2, Math.min(10, totalPrice));

  return totalPrice;
}

