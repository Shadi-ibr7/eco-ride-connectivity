import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { stripe } from "../_shared/stripe.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { rideId, price, departure_city, arrival_city, success_url, cancel_url } = await req.json()

    // Vérification des paramètres requis
    if (!rideId || !price || !departure_city || !arrival_city) {
      throw new Error('Missing required parameters')
    }

    console.log('Creating checkout session for ride:', rideId)
    console.log('Price:', price)
    console.log('Route:', departure_city, '-', arrival_city)

    if (!Deno.env.get('STRIPE_SECRET_KEY')) {
      console.error('STRIPE_SECRET_KEY is not set')
      throw new Error('Stripe secret key is not configured')
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Trajet ${departure_city} - ${arrival_city}`,
              description: 'Réservation de covoiturage',
            },
            unit_amount: Math.round(price * 100), // Stripe expects amounts in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url,
      cancel_url: cancel_url,
    })

    console.log('Checkout session created:', session.id)

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})