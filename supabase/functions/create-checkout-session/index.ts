import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { stripe } from "../_shared/stripe.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { rideId, price, departure_city, arrival_city, success_url, cancel_url } = await req.json()

    console.log("Creating checkout session with params:", {
      rideId,
      price,
      departure_city,
      arrival_city,
      success_url,
      cancel_url
    })

    // Validate required fields
    if (!rideId || !departure_city || !arrival_city || !success_url || !cancel_url) {
      throw new Error("Missing required fields")
    }

    // Ensure price is a valid number and convert to cents for Stripe
    const amount = Math.round(Number(price) * 100)
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid price amount")
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Trajet de ${departure_city} à ${arrival_city}`,
              description: `Réservation de votre trajet en covoiturage`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        rideId,
        departure_city,
        arrival_city
      }
    })

    console.log("Checkout session created:", session.id)

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    )
  }
})