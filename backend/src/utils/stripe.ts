import Stripe from 'stripe';

// Ensure key exists
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing from environment variables!');
}

// Initialize Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  maxNetworkRetries: 2, // Auto retry failed requests
});