import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { stripe } from "../_shared/stripe.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { rideId, price, departure_city, arrival_city } = await req.json()

    console.log("Creating checkout session with params:", {
      rideId,
      price,
      departure_city,
      arrival_city
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Trajet ${departure_city} → ${arrival_city}`,
              description: `Réservation du trajet de ${departure_city} à ${arrival_city}`,
              images: ["https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"],
            },
            unit_amount: Math.round(price * 100), // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/rides/${rideId}?success=true`,
      cancel_url: `${req.headers.get("origin")}/rides/${rideId}?canceled=true`,
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