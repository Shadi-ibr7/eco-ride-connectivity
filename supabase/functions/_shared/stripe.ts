import Stripe from "https://esm.sh/stripe@12.8.0?target=deno"

if (!Deno.env.get('STRIPE_SECRET_KEY')) {
  console.error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})