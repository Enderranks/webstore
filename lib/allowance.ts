export type AllowanceCheck = {
  allowed: boolean;
  remainingCents: number;
  cartTotalCents: number;
  reason?: string;
};

export function checkAllowance(remainingCents: number, cartTotalCents: number): AllowanceCheck {
  const remaining = Math.max(0, Math.round(remainingCents));
  const total = Math.max(0, Math.round(cartTotalCents));
  if (total > remaining) {
    return {
      allowed: false,
      remainingCents: remaining,
      cartTotalCents: total,
      reason: `Your cart is $${((total - remaining) / 100).toFixed(2)} over your remaining allowance.`,
    };
  }
  return { allowed: true, remainingCents: remaining, cartTotalCents: total };
}
