import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!stripeSecretKey) return null;
  if (!stripe) {
    stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-01-27.acacia" as any });
  }
  return stripe;
}

export function isStripeConfigured(): boolean {
  return !!stripeSecretKey;
}

export const STRIPE_PRICE_MAP: Record<string, { monthly: number; yearly: number }> = {
  professional: { monthly: 2900, yearly: 29000 },
  enterprise: { monthly: 9900, yearly: 99000 },
};
