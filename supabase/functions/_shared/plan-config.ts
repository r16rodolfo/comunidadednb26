/**
 * Centralised plan ↔ Stripe price mapping.
 * Import from "_shared/plan-config.ts" in every edge function that needs it.
 */

export interface PlanInfo {
  tier: string;
  slug: string;
}

/** slug → Stripe price ID */
export const planPriceIds: Record<string, string> = {
  'premium-monthly': 'price_1Sya3yEuyKN6OMe7YBMomGJK',
  'premium-quarterly': 'price_1Sya4zEuyKN6OMe7y5jcyG7V',
  'premium-semiannual': 'price_1Sya51EuyKN6OMe7cj3xHyCS',
  'premium-yearly': 'price_1Sya69EuyKN6OMe7XLGIXK07',
};

/** Stripe price ID → plan info (reverse map) */
export const priceIdToPlan: Record<string, PlanInfo> = {
  'price_1Sya3yEuyKN6OMe7YBMomGJK': { tier: 'Premium Mensal', slug: 'premium-monthly' },
  'price_1Sya4zEuyKN6OMe7y5jcyG7V': { tier: 'Premium Trimestral', slug: 'premium-quarterly' },
  'price_1Sya51EuyKN6OMe7cj3xHyCS': { tier: 'Premium Semestral', slug: 'premium-semiannual' },
  'price_1Sya69EuyKN6OMe7XLGIXK07': { tier: 'Premium Anual', slug: 'premium-yearly' },
};

/** Fallback: derive plan from price amount / interval when the price ID is unknown */
export function determinePlanFromPrice(
  amount: number,
  interval: string,
  intervalCount: number,
): PlanInfo {
  if (interval === 'year') return { tier: 'Premium Anual', slug: 'premium-yearly' };
  if (interval === 'month') {
    if (intervalCount === 6) return { tier: 'Premium Semestral', slug: 'premium-semiannual' };
    if (intervalCount === 3) return { tier: 'Premium Trimestral', slug: 'premium-quarterly' };
    return { tier: 'Premium Mensal', slug: 'premium-monthly' };
  }
  return { tier: 'Premium', slug: 'premium-monthly' };
}

/** Resolve plan info from a price ID, with optional Stripe fallback data */
export function resolvePlan(priceId: string): PlanInfo {
  return priceIdToPlan[priceId] || { tier: 'Premium', slug: 'premium-monthly' };
}
