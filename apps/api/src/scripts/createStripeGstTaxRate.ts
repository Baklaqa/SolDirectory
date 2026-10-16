import 'dotenv/config';
import Stripe from 'stripe';

/**
 * Creates the Stripe tax rate for GST (10%, added on top of the price) that checkout attaches to a plan, and prints its id.
 * Run it once, with the same STRIPE_SECRET_KEY the API uses (test key for testing, live key for production), then put the id in
 * STRIPE_GST_TAX_RATE_ID. It creates a new tax rate each time it runs, so keep the first id.
 *
 *   npx tsx src/scripts/createStripeGstTaxRate.ts
 */
async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) { console.error('STRIPE_SECRET_KEY is not set.'); process.exit(1); }
  const stripe = new Stripe(key);
  const rate = await stripe.taxRates.create({
    display_name: 'GST',
    description: 'Goods and services tax (Australia)',
    percentage: 10,
    inclusive: false,
    country: 'AU',
    jurisdiction: 'AU',
    tax_type: 'gst',
  });
  console.log(`Created ${key.startsWith('sk_live') ? 'LIVE' : 'test'} GST tax rate: ${rate.id}`);
  console.log(`Set STRIPE_GST_TAX_RATE_ID=${rate.id}`);
}

main().then(() => process.exit(0)).catch((err) => { console.error('[stripe-gst] Fatal error:', err.message); process.exit(1); });
